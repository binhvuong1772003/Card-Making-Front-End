import { builtInRegistry, type ComponentDef } from "@miditor/core";

// Khối "Khách mời": chữ lấy từ khách đang mở link riêng (`metadata.guest`, xem `components/cards/use-guest-metadata.ts`), đặt ở trang nào cũng được.
export const GUEST_FIELDS = ["Tên khách", "Lời chào riêng", "Lời mời riêng"] as const;
export type GuestField = (typeof GUEST_FIELDS)[number];
export const GUEST_ALIGNS = ["left", "center", "right"] as const;

// Chữ mẫu ở editor, xem thử và ảnh thu nhỏ: chủ thiệp thấy bố cục mà không cần khách thật.
export const GUEST_SAMPLE = { name: "Anh Nam", greeting: "Rất mong anh chị đến chung vui cùng gia đình chúng tôi.", inviteMessage: "Trân trọng kính mời anh chị đến dự lễ cưới của chúng tôi." } as const;

interface GuestMetadata {
  mode?: unknown;
  guest?: { name?: unknown; greeting?: unknown; inviteMessage?: unknown };
}

const asText = (value: unknown): string => (typeof value === "string" ? value : "");

/**
 * Chữ khối cần hiện. Có khách: tên (kèm chữ đứng trước), lời chào hoặc lời mời của khách (rỗng thì dùng chữ dự phòng).
 * Trang công khai không có khách: chữ dự phòng, rỗng thì ẩn khối. Nơi khác (editor, xem thử): chữ mẫu.
 */
export function guestLine(props: Record<string, unknown>, metadata: unknown): string {
  const field = GUEST_FIELDS.includes(props.field as GuestField) ? (props.field as GuestField) : "Tên khách";
  const prefix = asText(props.prefix).trim();
  const fallback = asText(props.fallback);
  const meta = (metadata && typeof metadata === "object" ? metadata : {}) as GuestMetadata;
  const withPrefix = (value: string) => (field === "Tên khách" && prefix ? `${prefix} ${value}` : value);

  if (meta.guest) {
    const value = field === "Tên khách" ? asText(meta.guest.name) : field === "Lời chào riêng" ? asText(meta.guest.greeting) : asText(meta.guest.inviteMessage);
    return value ? withPrefix(value) : fallback;
  }
  if (meta.mode === "live") return fallback;
  return withPrefix(field === "Tên khách" ? GUEST_SAMPLE.name : field === "Lời chào riêng" ? GUEST_SAMPLE.greeting : GUEST_SAMPLE.inviteMessage);
}

export const guestTextBlock: ComponentDef = {
  label: "Khách mời",
  category: "Thiệp cưới",
  icon: "user",
  keywords: ["khách mời", "tên khách", "thân mời", "lời chào", "lời mời", "guest"],
  size: { w: 320, h: 36 },
  canContain: false,
  defaultProps: {
    field: "Tên khách",
    prefix: "Thân mời",
    fallback: "Thân mời",
    size: 18,
    color: "#511419",
    font: "",
    bold: false,
    italic: false,
    align: "center",
  },
  fields: {
    field: { type: "select", label: "Hiện", options: GUEST_FIELDS, group: "Khách mời", help: "Tên, lời chào hay lời mời của khách đang mở link riêng. Ở editor và xem thử hiện chữ mẫu." },
    prefix: { type: "text", label: "Chữ đứng trước tên", maxLength: 30, group: "Khách mời", help: "Ví dụ \"Thân mời\" thành \"Thân mời Anh Nam\". Chỉ dùng khi hiện tên." },
    fallback: { type: "text", label: "Chữ khi không có khách", maxLength: 200, group: "Khách mời", help: "Hiện khi thiệp mở bằng link chung (không phải link riêng). Để trống thì khối ẩn đi." },
    size: { type: "number", label: "Cỡ chữ", min: 8, max: 96, unit: "px", group: "Chữ" },
    color: { type: "color", label: "Màu chữ", group: "Chữ" },
    font: builtInRegistry.Text!.fields.font ?? { type: "font", label: "Phông chữ", group: "Chữ" },
    bold: { type: "boolean", label: "Chữ đậm", group: "Chữ" },
    italic: { type: "boolean", label: "Chữ nghiêng", group: "Chữ" },
    align: { type: "select", label: "Căn lề", options: GUEST_ALIGNS, group: "Chữ" },
  },
};
