import { builtInRegistry, type ComponentDef } from "@miditor/core";

// Giờ Việt Nam là UTC+7 quanh năm: đổi giờ nhập sang UTC bằng cách trừ 7 giờ nên khách ở múi giờ nào cũng đếm tới cùng một lúc.
const VN_OFFSET_HOURS = 7;

/** Mốc đếm tới (ms), từ ngày "YYYY-MM-DD" và giờ "HH:mm" theo giờ Việt Nam; undefined khi ngày không hợp lệ. */
export function countdownTarget(date: unknown, time: unknown): number | undefined {
  if (typeof date !== "string") return undefined;
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!day) return undefined;
  const clock = typeof time === "string" ? /^(\d{2}):(\d{2})$/.exec(time) : null;
  const hour = clock ? Number(clock[1]) : 0;
  const minute = clock ? Number(clock[2]) : 0;
  if (hour > 23 || minute > 59) return undefined;
  const ms = Date.UTC(Number(day[1]), Number(day[2]) - 1, Number(day[3]), hour - VN_OFFSET_HOURS, minute);
  return Number.isFinite(ms) ? ms : undefined;
}

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

/** Phần còn lại tới mốc; quá mốc thì về 0 và `done`. */
export function countdownParts(target: number, now: number): CountdownParts {
  const left = Math.max(0, Math.floor((target - now) / 1000));
  return { days: Math.floor(left / 86400), hours: Math.floor((left % 86400) / 3600), minutes: Math.floor((left % 3600) / 60), seconds: left % 60, done: target <= now };
}

export const COUNTDOWN_ALIGNS = ["left", "center", "right"] as const;

export const countdownBlock: ComponentDef = {
  label: "Đếm ngược",
  category: "Thiệp cưới",
  icon: "timer",
  keywords: ["đếm ngược", "countdown", "còn bao nhiêu ngày", "ngày cưới", "thời gian"],
  size: { w: 360, h: 44 },
  canContain: false,
  defaultProps: {
    date: "2027-01-04",
    time: "17:30",
    showSeconds: true,
    dayLabel: "ngày",
    hourLabel: "giờ",
    minuteLabel: "phút",
    secondLabel: "giây",
    doneText: "Đến ngày vui rồi!",
    size: 27,
    color: "#511419",
    font: "",
    bold: true,
    align: "center",
  },
  fields: {
    date: { type: "custom", kind: "date", label: "Ngày", group: "Mốc đếm" },
    time: { type: "custom", kind: "time", label: "Giờ", group: "Mốc đếm", help: "Giờ Việt Nam. Để trống thì đếm tới 0 giờ." },
    showSeconds: { type: "boolean", label: "Hiện giây", group: "Mốc đếm" },
    dayLabel: { type: "text", label: "Chữ ngày", maxLength: 12, group: "Nhãn" },
    hourLabel: { type: "text", label: "Chữ giờ", maxLength: 12, group: "Nhãn" },
    minuteLabel: { type: "text", label: "Chữ phút", maxLength: 12, group: "Nhãn" },
    secondLabel: { type: "text", label: "Chữ giây", maxLength: 12, group: "Nhãn" },
    doneText: { type: "text", label: "Chữ khi tới ngày", maxLength: 60, group: "Nhãn" },
    size: { type: "number", label: "Cỡ chữ", min: 10, max: 96, unit: "px", group: "Chữ" },
    color: { type: "color", label: "Màu chữ", group: "Chữ" },
    font: builtInRegistry.Text!.fields.font ?? { type: "font", label: "Phông chữ", group: "Chữ" },
    bold: { type: "boolean", label: "Chữ đậm", group: "Chữ" },
    align: { type: "select", label: "Căn lề", options: COUNTDOWN_ALIGNS, group: "Chữ" },
  },
};
