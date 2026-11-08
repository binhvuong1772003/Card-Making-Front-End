import { z } from "zod";
import { ApiError } from "@/lib/api/errors";
import { requestJson } from "./api";
import type { Answers, AnswerErrors, Field } from "./fields";

// Gửi câu trả lời của khối Form lên CMBE và tải sổ công khai. Hàm thuần (nhận `fetch` tiêm vào) để test được; phần vẽ ở
// `components/blocks/form-view.tsx`. Backend đã kiểm lại mọi câu trả lời, phần này chỉ để khách thấy lỗi ngay.
const entry = z.object({
  id: z.string(),
  name: z.string(),
  text: z.string(),
  createdAt: z.string(),
});
export type FormEntry = z.infer<typeof entry>;

const submitted = z.object({
  id: z.string(),
  status: z.enum(["VISIBLE", "PENDING", "HIDDEN"]),
  entry: entry.nullable(),
});
export type FormSubmitResult = z.infer<typeof submitted>;

const page = z.object({
  entries: z.array(entry),
  nextCursor: z.string().nullable(),
  total: z.number(),
});
export type FormEntryPage = z.infer<typeof page>;

export interface FormSubmission {
  slug: string;
  blockId: string;
  answers: Answers;
  /** Ô ẩn chống thư rác: người thật không thấy nên luôn gửi rỗng. */
  website?: string;
}

export async function submitForm(input: FormSubmission, fetchImpl: typeof fetch = fetch): Promise<FormSubmitResult> {
  const data = await requestJson<unknown>(
    `/publications/${encodeURIComponent(input.slug)}/forms`,
    {
      method: "POST",
      body: JSON.stringify({ blockId: input.blockId, answers: input.answers, website: input.website ?? "" }),
    },
    fetchImpl,
  );
  return submitted.parse(data);
}

export interface FormEntriesRequest {
  slug: string;
  blockId: string;
  first: number;
  after?: string;
}

export async function fetchEntries(input: FormEntriesRequest, fetchImpl: typeof fetch = fetch): Promise<FormEntryPage> {
  const query = new URLSearchParams({ blockId: input.blockId, first: String(input.first) });
  if (input.after) query.set("after", input.after);
  const data = await requestJson<unknown>(`/publications/${encodeURIComponent(input.slug)}/forms/entries?${query.toString()}`, { method: "GET" }, fetchImpl);
  return page.parse(data);
}

// Lỗi 400 của CMBE mang `details` là `[{ path: mã ô, message: câu tiếng Anh }]`. Chỉ lấy mã ô (để hiện đúng dưới ô đó) và
// dùng câu tiếng Việt của mình; câu của backend có thể đổi mà giao diện thì không nên đổi theo.
export function serverFieldErrors(err: unknown, fields: readonly Field[]): AnswerErrors {
  if (!(err instanceof ApiError) || err.code !== "VALIDATION" || !Array.isArray(err.details)) return {};
  const errors: AnswerErrors = {};
  for (const item of err.details as Array<{ path?: unknown }>) {
    const path = item?.path;
    if (typeof path === "string" && fields.some((field) => field.id === path)) errors[path] = "Chưa đúng, bạn kiểm tra lại.";
  }
  return errors;
}
