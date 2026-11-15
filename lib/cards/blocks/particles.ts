import type { ComponentDef } from "@miditor/core";
import { BURST_PALETTE_NAMES } from "./burst";

// Khối "Hạt trôi": các hạt nhỏ bay chậm từ dưới lên trong khung của khối (như ô xanh ở màn bìa thiệp Song Hỷ).
// Số đo lấy từ trang mẫu: mỗi hạt chạy 18-26 giây, lệch ngang tối đa ~20px, xoay tối đa ~8 độ, độ mờ 0 -> 0,45 -> 0,55 -> 0,35 -> 0.
export const PARTICLE_SHAPES = ["Vuông", "Tròn", "Tim", "Cánh hoa", "Thoi", "Sao", "Lá", "Chữ"] as const;
export const PARTICLE_DIRECTIONS = ["Bay lên", "Rơi xuống"] as const;
/** Một màu (ô Màu) hoặc mỗi hạt một màu lấy từ bảng màu của Pháo. */
export const PARTICLE_PALETTES = ["Một màu", ...BURST_PALETTE_NAMES] as const;
export type ParticleShape = (typeof PARTICLE_SHAPES)[number];

export const PARTICLE_LIMITS = {
  count: { min: 1, max: 40 },
  size: { min: 3, max: 24 },
  speed: { min: 40, max: 250 },
  opacity: { min: 10, max: 100 },
  drift: { min: 0, max: 80 },
} as const;

export type ParticleSpec = {
  /** Vị trí ngang, % chiều rộng khối. */
  left: number;
  /** Hệ số kích thước so với cỡ chung (0,6 - 1,4). */
  scale: number;
  /** Thời gian một vòng bay ở tốc độ 100%, giây. */
  duration: number;
  /** Số thứ tự để chọn màu trong bảng màu (0-3). */
  pick: number;
  /** Độ trễ âm (giây) để các hạt không xuất phát cùng lúc. */
  delay: number;
  /** Hướng lệch ngang, -1 đến 1. */
  sway: number;
  /** Hướng xoay, -1 đến 1. */
  turn: number;
  /** Hệ số độ mờ riêng của hạt (0,6 - 1). */
  fade: number;
};

// Bộ sinh số giả ngẫu nhiên theo hạt giống: cùng một hạt luôn ra cùng số liệu ở máy chủ lẫn trình duyệt (không lệch khi hydrate), và thêm hạt mới không làm các hạt cũ đổi chỗ.
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function particleSpecs(count: number): ParticleSpec[] {
  const total = Math.round(Math.min(PARTICLE_LIMITS.count.max, Math.max(PARTICLE_LIMITS.count.min, count)));
  return Array.from({ length: total }, (_, index) => {
    const random = mulberry32(index * 9973 + 20261109);
    const duration = 18 + random() * 8;
    return {
      left: random() * 100,
      scale: 0.6 + random() * 0.8,
      duration,
      delay: -random() * duration,
      sway: random() * 2 - 1,
      turn: random() * 2 - 1,
      fade: 0.6 + random() * 0.4,
      pick: Math.floor(random() * 4),
    };
  });
}

export const particlesBlock: ComponentDef = {
  label: "Hạt trôi",
  category: "Hiệu ứng nền",
  icon: "shape",
  keywords: ["hạt", "cánh hoa", "bụi", "lấp lánh", "hiệu ứng", "nền", "bay"],
  size: { w: 360, h: 520 },
  hidden: true,
  canContain: false,
  defaultProps: { shape: "Vuông", direction: "Bay lên", color: "#e8f0e4", palette: "Một màu", char: "囍", count: 14, size: 8, speed: 100, opacity: 50, drift: 20 },
  fields: {
    shape: { type: "select", label: "Hình hạt", options: PARTICLE_SHAPES, group: "Hạt" },
    direction: { type: "select", label: "Hướng", options: PARTICLE_DIRECTIONS, group: "Chuyển động" },
    char: { type: "text", label: "Chữ", maxLength: 2, group: "Hạt", help: "Ký tự dùng khi Hình hạt là Chữ, ví dụ 囍 hoặc ♥." },
    palette: { type: "select", label: "Bảng màu", options: PARTICLE_PALETTES, group: "Hạt", help: "Một màu thì dùng ô Màu bên dưới; còn lại mỗi hạt một màu trong bảng." },
    color: { type: "color", label: "Màu", group: "Hạt" },
    count: { type: "number", label: "Số hạt", min: PARTICLE_LIMITS.count.min, max: PARTICLE_LIMITS.count.max, group: "Hạt", help: "Càng nhiều hạt càng nặng trên điện thoại yếu." },
    size: { type: "number", label: "Cỡ", min: PARTICLE_LIMITS.size.min, max: PARTICLE_LIMITS.size.max, unit: "px", group: "Hạt" },
    opacity: { type: "number", label: "Độ đậm", min: PARTICLE_LIMITS.opacity.min, max: PARTICLE_LIMITS.opacity.max, unit: "%", group: "Hạt" },
    speed: { type: "number", label: "Tốc độ", min: PARTICLE_LIMITS.speed.min, max: PARTICLE_LIMITS.speed.max, unit: "%", group: "Chuyển động", help: "100% là một vòng bay khoảng 24 giây." },
    drift: { type: "number", label: "Lệch", min: PARTICLE_LIMITS.drift.min, max: PARTICLE_LIMITS.drift.max, unit: "px", group: "Chuyển động", help: "Hạt lắc sang hai bên bao nhiêu khi bay lên." },
  },
};
