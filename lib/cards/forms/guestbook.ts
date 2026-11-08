import { z } from "zod";
import { requestJson, type FieldErrors } from "./api";

// Phần tính thuần của Sổ lưu bút: kiểm đầu vào như `responses.schema.ts` của CMBE, gửi lời chúc và tải danh sách. Không React để test được.
// Backend vẫn là nơi quyết định cuối cùng.
export interface GuestbookValues {
  name: string;
  message: string;
}

export function validateGuestbook(values: GuestbookValues): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  const message = values.message.trim();
  if (!name) errors.name = "Nhập tên của bạn.";
  else if (name.length > 60) errors.name = "Tên dài quá 60 ký tự.";
  if (!message) errors.message = "Nhập lời chúc.";
  else if (message.length > 500) errors.message = "Lời chúc dài quá 500 ký tự.";
  return errors;
}

// Lời chúc công khai: chỉ tên, lời và thời gian, không có trạng thái hay mã người gửi.
const entry = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string(),
  createdAt: z.string(),
});
export type GuestbookEntry = z.infer<typeof entry>;

const submitted = z.object({
  id: z.string(),
  status: z.enum(["VISIBLE", "PENDING"]),
  entry: entry.nullable(),
});
export type GuestbookSubmitResult = z.infer<typeof submitted>;

const page = z.object({
  entries: z.array(entry),
  nextCursor: z.string().nullable(),
  total: z.number(),
});
export type GuestbookPage = z.infer<typeof page>;

export interface GuestbookSubmission {
  slug: string;
  blockId: string;
  name: string;
  message: string;
}

export async function submitGuestbook(input: GuestbookSubmission, fetchImpl: typeof fetch = fetch): Promise<GuestbookSubmitResult> {
  const data = await requestJson<unknown>(
    `/publications/${encodeURIComponent(input.slug)}/guestbook`,
    { method: "POST", body: JSON.stringify({ blockId: input.blockId, name: input.name, message: input.message, website: "" }) },
    fetchImpl,
  );
  return submitted.parse(data);
}

export interface GuestbookRequest {
  slug: string;
  blockId: string;
  first: number;
  after?: string;
}

export async function fetchGuestbook(input: GuestbookRequest, fetchImpl: typeof fetch = fetch): Promise<GuestbookPage> {
  const query = new URLSearchParams({ blockId: input.blockId, first: String(input.first) });
  if (input.after) query.set("after", input.after);
  const data = await requestJson<unknown>(
    `/publications/${encodeURIComponent(input.slug)}/guestbook?${query.toString()}`,
    { method: "GET" },
    fetchImpl,
  );
  return page.parse(data);
}
