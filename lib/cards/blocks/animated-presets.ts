import type { JsonValue } from "@miditor/core";

// Mẫu "động" của tab Trang trí: mỗi mẫu là một khối đã chỉnh sẵn thông số và hiệu ứng (bấm hoặc kéo vào trang là có).
// Chia ba nhóm theo việc: nền chuyển động, chữ Hỷ, quà mừng. Dữ liệu thuần, không có React.
export type AnimatedGroup = "Nền động" | "Song Hỷ" | "Nút & dấu" | "Hộp quà";
export const ANIMATED_GROUPS: readonly AnimatedGroup[] = ["Nền động", "Song Hỷ", "Nút & dấu", "Hộp quà"];

export type AnimatedPreset = {
  id: string;
  group: AnimatedGroup;
  name: string;
  /** Mô tả ngắn hiện dưới tên và dùng cho ô tìm. */
  hint: string;
  keywords: readonly string[];
  type: "Particles" | "Decoration" | "Burst" | "Gradient";
  size: { w: number; h: number };
  props: Record<string, JsonValue>;
  /** Màu nền ô xem trước: các hạt sáng và chữ Hỷ xanh nhạt không nhìn thấy trên nền xám. */
  stage: string;
};

const GIFT_BOX = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794281150/cardmaking/decorations/starter-wedding-gift-box.webp";
const DARK_GREEN = "#164d3c";
const SOFT = "#fbf3f0";

