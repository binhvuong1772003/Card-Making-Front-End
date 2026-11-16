import type { ComponentDef } from "@miditor/core";

// Khối "Pháo mở thiệp": khi khách bấm Mở thiệp, trình phát bắn một loạt chữ nhỏ từ tâm màn hình (như 32 chữ 囍 của trang mẫu).
// Số đo lấy từ trang mẫu: nổ sau 0,5s, mỗi hạt bay 1,4s theo `cubic-bezier(.25,.46,.45,.94)`, chữ 10-26px, bay xa 120-420px theo góc ngẫu nhiên,
// xoay đầu +-15 độ và cuối +-180 độ, lệch pha ngẫu nhiên 0-0,15s, bóng chữ phát sáng 10px cùng màu.
export const BURST_PALETTES = {
  "Xanh lá": ["#4caf50", "#7bc47a", "#a8e6a3", "#c8e6c9"],
  "Đỏ vàng": ["#ff6b6b", "#ffe066", "#ffc107", "#ffd700"],
  "Vàng kim": ["#b98b43", "#d1b77b", "#f1d98c", "#fff0b8"],
  "Hồng phấn": ["#d4537e", "#ed93b1", "#f4c0d1", "#fbeaf0"],
  "Đỏ rượu": ["#a8323b", "#ece4d8", "#c9a24a", "#7a1f26"],
  // Bốn màu lá của trang Hoa Mộc Xanh (đọc từ 32 hạt pháo của trang mẫu).
  "Lá xanh": ["#6b8040", "#8bc34a", "#a5c862", "#c8dfa0"],
  // Bốn màu pháo của trang Minimalism Nâu (đọc từ 32 hạt của trang mẫu).
  "Nâu be": ["#c9a97e", "#917f77", "#b89b78", "#e6d6c4"],
  // Ba màu hạt bông tuyết của bìa Tơ Duyên Đỏ Đậm (đọc từ bìa mẫu) và đỏ rượu của con dấu.
  "Hồng rượu": ["#913b51", "#e8c4ce", "#f3dfc3", "#931434"],
  // Màu hạt và pháo của bìa Tơ Duyên Xanh (xanh lụa và hai màu nhạt của sao quà).
  "Xanh lụa": ["#5e813c", "#d1db9c", "#a8c070", "#e3ecd2"],
  // Bốn màu hạt của bìa Minimalism Xanh.
  "Xanh rêu": ["#6b7b4f", "#a7bd8f", "#cdd9bd", "#87a172"],
  // Bốn màu hạt của bìa Liên Hoa V2 Xanh.
  "Liên hoa": ["#f2b8c6", "#a8c48a", "#5e813c", "#f7d9e0"],
  // Hạt trắng của bìa Mai Lan Trắng.
  "Trắng": ["#ffffff", "#f4f1e6", "#e9e5d3", "#ffffff"],
  // Hạt cam vàng của bìa Long Phụng V3 Đỏ.
  "Cam vàng": ["#ffd4a8", "#ff9b4a", "#ffbe89", "#ffffff"],
  // Hạt hồng phấn của bìa Vườn Kính Hồng.
  "Hồng phấn nhạt": ["#f7e3e8", "#eab8c2", "#f5d6dc", "#ffffff"],
  // Hạt xanh nhạt của bìa Vườn Kính Xanh.
  "Xanh nhạt": ["#c4d4b3", "#ffffff", "#e7eede", "#47613e"],
  // Hạt và pháo đỏ son của bìa Long Phụng V2 và Song Phụng.
  "Đỏ son": ["#c41e3a", "#b22222", "#d9534f", "#a31621"],
} as const;
export type BurstPalette = keyof typeof BURST_PALETTES;
export const BURST_PALETTE_NAMES = Object.keys(BURST_PALETTES) as BurstPalette[];

export const BURST_LIMITS = {
  count: { min: 4, max: 60 },
  spread: { min: 120, max: 800 },
  delay: { min: 0, max: 3 },
  chars: 2,
} as const;
export const BURST_DURATION = 1.4;
export const BURST_JITTER = 0.15;

