import { requestJson, type FieldErrors } from "./api";

// Phần tính thuần của form Xác nhận tham dự: kiểm đầu vào như `responses.schema.ts` của CMBE và biết hạn đóng form. Không React để test
// được và để view giữ phần vẽ. Backend vẫn là nơi quyết định cuối cùng; phần này chỉ báo lỗi sớm cho khách.
export type RsvpAnswer = "YES" | "NO" | "MAYBE";

export interface RsvpConfig {
  askGuests: boolean;
  askPhone: boolean;
  askNote: boolean;
  askMaybe: boolean;
  maxGuests: number;
}

export interface RsvpValues {
  name: string;
  attending: RsvpAnswer | null;
  guests?: number;
  phone?: string;
  note?: string;
}

// Hết ngày hạn theo giờ Việt Nam (UTC+7), giống `isClosed` của CMBE. Ngày không có thật coi như không có hạn.
export function isClosed(deadline: string, now: Date): boolean {
  if (!deadline) return false;
  const [year, month, day] = deadline.split("-").map(Number) as [number, number, number];
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return false;
  return now.getTime() > Date.UTC(year, month - 1, day, 16, 59, 59, 999);
}

const PHONE = /^[0-9+().\-\s]+$/;

export function validateRsvp(values: RsvpValues, config: RsvpConfig): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Nhập tên của bạn.";
  else if (name.length > 100) errors.name = "Tên dài quá 100 ký tự.";

  if (!values.attending) errors.attending = "Chọn một câu trả lời.";
  else if (values.attending === "MAYBE" && !config.askMaybe) errors.attending = "Chọn Có hoặc Không đến.";

  // Số khách chỉ có nghĩa khi khách chọn Có và khối có hỏi.
  if (values.attending === "YES" && config.askGuests) {
    const guests = values.guests ?? 1;
    if (!Number.isInteger(guests) || guests < 1 || guests > config.maxGuests) errors.guests = `Số khách từ 1 đến ${config.maxGuests}.`;
  }

  const note = values.note?.trim() ?? "";
  if (config.askNote && note.length > 500) errors.note = "Lời nhắn dài quá 500 ký tự.";

  // Điện thoại là ô tuỳ chọn: bỏ trống được, nhưng nếu điền thì phải đúng dạng backend nhận. Chỉ kiểm khi ô đang hiện
  // (Có hoặc Chưa chắc), kẻo khách bị chặn bởi một lỗi ở ô đã ẩn sau khi đổi đáp án.
  const phone = values.phone?.trim() ?? "";
  if (config.askPhone && (values.attending === "YES" || values.attending === "MAYBE") && phone && (!PHONE.test(phone) || phone.length < 6 || phone.length > 20)) {
    errors.phone = "Số điện thoại chưa đúng.";
  }

  return errors;
}

// Phần trả lời đi kèm, chỉ gồm những ô khách đã thấy với đáp án đã chọn: đổi từ Có sang Không thì số khách và điện thoại đã gõ
// không được gửi lén.
export function rsvpAnswer(values: RsvpValues, config: RsvpConfig): { guests?: number; phone?: string; note?: string } {
  const yes = values.attending === "YES";
  return {
    guests: yes && config.askGuests ? (values.guests ?? 1) : undefined,
    phone: config.askPhone && values.attending !== "NO" ? values.phone?.trim() || undefined : undefined,
    note: config.askNote ? values.note?.trim() || undefined : undefined,
  };
}

export interface RsvpSubmission {
  slug: string;
  blockId: string;
  name: string;
  attending: RsvpAnswer;
  guests?: number;
  phone?: string;
  note?: string;
}

// Ô ẩn chống thư rác luôn gửi chuỗi rỗng: máy điền mới điền vào đó, người thật không thấy.
export const submitRsvp = (input: RsvpSubmission, fetchImpl: typeof fetch = fetch): Promise<{ id: string }> =>
  requestJson<{ id: string }>(
    `/publications/${encodeURIComponent(input.slug)}/rsvps`,
    {
      method: "POST",
      body: JSON.stringify({
        blockId: input.blockId,
        name: input.name,
        attending: input.attending,
        ...(input.guests === undefined ? {} : { guests: input.guests }),
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.note ? { note: input.note } : {}),
        website: "",
      }),
    },
    fetchImpl,
  );
