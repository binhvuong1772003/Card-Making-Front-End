// Dịp của thiệp (khớp enum CardOccasion của backend). Màu ảnh thu nhỏ theo bản vẽ: màu của dịp chỉ nằm trong ảnh thiệp.
export type Occasion = "WEDDING" | "BIRTHDAY" | "EVENT" | "OTHER";

export const OCCASION_LABEL: Record<Occasion, string> = {
  WEDDING: "Đám cưới",
  BIRTHDAY: "Sinh nhật",
  EVENT: "Sự kiện",
  OTHER: "Khác",
};

// Ba dịp chính dùng cho chip lọc; OTHER chỉ xuất hiện trong "Tất cả".
export const FILTER_OCCASIONS: readonly Occasion[] = ["WEDDING", "BIRTHDAY", "EVENT"];

export const THUMB_TONE: Record<Occasion, { bg: string; ink: string }> = {
  WEDDING: { bg: "#EEF1EA", ink: "#4B5A3F" },
  BIRTHDAY: { bg: "#FFF0D2", ink: "#5A3A12" },
  EVENT: { bg: "#1F2A44", ink: "#FFFFFF" },
  OTHER: { bg: "#F4E6E9", ink: "#7B1E2B" },
};

// Đường dẫn của trang một loại thiệp: /kham-pha/<slug>. OTHER không có trang riêng.
const SLUG: Partial<Record<Occasion, string>> = { WEDDING: "dam-cuoi", BIRTHDAY: "sinh-nhat", EVENT: "su-kien" };

export const occasionSlug = (occasion: Occasion): string => SLUG[occasion] ?? "";

export function occasionFromSlug(slug: string): Occasion | undefined {
  return FILTER_OCCASIONS.find((occasion) => SLUG[occasion] === slug);
}
