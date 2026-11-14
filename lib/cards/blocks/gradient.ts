import type { ComponentDef } from "@miditor/core";

// Khối "Nền chuyển màu": một mảng màu chuyển từ màu này sang màu khác (nền màn bìa của trang mẫu là gradient chéo ba màu).
// Miditor chỉ lưu nền trơn, nên nền chuyển màu là một khối kéo giãn phủ trang, đặt dưới cùng.
export const GRADIENT_DIRECTIONS = {
  "Chéo xuống phải": "to right bottom",
  "Chéo xuống trái": "to left bottom",
  "Xuống": "to bottom",
  "Sang phải": "to right",
  "Toả tròn": "radial",
} as const;
export type GradientDirection = keyof typeof GRADIENT_DIRECTIONS;
export const GRADIENT_DIRECTION_NAMES = Object.keys(GRADIENT_DIRECTIONS) as GradientDirection[];

export type GradientConfig = { from: string; mid: string; to: string; direction: GradientDirection };

const HEX = /^#[0-9a-f]{6}$/i;

/** Đọc thuộc tính thành cấu hình hợp lệ: màu sai thành màu mặc định, hướng lạ thành chéo xuống phải. */
export function readGradient(props: Record<string, unknown>, resolve: (value: unknown, fallback: string) => string = (value, fallback) => (typeof value === "string" && HEX.test(value) ? value : fallback)): GradientConfig {
  return {
    from: resolve(props.from, "#5a0000"),
    mid: resolve(props.mid, "#400000"),
    to: resolve(props.to, "#2a0000"),
    direction: GRADIENT_DIRECTION_NAMES.includes(props.direction as GradientDirection) ? props.direction as GradientDirection : "Chéo xuống phải",
  };
}

export function gradientCss({ from, mid, to, direction }: GradientConfig): string {
  const how = GRADIENT_DIRECTIONS[direction];
  return how === "radial" ? `radial-gradient(circle at center, ${from}, ${mid}, ${to})` : `linear-gradient(${how}, ${from}, ${mid}, ${to})`;
}

export const gradientBlock: ComponentDef = {
  label: "Nền chuyển màu",
  category: "Hiệu ứng nền",
  icon: "shape",
  keywords: ["nền", "gradient", "chuyển màu", "bìa"],
  size: { w: 960, h: 900 },
  hidden: true,
  canContain: false,
  defaultProps: { from: "#5a0000", mid: "#400000", to: "#2a0000", direction: "Chéo xuống phải" },
  fields: {
    from: { type: "color", label: "Màu đầu", group: "Nền chuyển màu" },
    mid: { type: "color", label: "Màu giữa", group: "Nền chuyển màu" },
    to: { type: "color", label: "Màu cuối", group: "Nền chuyển màu" },
    direction: { type: "select", label: "Hướng", options: GRADIENT_DIRECTION_NAMES, group: "Nền chuyển màu" },
  },
};
