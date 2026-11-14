import { builtInRegistry, type ComponentDef } from "@miditor/core";

// Khối "Chữ cong": chữ chạy theo một cung (đỉnh cung hướng lên khi Độ cong dương). Là khối riêng vì Miditor tự vẽ khối Chữ có sẵn,
// nên hiệu ứng "chữ cong" gắn vào khối Chữ chỉ có trong editor; khối riêng này được CardMaking vẽ cả ở trang thật.
export const CURVE_LIMITS = { amount: { min: -100, max: 100 }, size: { min: 8, max: 120 } } as const;

export const curvedTextBlock: ComponentDef = {
  label: "Chữ cong",
  category: "Chữ",
  icon: "text",
  keywords: ["chữ cong", "cung", "vòm", "uốn", "love never fails"],
  size: { w: 320, h: 100 },
  hidden: true,
  canContain: false,
  defaultProps: { text: "LOVE NEVER FAILS", size: 18, color: "#511419", font: "", bold: false, italic: false, amount: 60 },
  fields: {
    text: { type: "text", label: "Chữ", maxLength: 80, group: "Chữ cong" },
    size: { type: "number", label: "Cỡ", min: CURVE_LIMITS.size.min, max: CURVE_LIMITS.size.max, unit: "px", group: "Chữ cong" },
    amount: { type: "number", label: "Độ cong", min: CURVE_LIMITS.amount.min, max: CURVE_LIMITS.amount.max, group: "Chữ cong", help: "Dương: đỉnh cung hướng lên. Âm: hướng xuống." },
    color: { type: "color", label: "Màu", group: "Chữ cong" },
    font: builtInRegistry.Text!.fields.font ?? { type: "font", label: "Phông chữ", group: "Chữ cong" },
    bold: { type: "boolean", label: "Đậm", group: "Chữ cong" },
    italic: { type: "boolean", label: "Nghiêng", group: "Chữ cong" },
  },
};