export const animatedPresets: readonly AnimatedPreset[] = [
  { id: "gradient-red", group: "Nền động", name: "Nền đỏ thẫm chuyển màu", hint: "Chéo xuống phải, ba sắc đỏ", keywords: ["nền", "gradient", "đỏ", "chuyển màu", "bìa"], type: "Gradient", size: { w: 960, h: 900 }, stage: "#400000",
    props: { from: "#5a0000", mid: "#400000", to: "#2a0000", direction: "Chéo xuống phải" } },
  { id: "gradient-green", group: "Nền động", name: "Nền xanh rừng chuyển màu", hint: "Chéo xuống phải, ba sắc xanh", keywords: ["nền", "gradient", "xanh", "chuyển màu", "bìa"], type: "Gradient", size: { w: 960, h: 900 }, stage: "#10382c",
    props: { from: "#1f5a46", mid: "#164d3c", to: "#0e3328", direction: "Chéo xuống phải" } },
  { id: "particles-square", group: "Nền động", name: "Hạt vuông trôi", hint: "Ô nhỏ bay chậm lên", keywords: ["hạt", "bụi", "ô vuông", "nền"], type: "Particles", size: { w: 360, h: 520 }, stage: DARK_GREEN,
    props: { shape: "Vuông", color: "#e8f0e4", count: 16, size: 8, speed: 100, opacity: 50, drift: 20 } },
  { id: "particles-petal", group: "Nền động", name: "Cánh hoa bay", hint: "Cánh hoa hồng nhạt", keywords: ["cánh hoa", "hoa", "hồng", "bay"], type: "Particles", size: { w: 360, h: 520 }, stage: DARK_GREEN,
    props: { shape: "Cánh hoa", color: "#f4c6cc", count: 14, size: 12, speed: 80, opacity: 70, drift: 30 } },
  { id: "particles-heart", group: "Nền động", name: "Trái tim bay", hint: "Tim nhỏ trôi lên", keywords: ["tim", "trái tim", "yêu", "bay"], type: "Particles", size: { w: 360, h: 520 }, stage: DARK_GREEN,
    props: { shape: "Tim", color: "#e58f9c", count: 12, size: 12, speed: 90, opacity: 70, drift: 24 } },
  { id: "particles-star", group: "Nền động", name: "Sao lấp lánh", hint: "Sao vàng nhỏ", keywords: ["sao", "lấp lánh", "vàng"], type: "Particles", size: { w: 360, h: 520 }, stage: DARK_GREEN,
    props: { shape: "Sao", color: "#f3d98b", count: 16, size: 9, speed: 110, opacity: 80, drift: 16 } },

  { id: "particles-xi-green", group: "Song Hỷ", name: "Chữ Hỷ trôi xanh", hint: "囍 nhiều sắc xanh bay chậm", keywords: ["hỷ", "囍", "hạt", "bay", "xanh", "bìa"], type: "Particles", size: { w: 960, h: 900 }, stage: DARK_GREEN,
    props: { shape: "Chữ", char: "囍", palette: "Xanh lá", color: "#a8e6a3", count: 12, size: 17, speed: 100, opacity: 100, drift: 20 } },
  { id: "particles-xi-red", group: "Song Hỷ", name: "Chữ Hỷ trôi đỏ vàng", hint: "囍 đỏ và vàng bay chậm", keywords: ["hỷ", "囍", "hạt", "bay", "đỏ", "vàng", "bìa"], type: "Particles", size: { w: 960, h: 900 }, stage: "#4a0000",
    props: { shape: "Chữ", char: "囍", palette: "Đỏ vàng", color: "#ffe066", count: 12, size: 17, speed: 100, opacity: 100, drift: 20 } },
  { id: "xi-burst", group: "Song Hỷ", name: "Chữ Hỷ phóng ra xanh", hint: "Phóng gấp 3 rồi mờ khi mở thiệp", keywords: ["hỷ", "song hỷ", "囍", "mở thiệp", "bìa"], type: "Decoration", size: { w: 410, h: 410 }, stage: DARK_GREEN,
    props: { src: "/demo/song-hy/xi-xanh.svg", alt: "", fit: "contain", motion: false, motionTarget: "", openEffect: "Phóng ra rồi mờ dần", openTime: 1.3, openDelay: 0 } },
  { id: "xi-burst-fireworks-red", group: "Song Hỷ", name: "Pháo chữ Hỷ đỏ vàng", hint: "32 chữ 囍 đỏ vàng nổ khi bấm Mở thiệp", keywords: ["pháo", "nổ", "hỷ", "囍", "đỏ", "vàng", "mở thiệp", "bìa"], type: "Burst", size: { w: 96, h: 40 }, stage: "#4a0000",
    props: { char: "囍", count: 32, spread: 420, delay: 0.5, palette: "Đỏ vàng" } },
  { id: "xi-burst-fireworks", group: "Song Hỷ", name: "Pháo chữ Hỷ xanh", hint: "32 chữ 囍 nổ ra khi bấm Mở thiệp", keywords: ["pháo", "nổ", "hỷ", "囍", "mở thiệp", "bìa"], type: "Burst", size: { w: 96, h: 40 }, stage: DARK_GREEN,
    props: { char: "囍", count: 32, spread: 420, delay: 0.5, palette: "Xanh lá" } },
  { id: "xi-ring", group: "Song Hỷ", name: "Gợn sóng xanh", hint: "Vòng sáng lan ra khi mở thiệp", keywords: ["gợn sóng", "vòng", "con dấu", "mở thiệp", "bìa"], type: "Decoration", size: { w: 56, h: 56 }, stage: DARK_GREEN,
    props: { src: "/demo/song-hy/ring-xanh.svg", alt: "", fit: "contain", motion: false, motionTarget: "", openEffect: "Gợn sóng lan ra", openTime: 0.6, openDelay: 0 } },
  { id: "xi-seal", group: "Song Hỷ", name: "Con dấu Hỷ xanh", hint: "Huy hiệu Song Hỷ nhịp nhẹ, thu nhỏ khi mở thiệp", keywords: ["hỷ", "con dấu", "logo", "囍", "mở thiệp", "bìa"], type: "Decoration", size: { w: 56, h: 56 }, stage: DARK_GREEN,
    props: { src: "/demo/song-hy/seal-xanh.svg", alt: "", fit: "contain", motion: false, motionTarget: "", idleEffect: "Thở nhẹ", openEffect: "Thu nhỏ rồi biến mất", openTime: 0.6, openDelay: 0 } },

  { id: "xi-burst-red", group: "Song Hỷ", name: "Chữ Hỷ phóng ra đỏ", hint: "Phóng gấp 3 rồi mờ khi mở thiệp", keywords: ["hỷ", "song hỷ", "囍", "mở thiệp", "bìa", "đỏ"], type: "Decoration", size: { w: 410, h: 410 }, stage: "#4a0000",
    props: { src: "/demo/song-hy/xi-do.svg", alt: "", fit: "contain", motion: false, motionTarget: "", openEffect: "Phóng ra rồi mờ dần", openTime: 1.3, openDelay: 0 } },
  { id: "xi-seal-red", group: "Song Hỷ", name: "Con dấu Hỷ đỏ", hint: "Thu nhỏ biến mất khi mở thiệp", keywords: ["hỷ", "con dấu", "logo", "囍", "mở thiệp", "bìa", "đỏ"], type: "Decoration", size: { w: 56, h: 56 }, stage: "#4a0000",
    props: { src: "/demo/song-hy/seal-do.svg", alt: "", fit: "contain", motion: false, motionTarget: "", openEffect: "Thu nhỏ rồi biến mất", openTime: 0.6, openDelay: 0 } },
  { id: "xi-ring-red", group: "Song Hỷ", name: "Gợn sóng đỏ", hint: "Vòng sáng lan ra khi mở thiệp", keywords: ["gợn sóng", "vòng", "con dấu", "mở thiệp", "bìa", "đỏ"], type: "Decoration", size: { w: 56, h: 56 }, stage: "#4a0000",
    props: { src: "/demo/song-hy/ring-do.svg", alt: "", fit: "contain", motion: false, motionTarget: "", openEffect: "Gợn sóng lan ra", openTime: 0.6, openDelay: 0 } },
  { id: "seal-heart-beat", group: "Nút & dấu", name: "Con dấu tim đập", hint: "Nhịp tim, thu nhỏ biến mất khi mở thiệp", keywords: ["tim", "trái tim", "đập", "con dấu", "logo", "mở thiệp", "bìa", "minimalism"], type: "Decoration", size: { w: 56, h: 56 }, stage: "#511419",
    props: { src: "/demo/song-hy/seal-mdd.svg", alt: "", fit: "contain", motion: false, motionTarget: "", idleEffect: "Đập", openEffect: "Thu nhỏ rồi biến mất", openTime: 0.6, openDelay: 0 } },
  { id: "button-shine", group: "Nút & dấu", name: "Vệt sáng quét", hint: "Đặt lên nút: vệt sáng chạy ngang mỗi 3 giây", keywords: ["sáng", "vệt sáng", "bóng", "nút", "shine", "mở thiệp", "bìa"], type: "Decoration", size: { w: 140, h: 48 }, stage: "#511419",
    props: { src: "", alt: "", fit: "contain", motion: false, motionTarget: "", idleEffect: "Ánh sáng quét", shineRadius: 24 } },
  { id: "gift-box", group: "Hộp quà", name: "Hộp quà mừng", hint: "Lấp lánh, bóng thở, “Nhấn để mở”", keywords: ["quà", "hộp quà", "mừng cưới", "phong bì"], type: "Decoration", size: { w: 180, h: 185 }, stage: SOFT,
    props: { src: GIFT_BOX, alt: "Hộp quà mừng", fit: "contain", motion: true, motionTarget: "" } },
];

/** Lọc theo ô tìm: khớp tên, mô tả, nhóm hoặc từ khoá, bỏ dấu và không phân biệt hoa thường. */
export function matchPresets(query: string): AnimatedPreset[] {
  const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLocaleLowerCase("vi");
  const needle = fold(query.trim());
  if (!needle) return [...animatedPresets];
  return animatedPresets.filter((preset) => fold([preset.name, preset.hint, preset.group, ...preset.keywords].join(" ")).includes(needle));
}
