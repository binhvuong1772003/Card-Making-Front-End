import { z } from "zod";

// Trang Phản hồi của chủ thiệp: đọc dữ liệu GraphQL (`cardForms`, `formResponses`) và vài cách hiện bảng. Phần gọi mạng ở
// `lib/cards/api.ts`; phần vẽ ở `components/cards/responses-page.tsx`. Hàm thuần để test được.
const fieldInfo = z.object({
  // GraphQL trả ID; với ô câu hỏi đó chính là mã ô (`name`, `attending`...).
  id: z.string(),
  label: z.string(),
  type: z.string(),
  options: z.array(z.string()),
});
export type ResponseColumn = z.infer<typeof fieldInfo>;

export const cardForm = z.object({
  blockId: z.string(),
  heading: z.string(),
  fields: z.array(fieldInfo),
  publicList: z.boolean(),
  moderation: z.boolean(),
  /** Khối không còn trong bản xuất bản nhưng vẫn còn câu trả lời. */
  removed: z.boolean(),
  total: z.number(),
  pending: z.number(),
});
export type CardForm = z.infer<typeof cardForm>;

export const responseStatus = z.enum(["VISIBLE", "HIDDEN", "PENDING"]);
export type ResponseStatus = z.infer<typeof responseStatus>;

const answer = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  value: z.unknown(),
});
export type StoredAnswer = z.infer<typeof answer>;

export const formResponse = z.object({
  id: z.string(),
  blockId: z.string(),
  // Bản xuất bản mà khách đã điền qua; null với phản hồi từ trước khi có nhiều bản.
  publicationId: z.string().nullable(),
  answers: z.array(answer),
  status: responseStatus,
  createdAt: z.string(),
});
export type FormResponse = z.infer<typeof formResponse>;

export const summaryView = z.object({
  fieldId: z.string(),
  label: z.string(),
  type: z.string(),
  answered: z.number(),
  counts: z.array(z.object({ option: z.string(), count: z.number() })),
  /** Tổng của ô số; null với loại khác. */
  total: z.number().nullable(),
});
export type SummaryView = z.infer<typeof summaryView>;

export const responsesPage = z.object({
  nodes: z.array(formResponse),
  pageInfo: z.object({ hasNextPage: z.boolean(), endCursor: z.string().nullable() }),
  summary: z.array(summaryView),
  counts: z.object({ visible: z.number(), hidden: z.number(), pending: z.number() }),
});
export type ResponsesPage = z.infer<typeof responsesPage>;

/** Giá trị một ô trong bảng: nhiều đáp án nối bằng "; ", có/không thành chữ Việt, thiếu thì để trống. */
export function answerText(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.map((item) => String(item)).join("; ");
  if (typeof value === "boolean") return value ? "Có" : "Không";
  return String(value);
}

// `dd/MM HH:mm` theo giờ Việt Nam, cùng múi giờ với tệp CSV: người xem ở nước ngoài vẫn thấy giờ thiệp Việt Nam.
const VN = new Intl.DateTimeFormat("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
const pad = (value: string) => value.padStart(2, "0");
export function sentAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const parts = Object.fromEntries(VN.formatToParts(date).map((part) => [part.type, part.value]));
  return `${pad(parts.day ?? "")}/${pad(parts.month ?? "")} ${pad(parts.hour ?? "")}:${pad(parts.minute ?? "")}`;
}

/** Một dòng tóm tắt của một câu hỏi: số theo phương án, tổng của ô số, hoặc số người đã trả lời. */
export function summaryLine(view: SummaryView): string {
  if (view.type === "number" && view.total !== null) return `Tổng: ${view.total}`;
  if (view.counts.length > 0) return view.counts.map((item) => `${item.option}: ${item.count}`).join(" · ");
  return `${view.answered} người đã trả lời`;
}

// Năm sắc nhạt cho chip đáp án; chọn theo nội dung để cùng một đáp án luôn cùng màu giữa các dòng.
export function chipTone(value: string): 0 | 1 | 2 | 3 | 4 {
  let hash = 0;
  for (const char of value) hash = (hash + char.codePointAt(0)!) % 997;
  return (hash % 5) as 0 | 1 | 2 | 3 | 4;
}

// Cột bảng: theo khai báo của form; form đã bị gỡ không còn khai báo nên lấy nhãn từ chính câu trả lời đã lưu.
export function columnsOf(form: CardForm | undefined, rows: readonly FormResponse[]): ResponseColumn[] {
  if (form && !form.removed && form.fields.length > 0) return form.fields;
  const seen = new Map<string, ResponseColumn>();
  for (const row of rows) {
    for (const item of row.answers) {
      if (seen.has(item.id)) continue;
      seen.set(item.id, { id: item.id, label: item.label, type: item.type, options: [] });
    }
  }
  return [...seen.values()];
}

/** Ô câu hỏi trong bảng có phải loại nên tô chip không (đáp án ngắn, đếm được). */
export function isChipType(type: string): boolean {
  return type === "choice" || type === "yesno";
}

/** Giá trị của bộ lọc liên kết khi không lọc. */
export const ALL_LINKS = "ALL";

/** Tên một liên kết (bản xuất bản) để hiện cho chủ thiệp: tên bản, không có thì slug. */
export const linkName = (version: { label: string | null; slug: string }): string => version.label || version.slug;

/** Liên kết mà một câu trả lời đến từ: tên bản; bản đã gỡ thì "Bản đã gỡ"; phản hồi cũ chưa ghi bản thì "—". */
export function linkOfResponse(publicationId: string | null, versions: { id: string; label: string | null; slug: string }[]): string {
  if (!publicationId) return "—";
  const version = versions.find((item) => item.id === publicationId);
  return version ? linkName(version) : "Bản đã gỡ";
}