export const BURST_SHAPES = ["Chữ", "Lá"] as const;
export type BurstShape = (typeof BURST_SHAPES)[number];
// Chiếc lá của trang Hoa Mộc Xanh (viewBox 24x24); hạt hình Lá vẽ bằng path này thay cho ký tự.
export const BURST_LEAF_PATH = "M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z";
export type BurstConfig = { char: string; shape: BurstShape; count: number; spread: number; delay: number; palette: BurstPalette };

export type BurstParticle = { dx: number; dy: number; rotStart: number; rotEnd: number; size: number; color: string; delay: number };

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

/** Số liệu từng hạt. Cùng `seed` thì ra cùng kết quả (để test); trình phát đưa hạt giống mới mỗi lần bấm. */
export function burstParticles(config: BurstConfig, seed: number): BurstParticle[] {
  const random = mulberry32(seed);
  const colors = BURST_PALETTES[config.palette] ?? BURST_PALETTES["Xanh lá"];
  const near = Math.min(120, config.spread / 2);
  return Array.from({ length: config.count }, () => {
    const angle = random() * Math.PI * 2;
    const distance = near + random() * (config.spread - near);
    return {
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance,
      rotStart: (random() * 2 - 1) * 15,
      rotEnd: (random() * 2 - 1) * 180,
      size: 10 + random() * 16,
      color: colors[Math.floor(random() * colors.length)]!,
      delay: random() * BURST_JITTER,
    };
  });
}

const clamp = (value: unknown, fallback: number, min: number, max: number): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;

/** Đọc thuộc tính của khối thành cấu hình hợp lệ: số bị kẹp vào giới hạn, màu lạ thành Xanh lá, chữ rỗng thành 囍. */
export function readBurstConfig(props: Record<string, unknown>): BurstConfig {
  const char = typeof props.char === "string" ? [...props.char].slice(0, BURST_LIMITS.chars).join("") : "";
  return {
    char: char || "囍",
    shape: BURST_SHAPES.includes(props.shape as BurstShape) ? props.shape as BurstShape : "Chữ",
    count: Math.round(clamp(props.count, 32, BURST_LIMITS.count.min, BURST_LIMITS.count.max)),
    spread: clamp(props.spread, 420, BURST_LIMITS.spread.min, BURST_LIMITS.spread.max),
    delay: clamp(props.delay, 0.5, BURST_LIMITS.delay.min, BURST_LIMITS.delay.max),
    palette: BURST_PALETTE_NAMES.includes(props.palette as BurstPalette) ? props.palette as BurstPalette : "Xanh lá",
  };
}

export const burstBlock: ComponentDef = {
  label: "Pháo mở thiệp",
  category: "Hiệu ứng nền",
  icon: "shape",
  keywords: ["pháo", "nổ", "mở thiệp", "hỷ", "pháo hoa", "confetti"],
  size: { w: 96, h: 40 },
  hidden: true,
  canContain: false,
  defaultProps: { char: "囍", shape: "Chữ", count: 32, spread: 420, delay: 0.5, palette: "Xanh lá" },
  fields: {
    shape: { type: "select", label: "Hình hạt", options: BURST_SHAPES, group: "Pháo", help: "Chữ: bắn ký tự. Lá: bắn những chiếc lá." },
    char: { type: "text", label: "Chữ", maxLength: BURST_LIMITS.chars, group: "Pháo", help: "Ký tự bắn ra, ví dụ 囍, ♥ hoặc ✦." },
    count: { type: "number", label: "Số hạt", min: BURST_LIMITS.count.min, max: BURST_LIMITS.count.max, group: "Pháo" },
    palette: { type: "select", label: "Màu", options: BURST_PALETTE_NAMES, group: "Pháo" },
    spread: { type: "number", label: "Bay xa", min: BURST_LIMITS.spread.min, max: BURST_LIMITS.spread.max, unit: "px", group: "Pháo", help: "Hạt bay xa nhất bao nhiêu px từ tâm màn hình." },
    delay: { type: "number", label: "Nổ sau", min: BURST_LIMITS.delay.min, max: BURST_LIMITS.delay.max, unit: "s", group: "Pháo", help: "Chờ bao lâu sau khi bấm Mở thiệp thì pháo nổ." },
  },
};
