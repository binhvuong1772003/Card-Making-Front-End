import { describe, expect, it } from "vitest";
import { eventSpan, googleCalendarUrl, icsFileName, icsText, type CalendarEvent } from "./calendar-event";

const wedding: CalendarEvent = { date: "2026-07-30", time: "18:00", minutes: 180, title: "Tiệc cưới Hải Nam & Khánh Linh", place: "Gala Center, 415 Hoàng Văn Thụ", note: "Khai tiệc 18:00" };
const NOW = new Date(Date.UTC(2026, 6, 1, 3, 4, 5));

describe("event span", () => {
  it("turns the Vietnam time into UTC", () => {
    const span = eventSpan(wedding)!;
    expect(span.allDay).toBe(false);
    expect(span.start.toISOString()).toBe("2026-07-30T11:00:00.000Z");
    expect(span.end.toISOString()).toBe("2026-07-30T14:00:00.000Z");
  });

  it("starts the day before in UTC for a time before 07:00, and runs past midnight", () => {
    expect(eventSpan({ ...wedding, time: "05:30" })!.start.toISOString()).toBe("2026-07-29T22:30:00.000Z");
    // 22:00 giờ VN là 15:00 UTC; thêm 4 giờ là 19:00 UTC, tức 02:00 sáng hôm sau giờ VN.
    expect(eventSpan({ ...wedding, time: "22:00", minutes: 240 })!.end.toISOString()).toBe("2026-07-30T19:00:00.000Z");
  });

  it("is an all day event without a valid time, and keeps the length between 15 minutes and a day", () => {
    for (const time of ["", "25:00", "6:30", "abc"]) expect(eventSpan({ ...wedding, time })!.allDay).toBe(true);
    expect(eventSpan({ ...wedding, minutes: 1 })!.end.getTime() - eventSpan({ ...wedding, minutes: 1 })!.start.getTime()).toBe(15 * 60 * 1000);
    expect(eventSpan({ ...wedding, minutes: 99999 })!.end.getTime() - eventSpan({ ...wedding, minutes: 99999 })!.start.getTime()).toBe(24 * 60 * 60 * 1000);
    expect(eventSpan({ ...wedding, minutes: Number.NaN })!.end.toISOString()).toBe("2026-07-30T14:00:00.000Z");
  });

  it("is none for an empty or impossible date", () => {
    for (const date of ["", "2026-02-30", "30/07/2026", "2026-13-01"]) expect(eventSpan({ ...wedding, date })).toBeNull();
  });
});

describe("Google Calendar link", () => {
  it("fills the title, the time in UTC, the place and the note", () => {
    const url = new URL(googleCalendarUrl(wedding)!);
    expect(url.origin + url.pathname).toBe("https://calendar.google.com/calendar/render");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe("Tiệc cưới Hải Nam & Khánh Linh");
    expect(url.searchParams.get("dates")).toBe("20260730T110000Z/20260730T140000Z");
    expect(url.searchParams.get("location")).toBe("Gala Center, 415 Hoàng Văn Thụ");
    expect(url.searchParams.get("details")).toBe("Khai tiệc 18:00");
  });

  it("uses date-only values for an all day event, leaves out the empty fields and names an untitled event", () => {
    const url = new URL(googleCalendarUrl({ date: "2026-07-30", time: "", minutes: 180, title: "  ", place: "", note: "" })!);
    expect(url.searchParams.get("dates")).toBe("20260730/20260731");
    expect(url.searchParams.get("text")).toBe("Sự kiện");
    expect(url.searchParams.has("location")).toBe(false);
    expect(url.searchParams.has("details")).toBe(false);
  });

  it("is null when the date is not usable", () => {
    expect(googleCalendarUrl({ ...wedding, date: "" })).toBeNull();
  });
});

describe("ics file", () => {
  const text = icsText(wedding, NOW)!;
  const lines = text.split("\r\n");

  it("is a calendar with one event in UTC, ending with a line break", () => {
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("BEGIN:VEVENT");
    expect(lines).toContain("DTSTART:20260730T110000Z");
    expect(lines).toContain("DTEND:20260730T140000Z");
    expect(lines).toContain("DTSTAMP:20260701T030405Z");
    expect(lines).toContain("END:VCALENDAR");
    expect(text.endsWith("\r\n")).toBe(true);
    expect(text.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it("escapes the characters the format reserves and keeps accents", () => {
    const custom = icsText({ ...wedding, title: "A, B; C \\ D", note: "Dòng 1\nDòng 2" }, NOW)!;
    expect(custom).toContain("SUMMARY:A\\, B\; C \\\\ D");
    expect(custom).toContain("DESCRIPTION:Dòng 1\\nDòng 2");
  });

  it("cannot be broken out of by a title with line breaks", () => {
    const custom = icsText({ ...wedding, title: "Tiệc\r\nEND:VEVENT\r\nBEGIN:VEVENT", place: "x\nBEGIN:VALARM" }, NOW)!;
    expect(custom.split("\r\n").filter((line) => line === "BEGIN:VEVENT")).toHaveLength(1);
    expect(custom).not.toContain("\nBEGIN:VALARM");
  });

  it("folds long lines at 75 bytes without cutting a character", () => {
    const long = icsText({ ...wedding, note: "Đ".repeat(120) }, NOW)!;
    const encoder = new TextEncoder();
    for (const line of long.split("\r\n")) expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    // Gỡ gập dòng thì ra đúng nội dung ban đầu.
    expect(long.replace(/\r\n /g, "")).toContain(`DESCRIPTION:${"Đ".repeat(120)}`);
  });

  it("uses date values for an all day event and gives the same id to the same event", () => {
    const day = icsText({ ...wedding, time: "" }, NOW)!;
    expect(day).toContain("DTSTART;VALUE=DATE:20260730");
    expect(day).toContain("DTEND;VALUE=DATE:20260731");
    const uid = (value: string) => /UID:(.+)\r\n/.exec(value)![1];
    expect(uid(icsText(wedding, NOW)!)).toBe(uid(icsText(wedding, new Date())!));
    expect(uid(icsText({ ...wedding, title: "Khác" }, NOW)!)).not.toBe(uid(icsText(wedding, NOW)!));
  });

  it("is null when the date is not usable", () => {
    expect(icsText({ ...wedding, date: "2026-02-30" })).toBeNull();
  });

  it("names the file after the title without accents", () => {
    expect(icsFileName("Tiệc cưới Hải Nam & Khánh Linh")).toBe("tiec-cuoi-hai-nam-khanh-linh.ics");
    expect(icsFileName("!!!")).toBe("su-kien.ics");
  });
});
