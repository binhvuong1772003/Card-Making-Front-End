import { z } from "zod";

// Phần của trang quản lý khách (`/cards/[id]/guests`): dạng dữ liệu từ CMBE và các hàm thuần (đọc danh sách dán, dựng link, CSV).
export const guestRow = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  greeting: z.string().nullable(),
  inviteMessage: z.string().nullable(),
  openCount: z.number().int(),
  firstOpenedAt: z.string().nullable(),
  lastOpenedAt: z.string().nullable(),
  responded: z.boolean(),
  createdAt: z.string(),
});
export type GuestRow = z.infer<typeof guestRow>;

export interface GuestDraft {
  name: string;
  greeting?: string;
  inviteMessage?: string;
}

/** Giới hạn của CMBE (`guests.schema.ts`): mỗi lần thêm tối đa 200 khách, tên 80 ký tự, lời chào 200, lời mời 400. */
export const MAX_PER_REQUEST = 200;
export const NAME_MAX = 80;
export const GREETING_MAX = 200;
export const INVITE_MAX = 400;

/**
 * Đọc danh sách dán vào: mỗi dòng một khách, "Tên" hoặc "Tên | lời chào" hoặc "Tên | lời chào | lời mời"; dòng trống bỏ qua.
 * Trả những khách đọc được, số dòng bị bỏ vì tên rỗng hoặc quá dài, và số khách vượt giới hạn mỗi lần.
 */
export function parseGuestLines(input: string): { guests: GuestDraft[]; skipped: number; overflow: number } {
  const guests: GuestDraft[] = [];
  let skipped = 0;
  for (const raw of input.split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const [name = "", greeting = "", invite = ""] = raw.split("|").map((part) => part.trim());
    if (!name || name.length > NAME_MAX || greeting.length > GREETING_MAX || invite.length > INVITE_MAX) {
      skipped += 1;
      continue;
    }
    guests.push({ name, ...(greeting ? { greeting } : {}), ...(invite ? { inviteMessage: invite } : {}) });
  }
  return { guests: guests.slice(0, MAX_PER_REQUEST), skipped, overflow: Math.max(0, guests.length - MAX_PER_REQUEST) };
}

/** Link riêng của một khách: `<origin>/thiep/<slug>?g=<mã>`. */
export function guestLink(origin: string, slug: string, code: string): string {
  return `${origin.replace(/\/$/, "")}/thiep/${encodeURIComponent(slug)}?g=${encodeURIComponent(code)}`;
}

const csvCell = (value: string): string => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** Tệp "Tên, Link" để gửi hàng loạt; ô bắt đầu bằng = + - @ được chặn bằng dấu nháy để bảng tính không chạy nó như công thức. */
export function guestsCsv(guests: Pick<GuestRow, "name" | "code" | "greeting">[], linkFor: (code: string) => string): string {
  const safe = (value: string) => (/^[=+\-@\t\r]/.test(value) ? `'${value}` : value);
  const lines = [["Tên", "Link", "Lời chào"].join(","), ...guests.map((guest) => [csvCell(safe(guest.name)), csvCell(linkFor(guest.code)), csvCell(safe(guest.greeting ?? ""))].join(","))];
  return `﻿${lines.join("\r\n")}\r\n`;
}

/** "Chưa mở" hoặc "N lần, lần cuối <ngày giờ>". */
export function openedLabel(guest: Pick<GuestRow, "openCount" | "lastOpenedAt">): string {
  if (!guest.openCount || !guest.lastOpenedAt) return "Chưa mở";
  const date = new Date(guest.lastOpenedAt);
  const when = Number.isNaN(date.getTime()) ? "" : `, lần cuối ${date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`;
  return `${guest.openCount} lần${when}`;
}
