// Sự kiện để khách thêm vào lịch của mình: liên kết Google Calendar (mở trang tạo sự kiện đã điền sẵn, không cần đăng nhập hay khoá API) và
// tệp .ics cho Apple Calendar, Outlook. Giờ của thiệp là giờ Việt Nam (UTC+7, không có giờ mùa hè) nên đổi sang UTC bằng cách trừ 7 giờ,
// nhờ đó máy khách ở múi giờ nào cũng hiện đúng giờ. Không có giờ thì là sự kiện cả ngày. Chỉ hàm thuần: không đụng DOM.
export interface CalendarEvent {
  /** Ngày "YYYY-MM-DD" (cùng ngày với khối Lịch). */
  date: string;
  /** Giờ bắt đầu "HH:mm"; rỗng hoặc sai dạng là sự kiện cả ngày. */
  time: string;
  /** Kéo dài bao nhiêu phút (15 đến 1440); chỉ dùng khi có giờ. */
  minutes: number;
  title: string;
  place: string;
  note: string;
}

const VN_OFFSET_MINUTES = 7 * 60;
export const MIN_MINUTES = 15;
export const MAX_MINUTES = 24 * 60;
const DEFAULT_TITLE = "Sự kiện";

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

// Bỏ ký tự điều khiển (kể cả xuống dòng khỏi tiêu đề và địa điểm) để không phá dòng của tệp .ics.
const clean = (value: string, keepNewlines = false): string =>
  value.replace(keepNewlines ? /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, " ").replace(/\r\n?/g, "\n").trim();

function dayOf(date: string): Date | null {
  const found = DATE.exec(date);
  if (!found) return null;
  const [year, month, day] = [Number(found[1]), Number(found[2]), Number(found[3])];
  const probe = new Date(Date.UTC(year, month - 1, day));
  return probe.getUTCFullYear() === year && probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day ? probe : null;
}

export interface EventSpan {
  allDay: boolean;
  /** Cả ngày: ngày bắt đầu (UTC 00:00) và ngày kế tiếp (hạn cuối loại trừ). Có giờ: thời điểm bắt đầu và kết thúc. */
  start: Date;
  end: Date;
}

export function eventSpan(event: Pick<CalendarEvent, "date" | "time" | "minutes">): EventSpan | null {
  const day = dayOf(event.date);
  if (!day) return null;
  const time = TIME.exec(event.time);
  if (!time) return { allDay: true, start: day, end: new Date(day.getTime() + 24 * 60 * 60 * 1000) };
  const minutes = Number.isFinite(event.minutes) ? Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(event.minutes))) : 180;
  const start = new Date(day.getTime() + (Number(time[1]) * 60 + Number(time[2]) - VN_OFFSET_MINUTES) * 60 * 1000);
  return { allDay: false, start, end: new Date(start.getTime() + minutes * 60 * 1000) };
}

const pad = (value: number, size = 2) => String(value).padStart(size, "0");
const dayStamp = (date: Date) => `${pad(date.getUTCFullYear(), 4)}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
const utcStamp = (date: Date) => `${dayStamp(date)}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
const range = (span: EventSpan) => (span.allDay ? `${dayStamp(span.start)}/${dayStamp(span.end)}` : `${utcStamp(span.start)}/${utcStamp(span.end)}`);

/** Liên kết mở Google Calendar với sự kiện điền sẵn; null khi ngày sai hoặc trống. */
export function googleCalendarUrl(event: CalendarEvent): string | null {
  const span = eventSpan(event);
  if (!span) return null;
  const params = new URLSearchParams({ action: "TEMPLATE", text: clean(event.title) || DEFAULT_TITLE, dates: range(span) });
  const note = clean(event.note, true);
  const place = clean(event.place);
  if (note) params.set("details", note);
  if (place) params.set("location", place);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Theo RFC 5545: dấu gạch chéo ngược, chấm phẩy, phẩy và xuống dòng phải được thoát.
const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// Mỗi dòng tối đa 75 byte, dòng dài gập bằng CRLF và một dấu cách; không cắt giữa một ký tự nhiều byte (tiếng Việt có dấu).
function fold(line: string): string {
  const encoder = new TextEncoder();
  const lines: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    const limit = lines.length === 0 ? 75 : 74; // dòng nối tiếp mất một byte cho dấu cách đầu
    if (bytes + size > limit) {
      lines.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  lines.push(current);
  return lines.map((part, index) => (index === 0 ? part : ` ${part}`)).join("\r\n");
}

// Mã sự kiện cố định theo nội dung: thêm hai lần cùng sự kiện thì lịch của khách nhận ra là một.
function uidOf(event: CalendarEvent): string {
  let hash = 5381;
  for (const char of `${event.date}|${event.time}|${event.title}`) hash = ((hash << 5) + hash + char.codePointAt(0)!) >>> 0;
  return `${event.date.replace(/-/g, "")}-${hash.toString(16)}@cardmaking`;
}

/** Nội dung tệp .ics (CRLF, UTC); null khi ngày sai hoặc trống. `now` chỉ để test. */
export function icsText(event: CalendarEvent, now: Date = new Date()): string | null {
  const span = eventSpan(event);
  if (!span) return null;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CardMaking//Thiep//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uidOf(event)}`,
    `DTSTAMP:${utcStamp(now)}`,
    span.allDay ? `DTSTART;VALUE=DATE:${dayStamp(span.start)}` : `DTSTART:${utcStamp(span.start)}`,
    span.allDay ? `DTEND;VALUE=DATE:${dayStamp(span.end)}` : `DTEND:${utcStamp(span.end)}`,
    `SUMMARY:${escapeText(clean(event.title) || DEFAULT_TITLE)}`,
  ];
  const place = clean(event.place);
  const note = clean(event.note, true);
  if (place) lines.push(`LOCATION:${escapeText(place)}`);
  if (note) lines.push(`DESCRIPTION:${escapeText(note)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/** Tên tệp .ics: tiêu đề bỏ dấu, chữ thường, gạch nối; không có thì "su-kien". */
export function icsFileName(title: string): string {
  const base = title
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return `${base || "su-kien"}.ics`;
}
