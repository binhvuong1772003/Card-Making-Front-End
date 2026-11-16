// Tạm: sinh trang bìa "Song Hỷ" (xanh và đỏ) theo số đo trang mẫu, nội dung giả. Ghi public/demo/song-hy/cover-{xanh,do}.json cùng các SVG theo chủ đề.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { builtInRegistry, emptyPage, newNode, type Axis, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../lib/cards/blocks/definitions";

const registry = { ...builtInRegistry, ...cardDefinitions };
const SIZE = { w: 960, h: 900 };
const serif = "'Playfair Display', serif";
const lora = "'Lora', serif";
const baskerville = "'Cormorant Garamond', serif";
const viaoda = "'Viaoda Libre', serif";
const FONT = "'Noto Serif SC','Songti SC','STSong','Source Han Serif SC','SimSun','Microsoft YaHei',serif";

type Theme = {
  key: string; gradient: [string, string, string]; card: string; border: string; borderAlpha: number; cardAlpha: number; cream: string; ink: string; dim: string; palette: string;
  name1: string; name2: string; date: string; nameFont: string; sealKind: "glyph" | "heart" | "mask"; sealFrom?: string; sealTo?: string; sealMark: string;
  particleShape: string; particleChar: string; burstChar: string; flowers?: boolean; leafCover?: boolean; accent?: string; button: string; buttonText: string; ruleKind: "solid" | "fade"; weight: number;
  // Bìa lá có hoa riêng (Minimalism Nâu): ảnh hoa, vị trí tâm so với tâm thẻ, độ mờ trong thẻ; màu lá rơi và bảng màu pháo.
  flower?: { src: string; w: number; h: number; lx: number; ly: number; rx: number; ry: number; rot: number; opL: number; opR: number; flipRight: boolean; fit?: "contain" | "cover"; /* ảnh và cỡ riêng cho bên phải khi hai bên khác nhau */ rsrc?: string; rw?: number; rh?: number };
  /** Ảnh nền phủ cả thẻ (ví dụ vân đá), vẽ dưới các ảnh trang trí. */
  cardImage?: string;
  leafColor?: string; burstPalette?: string;
  // Song Hỷ V2: ảnh con dấu thay chữ 囍 vẽ bằng SVG, phông riêng cho dấu & và độ mờ chữ ngày.
  sealImage?: string; ampFont?: string;
  // Thẻ cao hơn 420px (Long Phụng V2: 508px): phần trên dịch lên, phần dưới dịch xuống nửa chênh lệch. Có thể thêm ô tên khách và một dòng chữ phụ.
  cardH?: number;
  /** Ghi đè vị trí/chữ khi mẫu có dòng mời hoặc nút song ngữ: tâm dọc của dòng "Thân Mời" và của nút, chữ của chúng. */
  inviteY?: number; buttonY?: number; inviteLabel?: string; openLabel?: string;
  /** Nền con dấu chữ 囍 (mặc định `cream`): dùng khi con dấu tối, chữ sáng. */
  sealBg?: string;
  guestChip?: { y: number; w: number; h: number; fill: string; fillOpacity: number; radius: number; size: number; color: string; fallback: string };
  extraLine?: { text: string; y: number; w: number; size: number; color: string };
};
const themes: Theme[] = [
  { key: "slx", gradient: ["#14301c", "#0d2214", "#08160d"], card: "#1a3a22", border: "#f0d497", borderAlpha: 0, cardAlpha: 1, cream: "#f0d497", ink: "#f0d497", dim: "#d0bd85", accent: "#f0d497", palette: "Vàng kim", name1: "Văn Nam", name2: "Ngọc Nhi", nameFont: "'Playfair Display', serif", date: "18 tháng 4, 2026", sealKind: "glyph", sealBg: "#f0d497", sealMark: "#1a3a22", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#f0d497", buttonText: "#1a3a22", ruleKind: "fade", weight: 400, cardH: 443, inviteY: 104, inviteLabel: "Thân Mời / 초대합니다", openLabel: "Mở thiệp / 열기",
    extraLine: { text: "2026년 4월 18일", y: 59, w: 300, size: 15, color: "#d0bd85" },
    flower: { src: "/demo/song-long-xanh/source-assets/ebd1dc156a23-ebd1dc156a23-double-dragon.webp", w: 462, h: 500, lx: -249, ly: -99, rx: 259, ry: 98, rot: 0, opL: 30, opR: 30, flipRight: false, fit: "cover", rsrc: "/demo/song-long-xanh/source-assets/ebd1dc156a23-ebd1dc156a23-double-dragon.webp", rw: 462, rh: 500 } },
  { key: "lpx", gradient: ["#080e07", "#050905", "#020402"], card: "#162614", border: "#e9ce9e", borderAlpha: 0, cardAlpha: 1, cream: "#e9ce9e", ink: "#e9ce9e", dim: "#bfac82", accent: "#e9ce9e", palette: "Vàng kim", name1: "Hoài Nam", name2: "Ngọc Linh", nameFont: "'Pinyon Script', cursive", date: "July 5, 2026", sealKind: "glyph", sealBg: "#e9ce9e", sealMark: "#162614", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#e9ce9e", buttonText: "#0a0f09", ruleKind: "fade", weight: 400, inviteLabel: "Cordially Invites", openLabel: "Open",
    flower: { src: "/demo/long-phung-xanh/source-assets/97450be414b2-97450be414b2-rong.webp", w: 280, h: 560, lx: -249, ly: 51, rx: 249, ry: 50, rot: 0, opL: 30, opR: 30, flipRight: false, fit: "contain", rsrc: "/demo/long-phung-xanh/source-assets/6cbc8db31d05-6cbc8db31d05-phuong.webp", rw: 280, rh: 598 } },
  { key: "vxx", gradient: ["#f0f4ef", "#e8ede6", "#dfe5dd"], card: "#ffffff", border: "#5d6a57", borderAlpha: 0, cardAlpha: 0.95, cream: "#ffffff", ink: "#5d6a57", dim: "#8e9789", accent: "#697a62", palette: "Xanh rêu", name1: "Văn An", name2: "Mỹ Ngọc", nameFont: "'Pinyon Script', cursive", date: "8 tháng 6, 2026", sealKind: "heart", sealFrom: "#5d6a57", sealTo: "#4a5645", sealMark: "#ffffff", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#5d6a57", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/vuon-xuan-xanh/source-assets/fdc781d27b69-flower_paralax.webp", w: 598, h: 562, lx: -140, ly: 68, rx: 140, ry: -129, rot: 0, opL: 70, opR: 70, flipRight: false, fit: "contain", rsrc: "/demo/vuon-xuan-xanh/source-assets/8573ad3d21cc-flower_top.webp", rw: 598, rh: 440 } },
  { key: "rtt", gradient: ["#3a3a3d", "#141416", "#050506"], card: "#ffffff", border: "#1a1a1a", borderAlpha: 0, cardAlpha: 1, cream: "#ffffff", ink: "#1a1a1a", dim: "#474747", accent: "#8f7964", palette: "Trắng", name1: "Anh Tuấn", name2: "Thu Hà", nameFont: "'Cormorant Garamond', serif", ampFont: "'The Nautigal', cursive", date: "12 tháng 6, 2027", sealKind: "heart", sealFrom: "#1a1a1a", sealTo: "#000000", sealMark: "#ffffff", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#1a1a1a", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/ren-theu-trang/source-assets/ba314ab78c6f-flower.webp", w: 227, h: 305, lx: -262, ly: -77, rx: 262, ry: -77, rot: 0, opL: 80, opR: 80, flipRight: true, fit: "contain" } },
  { key: "mdo", gradient: ["#7c151a", "#5a0e12", "#3d090d"], card: "#ffffff", border: "#7c151a", borderAlpha: 0, cardAlpha: 0.95, cream: "#ffffff", ink: "#7c151a", dim: "#964448", accent: "#7c151a", palette: "Đỏ son", name1: "Đức Anh", name2: "Thanh Mai", nameFont: "'Playfair Display', serif", date: "10 tháng 5, 2026", sealKind: "glyph", sealBg: "#7c151a", sealMark: "#d4af37", particleShape: "Chữ", particleChar: "♥", burstChar: "♥", button: "#7c151a", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/minimalism-do/source-assets/4acc231c129c-header-top-01.png", w: 296, h: 209, lx: -179, ly: -149, rx: 179, ry: 149, rot: 0, opL: 80, opR: 80, flipRight: false, fit: "contain", rsrc: "/demo/minimalism-do/source-assets/8d19077d2084-header-bottom-01.png", rw: 296, rh: 209 } },
  { key: "ldx", gradient: ["#1e3a17", "#3a5a2c", "#5a8040"], card: "#ffffff", border: "#3a5a2c", borderAlpha: 0, cardAlpha: 0.98, cream: "#ffffff", ink: "#3a5a2c", dim: "#657e5a", accent: "#3a5a2c", palette: "Xanh rêu", name1: "Hoàng Long", name2: "Phương Linh", nameFont: "'Viaoda Libre', serif", ampFont: "'Alex Brush', cursive", date: "26 tháng 4, 2026", sealKind: "heart", sealFrom: "#3a5a2c", sealTo: "#2a4620", sealMark: "#ffffff", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#3a5a2c", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/lau-dai-xanh/source-assets/e5398620f9ba-hoanho2-1.webp", w: 502, h: 574, lx: -245, ly: 0, rx: 245, ry: 0, rot: 0, opL: 20, opR: 20, flipRight: false, fit: "contain", rsrc: "/demo/lau-dai-xanh/source-assets/541d4479b4f0-hoanho3-1.webp", rw: 399, rh: 498 } },
  { key: "hkd", gradient: ["#32060a", "#2c0507", "#260406"], card: "#5a0002", border: "#e1bc7c", borderAlpha: 0, cardAlpha: 1, cream: "#e1bc7c", ink: "#e1bc7c", dim: "#c4975f", accent: "#e1bc7c", palette: "Vàng kim", name1: "Hoài Nam", name2: "Ngọc Linh", nameFont: "'EB Garamond', serif", date: "30 tháng 5, 2026", sealKind: "heart", sealFrom: "#ecd09a", sealTo: "#d6ae6b", sealMark: "#5a0305", particleShape: "Chữ", particleChar: "✦", burstChar: "✦", button: "#e1bc7c", buttonText: "#3e0001", ruleKind: "fade", weight: 400, cardH: 508,
    guestChip: { y: 94, w: 234, h: 40, fill: "#e1bc7c", fillOpacity: 8, radius: 12, size: 16, color: "#e1bc7c", fallback: "Quý khách" },
    extraLine: { text: "Đến dự buổi tiệc chung vui cùng chúng em", y: 138, w: 400, size: 16, color: "#c4975f" },
    flower: { src: "/demo/hoang-kim-do/source-assets/eb23c4fe47f6-flower.webp", w: 478, h: 289, lx: 0, ly: -253, rx: 0, ry: 253, rot: 0, opL: 20, opR: 20, flipRight: false, fit: "contain" } },
  { key: "shd", gradient: ["#780002", "#610102", "#280000"], card: "#97110e", border: "#ffe8a4", borderAlpha: 0, cardAlpha: 1, cream: "#ffe8a4", ink: "#ffe8a4", dim: "#e8cec9", accent: "#ffe8a4", palette: "Vàng kim", name1: "Quang Duy", name2: "Hà Linh", nameFont: "'Carattere', cursive", ampFont: "'Ms Madi', cursive", date: "10 tháng 4, 2027", sealKind: "glyph", sealBg: "#7a0809", sealMark: "#ffe8a4", sealImage: "/demo/song-hac-do/source-assets/23e079ccc0d8-double-happiness.webp", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#ffe8a4", buttonText: "#920002", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/song-hac-do/source-assets/0feb21515575-bird-decoration.webp", w: 204, h: 208, lx: -242, ly: -77, rx: 266, ry: 91, rot: 0, opL: 100, opR: 100, flipRight: true, fit: "contain", rw: 152, rh: 155 } },
  { key: "bvd", gradient: ["#3a0808", "#2b0303", "#1e0202"], card: "#4a0b0e", border: "#ffdfaf", borderAlpha: 0, cardAlpha: 0.92, cream: "#ffdfaf", ink: "#ffdfaf", dim: "#e4cdb8", accent: "#ffdfaf", palette: "Cam vàng", name1: "Gia Bảo", name2: "Ngọc Diệp", nameFont: "'Viaoda Libre', serif", ampFont: "'The Nautigal', cursive", date: "19 tháng 12, 2026", sealKind: "heart", sealFrom: "#ffe6bd", sealTo: "#f2c88c", sealMark: "#7a1020", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#ffdfaf", buttonText: "#511419", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/baroque-v2-do-dam/source-assets/ddc26f5b2132-flower3-decoration.webp", w: 160, h: 160, lx: -239, ly: -149, rx: 229, ry: 149, rot: 0, opL: 90, opR: 90, flipRight: false, fit: "contain", rsrc: "/demo/baroque-v2-do-dam/source-assets/84408b524ca2-flower4-decoration.webp", rw: 160, rh: 160 } },
  { key: "adh", gradient: ["#ba4a59", "#ae4c51", "#9e3c41"], card: "#fff5f7", border: "#ba4a59", borderAlpha: 0, cardAlpha: 0.95, cream: "#ffffff", ink: "#8a3a45", dim: "#a15f69", accent: "#ba4a59", palette: "Hồng rượu", name1: "Trung Hiếu", name2: "Như Ý", nameFont: "'EB Garamond', serif", date: "31 tháng 5, 2026", sealKind: "heart", sealFrom: "#ba4a59", sealTo: "#9c2c3b", sealMark: "#ffffff", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#ba4a59", buttonText: "#ffffff", ruleKind: "fade", weight: 400, cardH: 508,
    guestChip: { y: 94, w: 180, h: 48, fill: "#ba4a59", fillOpacity: 10, radius: 12, size: 20, color: "#8a3a45", fallback: "Quý khách" },
    extraLine: { text: "đến dự buổi tiệc chung vui cùng gia đình", y: 138, w: 302, size: 16, color: "#8a3a45" } },
  { key: "vkx", gradient: ["#f2f6ed", "#eaf0e1", "#e0e9d3"], card: "#ffffff", border: "#47613e", borderAlpha: 0, cardAlpha: 0.3, cream: "#ffffff", ink: "#47613e", dim: "#5a6855", accent: "#47613e", palette: "Xanh nhạt", name1: "Quang Huy", name2: "Thảo Vy", nameFont: "'Viaoda Libre', serif", date: "2 tháng 8, 2026", sealKind: "heart", sealFrom: "#47613e", sealTo: "#294320", sealMark: "#ffffff", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#47613e", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/vuonkinh-xanh/source-assets/27a87f21b3d0-flower2-decoration.webp", w: 207, h: 216, lx: -244.5, ly: -138, rx: 235, ry: 151, rot: 0, opL: 90, opR: 90, flipRight: false, fit: "contain", rw: 230, rh: 222 } },
  { key: "vkh", gradient: ["#fdf2f4", "#f9e3e8", "#f3d0d8"], card: "#ffffff", border: "#cb5d6c", borderAlpha: 0, cardAlpha: 0.3, cream: "#ffffff", ink: "#cb5d6c", dim: "#a85c67", accent: "#cb5d6c", palette: "Hồng phấn nhạt", name1: "Ngọc Hân", name2: "Đức Anh", nameFont: "'Viaoda Libre', serif", date: "8 tháng 11, 2026", sealKind: "heart", sealFrom: "#cb5d6c", sealTo: "#ad3f4e", sealMark: "#ffffff", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#cb5d6c", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/vuonkinh-hong/source-assets/a681692b49d7-flower4-decoration.webp", w: 165, h: 165, lx: -242.5, ly: -150.5, rx: 242.5, ry: 149.5, rot: 0, opL: 90, opR: 90, flipRight: false, fit: "contain", rw: 173, rh: 173 } },
  { key: "sld", gradient: ["#4a1212", "#3a0e0e", "#2a0808"], card: "#a31d16", border: "#f0d497", borderAlpha: 0, cardAlpha: 1, cream: "#f0d497", ink: "#f0d497", dim: "#e4b884", accent: "#f0d497", palette: "Vàng kim", name1: "Hoàng Nam", name2: "Thanh Tú", nameFont: "'Playfair Display', serif", date: "1 tháng 2, 2026", sealKind: "glyph", sealMark: "#4a1212", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#f0d497", buttonText: "#4a1212", ruleKind: "fade", weight: 400, cardH: 510, inviteLabel: "Kính mời",
    guestChip: { y: 94, w: 190, h: 48, fill: "#f0d497", fillOpacity: 12, radius: 12, size: 20, color: "#f0d497", fallback: "Quý khách" },
    extraLine: { text: "đến dự buổi tiệc chung vui cùng gia đình", y: 139, w: 302, size: 16, color: "#e4b884" },
    flower: { src: "/demo/song-long-do/source-assets/ebd1dc156a23-double-dragon.webp", w: 462, h: 500, lx: -249, ly: -132, rx: 259, ry: 132, rot: 0, opL: 18, opR: 18, flipRight: false, fit: "cover", rsrc: "/demo/song-long-do/source-assets/ebd1dc156a23-double-dragon.webp", rw: 462, rh: 500 } },
  { key: "lpd", gradient: ["#3d0707", "#2a0404", "#1c0202"], card: "#680e0e", border: "#e9ce9e", borderAlpha: 0, cardAlpha: 1, cream: "#e9ce9e", ink: "#e9ce9e", dim: "#cfa881", accent: "#e9ce9e", palette: "Vàng kim", name1: "Hoài Nam", name2: "Ngọc Linh", nameFont: "'Pinyon Script', cursive", date: "30 tháng 5, 2026", sealKind: "glyph", sealMark: "#360202", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#e9ce9e", buttonText: "#360202", ruleKind: "fade", weight: 400, cardH: 443, inviteY: 103.5, buttonY: 175, inviteLabel: "Thân Mời / 誠摯邀請", openLabel: "Mở thiệp / 開啟喜帖",
    extraLine: { text: "2026年5月30日", y: 58, w: 300, size: 15, color: "#cfa881" },
    flower: { src: "/demo/long-phung-do/source-assets/97450be414b2-rong.webp", w: 280, h: 560, lx: -249, ly: 40, rx: 249, ry: 62, rot: 0, opL: 20, opR: 20, flipRight: false, fit: "contain", rsrc: "/demo/long-phung-do/source-assets/6cbc8db31d05-phuong.webp", rw: 280, rh: 598 } },
  { key: "lp3d", gradient: ["#710001", "#5a0001", "#450001"], card: "#ffbe89", border: "#ffbe89", borderAlpha: 0, cardAlpha: 0.1, cream: "#ffbe89", ink: "#ffbe89", dim: "#e19c71", accent: "#ffbe89", palette: "Cam vàng", name1: "Tuấn Kiệt", name2: "Thanh Hà", nameFont: "'EB Garamond', serif", date: "12 tháng 7, 2026", sealKind: "glyph", sealMark: "#710001", sealImage: "/demo/long-phung-v3-do/source-assets/a66d4eefa0b4-chu-hy.webp", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#ffbe89", buttonText: "#710001", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/long-phung-v3-do/source-assets/0d484942a9d1-phung.webp", w: 413, h: 419, lx: -169.5, ly: -44.5, rx: 169, ry: 59, rot: 0, opL: 55, opR: 55, flipRight: false, fit: "contain", rsrc: "/demo/long-phung-v3-do/source-assets/57220913864d-rong.webp", rw: 404, rh: 392 } },
  { key: "spd", gradient: ["#f8f4ec", "#f2ece0", "#ebe3d3"], card: "#fff0e7", border: "#710001", borderAlpha: 0, cardAlpha: 0.95, cream: "#710001", ink: "#710001", dim: "#8d302f", accent: "#710001", palette: "Đỏ son", name1: "Ngọc Ánh", name2: "Thế Bảo", nameFont: "'Playfair Display', serif", date: "3 tháng 5, 2026", sealKind: "glyph", sealBg: "#710001", sealMark: "#fff0e7", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#710001", buttonText: "#fff0e7", ruleKind: "fade", weight: 400, cardH: 508,
    guestChip: { y: 94, w: 190, h: 40, fill: "#710001", fillOpacity: 6, radius: 12, size: 20, color: "#710001", fallback: "Quý khách" },
    extraLine: { text: "đến dự buổi tiệc chung vui cùng gia đình", y: 138, w: 302, size: 16, color: "#8d302f" },
    flower: { src: "/demo/song-phung-do/source-assets/f49b2efd66b4-Phuong.webp", w: 297, h: 494, lx: -238.5, ly: -42, rx: 238.5, ry: 132, rot: 0, opL: 90, opR: 90, flipRight: false, fit: "contain", rw: 259, rh: 480 } },
  { key: "lp2d", gradient: ["#f6f2ea", "#f0ebe0", "#e9e2d3"], card: "#680d0e", border: "#e9ce9e", borderAlpha: 0, cardAlpha: 1, cream: "#e9ce9e", ink: "#e9ce9e", dim: "#cfa781", accent: "#e9ce9e", palette: "Đỏ son", name1: "Trung Hiếu", name2: "Minh Nguyệt", nameFont: "'EB Garamond', serif", date: "24 tháng 5, 2026", sealKind: "glyph", sealMark: "#680d0e", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#e9ce9e", buttonText: "#4a0808", ruleKind: "fade", weight: 400, cardH: 508,
    guestChip: { y: 94, w: 122, h: 48, fill: "#e9ce9e", fillOpacity: 15, radius: 12, size: 20, color: "#e9ce9e", fallback: "Quý khách" },
    extraLine: { text: "đến dự buổi tiệc chung vui cùng gia đình", y: 138, w: 302, size: 16, color: "#cfa781" },
    flower: { src: "/demo/long-phung-v2-do/source-assets/a7318af93996-phuong.webp", w: 280, h: 421, lx: -249, ly: -62.5, rx: 249, ry: 155, rot: 0, opL: 30, opR: 30, flipRight: false, fit: "contain", rsrc: "/demo/long-phung-v2-do/source-assets/6e4d7f8a99b9-rong.webp", rw: 280, rh: 396 } },
  { key: "mlt", gradient: ["#404a1d", "#5a6628", "#404a1d"], card: "#fffaf7", border: "#404a1d", borderAlpha: 0, cardAlpha: 0.98, cream: "#ffffff", ink: "#404a1d", dim: "#707654", accent: "#404a1d", palette: "Trắng", name1: "Văn Long", name2: "Thu Hà", nameFont: "'EB Garamond', serif", date: "26 tháng 4, 2026", sealKind: "heart", sealFrom: "#404a1d", sealTo: "#222c00", sealMark: "#ffffff", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#404a1d", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/mai-lan-trang/source-assets/1e3e03c0c7f4-hoa.webp", w: 239, h: 233, lx: -209.5, ly: -155.5, rx: 209.5, ry: 155.5, rot: 0, opL: 70, opR: 70, flipRight: false, fit: "contain" } },
  { key: "lh2x", gradient: ["#e9efdc", "#dbe5c9", "#c7d4b1"], card: "#fffbed", border: "#5e813c", borderAlpha: 0, cardAlpha: 1, cream: "#fefbf4", ink: "#5e813c", dim: "#124d00", accent: "#5e813c", palette: "Liên hoa", name1: "Bảo Duy", name2: "Khánh Vy", nameFont: "'Carattere', cursive", ampFont: "'Ms Madi', cursive", date: "18 tháng 4, 2027", sealKind: "heart", sealFrom: "#5e813c", sealTo: "#40631e", sealMark: "#fefbf4", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#5e813c", buttonText: "#fefbf4", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/lien-hoa-v2-xanh/source-assets/a9e9c8fad818-flower6.webp", w: 251, h: 287, lx: -260.5, ly: -47.5, rx: 260.5, ry: -44.5, rot: 0, opL: 90, opR: 90, flipRight: false, fit: "contain" } },
  { key: "mgr", gradient: ["#e9efe1", "#dbe6cf", "#cdd9bd"], card: "#ffffff", border: "#6b7b4f", borderAlpha: 0, cardAlpha: 0.96, cream: "#ffffff", ink: "#6b7b4f", dim: "#97a384", accent: "#6b7b4f", palette: "Xanh rêu", name1: "Đăng Khoa", name2: "Mỹ Duyên", nameFont: "'EB Garamond', serif", date: "19 tháng 12, 2026", sealKind: "heart", sealFrom: "#6b7b4f", sealTo: "#4d5d31", sealMark: "#ffffff", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#6b7b4f", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/minimalism-xanh/source-assets/d0a7a365afcd-flower-background.webp", w: 540, h: 533, lx: -181, ly: -50.5, rx: 180.5, ry: 50.5, rot: 0, opL: 20, opR: 20, flipRight: false, fit: "contain", rw: 505, rh: 519 } },
  { key: "ctv", gradient: ["#f3e6cf", "#d7b681", "#a78555"], card: "#fffdf8", border: "#a78555", borderAlpha: 0, cardAlpha: 1, cream: "#fffdf8", ink: "#a78555", dim: "#464645", accent: "#a78555", palette: "Vàng kim", name1: "Tuấn Kiệt", name2: "Thu Hà", nameFont: viaoda, ampFont: "'Beau Rivage', cursive", date: "14 tháng 2, 2027", sealKind: "heart", sealFrom: "#a78555", sealTo: "#896737", sealMark: "#fffdf8", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#a78555", buttonText: "#fffdf8", ruleKind: "fade", weight: 400,
    cardImage: "/demo/cam-thach-vang/source-assets/marble.webp",
    flower: { src: "/demo/cam-thach-vang/source-assets/leaf-1.webp", w: 190, h: 219, lx: -261, ly: -137.5, rx: 263.5, ry: 138, rot: 0, opL: 100, opR: 100, flipRight: false, fit: "contain", rsrc: "/demo/cam-thach-vang/source-assets/leaf-2.webp", rw: 183, rh: 216 } },
  { key: "tdx", gradient: ["#ffffff", "#f2f6ea", "#e3ecd2"], card: "#ffffff", border: "#5e813c", borderAlpha: 0, cardAlpha: 0.97, cream: "#fefbf4", ink: "#5e813c", dim: "#5f714d", accent: "#5e813c", palette: "Xanh lụa", name1: "Hoài Nam", name2: "Thanh Trúc", nameFont: "'Carattere', cursive", date: "19 tháng 12, 2026", sealKind: "heart", sealFrom: "#5e813c", sealTo: "#40631e", sealMark: "#fefbf4", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#5e813c", buttonText: "#fefbf4", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/to-duyen-xanh/source-assets/flower-decoration.webp", w: 310, h: 310, lx: -291, ly: -111, rx: 291, ry: 111, rot: 0, opL: 100, opR: 100, flipRight: false, fit: "contain" } },
  { key: "mnd", gradient: ["#7d553e", "#593d2c", "#37261b"], card: "#f7f5ee", border: "#593d2c", borderAlpha: 0, cardAlpha: 0.96, cream: "#ece4d8", ink: "#593d2c", dim: "#857062", accent: "#593d2c", palette: "Nâu be", name1: "Xuân Trường", name2: "Diệu Linh", date: "17 tháng 11, 2027", nameFont: viaoda, sealKind: "heart", sealFrom: "#593d2c", sealTo: "#3b1f0e", sealMark: "#ece4d8", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#593d2c", buttonText: "#ece4d8", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/minimalism-nau-dam/source-assets/flower2-decoration.webp", w: 319, h: 347, lx: -247.5, ly: -152.5, rx: 248.5, ry: -152.5, rot: 0, opL: 80, opR: 80, flipRight: false, fit: "cover" } },
  { key: "tdd", gradient: ["#ffffff", "#f8eef1", "#efd9df"], card: "#ffffff", border: "#931434", borderAlpha: 0, cardAlpha: 0.97, cream: "#fefbf4", ink: "#931434", dim: "#7d4c58", accent: "#931434", palette: "Hồng rượu", name1: "Minh Hoàng", name2: "Mỹ Ngọc", date: "19 tháng 12, 2026", nameFont: "'Carattere', cursive", sealKind: "heart", sealFrom: "#931434", sealTo: "#750016", sealMark: "#fefbf4", particleShape: "Chữ", particleChar: "✲", burstChar: "✲", button: "#931434", buttonText: "#fefbf4", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/to-duyen-do-dam/source-assets/flower-decoration.webp", w: 781, h: 795, lx: -403.5, ly: -108.5, rx: 404.5, ry: 213.5, rot: 0, opL: 100, opR: 100, flipRight: false, fit: "cover" } },
  { key: "shv2", gradient: ["#420000", "#420000", "#420000"], card: "#8c0000", border: "#ffe8a4", borderAlpha: 0, cardAlpha: 1, cream: "#ffe8a4", ink: "#ffe8a4", dim: "#eed4c4", accent: "#fdcb9c", palette: "Đỏ vàng", name1: "Trung Hiếu", name2: "Thanh Hà", date: "4 tháng 1, 2027", nameFont: "'Carattere', cursive", ampFont: "'Ms Madi', cursive", sealKind: "glyph", sealMark: "#8c0000", sealImage: "/demo/song-hy-v2-do/source-assets/double-happiness-light.webp", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#ffe8a4", buttonText: "#8c0000", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/song-hy-v2-do/source-assets/double-happiness-light.webp", w: 402, h: 396, lx: -305, ly: -127, rx: 292, ry: 171, rot: 0, opL: 15, opR: 15, flipRight: false } },
  { key: "xanh", gradient: ["#0a1f0e", "#122418", "#1f3a25"], card: "#1f3a25", border: "#e8f0e4", borderAlpha: 0.15, cardAlpha: 1, cream: "#e8f0e4", ink: "#e8f0e4", dim: "#cad5c7", palette: "Xanh lá", name1: "Minh Anh", name2: "Thu Hà", date: "30 tháng 7, 2026", nameFont: serif, sealKind: "mask", sealMark: "#1f3a25", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#e8f0e4", buttonText: "#1f3a25", ruleKind: "solid", weight: 400 },
  { key: "do", gradient: ["#5a0000", "#400000", "#2a0000"], card: "#800000", border: "#ffeed2", borderAlpha: 0.15, cardAlpha: 1, cream: "#ffeed2", ink: "#ffeed2", dim: "#ecc9b2", palette: "Đỏ vàng", name1: "Gia Huy", name2: "Quỳnh Như", date: "14 tháng 6, 2026", nameFont: serif, sealKind: "glyph", sealMark: "#800000", particleShape: "Chữ", particleChar: "囍", burstChar: "囍", button: "#ffeed2", buttonText: "#800000", ruleKind: "solid", weight: 400 },
  { key: "mdd", gradient: ["#6e1a20", "#511419", "#380a0e"], card: "#fffaf3", border: "#511419", borderAlpha: 0.15, cardAlpha: 0.96, cream: "#fffaf3", ink: "#511419", dim: "#825456", palette: "Đỏ rượu", name1: "Hoàng Long", name2: "Bảo Ngọc", date: "3 tháng 1, 2026", nameFont: viaoda, sealKind: "heart", sealFrom: "#511419", sealTo: "#330000", sealMark: "#f3e8de", particleShape: "Tim", particleChar: "♥", burstChar: "♥", flowers: true, button: "#511419", buttonText: "#f3e8de", ruleKind: "fade", weight: 300 },
  // Hoa Mộc Xanh: cùng khung bìa Minimalism nhưng xanh lá; thẻ #fffaf7 @95%, hai ảnh hoa 300px (40% và 30%, ảnh sau xoay 160 độ), lá #c8dfa0 rơi và xoay.
  { key: "hmx", gradient: ["#1a3005", "#0f2003", "#081500"], card: "#fffaf7", border: "#30530f", borderAlpha: 0, cardAlpha: 0.95, cream: "#fffaf7", ink: "#30530f", dim: "#6e8555", accent: "#6b8040", palette: "Xanh lá", name1: "Minh Quân", name2: "Thu Hà", date: "24 tháng 5, 2026", nameFont: serif, sealKind: "heart", sealFrom: "#30530f", sealTo: "#123500", sealMark: "#fffaf7", particleShape: "Lá", particleChar: "", burstChar: "❦", leafCover: true, button: "#30530f", buttonText: "#fffaf7", ruleKind: "fade", weight: 400 },
  // Minimalism Nâu: khung bìa như Hoa Mộc Xanh, màu nâu be; thẻ rgba(255,250,245,.96), hoa 137,8x320 (xoay 25 độ, bản phải lật), con dấu nâu #7c6a60, lá #c9a97e.
  { key: "mbn", gradient: ["#f3e6da", "#e8d5c4", "#dcc6b2"], card: "#fffaf5", border: "#7c6a60", borderAlpha: 0, cardAlpha: 0.96, cream: "#fffaf5", ink: "#7c6a60", dim: "#a1928a", accent: "#7c6a60", palette: "Nâu be", name1: "Hoàng Nam", name2: "Thảo Vy", date: "3 tháng 1, 2026", nameFont: "'EB Garamond', serif", sealKind: "heart", sealFrom: "#7c6a60", sealTo: "#7c6a60", sealMark: "#ffffff", particleShape: "Lá", particleChar: "", burstChar: "❦", leafCover: true, button: "#7c6a60", buttonText: "#ffffff", ruleKind: "fade", weight: 400,
    flower: { src: "/demo/minimalism-nau/decoration-flower2-decoration.webp", w: 137.8, h: 320, lx: -285, ly: -78, rx: 285, ry: -77, rot: 25, opL: 70, opR: 70, flipRight: true }, leafColor: "#c9a97e", burstPalette: "Nâu be" },
];

const glyph = (x: number, y: number, size: number, rotate: number, fill: string, opacity = 1) =>
  `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${size}" font-family="${FONT}" fill="${fill}" fill-opacity="${opacity}" transform="rotate(${rotate} ${x} ${y})">囍</text>`;

function writeAssets(t: Theme) {
  const dir = resolve(__dirname, "../public/demo/song-hy");
  const sourceFlower = readFileSync(resolve(__dirname, "../public/demo/minimalism-do-dam/flower.svg"), "utf8");
  const flowerImage = sourceFlower.match(/href="(data:image\/webp;base64,[^"]+)"/)?.[1];
  if (t.flowers && !flowerImage) throw new Error("Missing saved Minimalism flower asset.");
  // Hoa đúng mã của trang gốc (lg): ảnh cao 280px, rộng tự theo tỉ lệ (811x1938), opacity .8, xoay 25 độ.
  // Trái: top -2% (= -8,4px), left -10px, dịch -11% bề rộng. Phải: bottom 35% (= đáy ở y 273), right -10px, dịch +11%, lật ngang, xoay -25 độ. Thẻ cắt theo clip-path bo 8px.
  const fh = 280;
  const fw = (fh * 811) / 1938;
  const shift = fw * 0.11;
  const image = `<image href="${flowerImage}" width="${fw.toFixed(2)}" height="${fh}" preserveAspectRatio="xMidYMid meet"/>`;
  const cx = fw / 2;
  const cy = fh / 2;
  const leftX = -10 - shift;
  const leftY = -0.02 * 420;
  const rightX = 600 + 10 - fw + shift;
  const rightY = 420 - 0.35 * 420 - fh;
  const flowers = false
    ? `<g opacity=".8" transform="translate(${leftX.toFixed(2)} ${leftY.toFixed(2)}) rotate(25 ${cx.toFixed(2)} ${cy})">${image}</g>` +
      `<g opacity=".8" transform="translate(${rightX.toFixed(2)} ${rightY.toFixed(2)}) translate(${cx.toFixed(2)} ${cy}) rotate(-25) scale(-1 1) translate(${(-cx).toFixed(2)} ${-cy})">${image}</g>`
    : "";
  const motifs = t.flowers || t.leafCover || t.flower || t.key === "xanh" ? "" : `${glyph(50, 40, 410, -18, t.cream, 0.11)}${glyph(550, 380, 410, 162, t.cream, 0.11)}`;
  // Thẻ 600x420: nền, viền mảnh và phần trang trí (hai chữ 囍 hoặc hoa) cắt theo thẻ, như trang mẫu.
  writeFileSync(resolve(dir, `card-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ${t.cardH ?? 420}"><defs><clipPath id="c"><rect width="600" height="${t.cardH ?? 420}" rx="8"/></clipPath></defs><rect x=".5" y=".5" width="599" height="${(t.cardH ?? 420) - 1}" rx="8" fill="${t.card}" fill-opacity="${t.cardAlpha}" stroke="${t.border}" stroke-opacity="${t.borderAlpha}"/><g clip-path="url(#c)">${motifs}${flowers}</g></svg>\n`);
  writeFileSync(resolve(dir, `xi-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-size="104" font-family="${FONT}" fill="${t.cream}">囍</text></svg>\n`);
  const emblemPng = t.sealKind === "mask"
    ? readFileSync(resolve(__dirname, "../public/demo/song-hy-xanh/chinese_happiness.png")).toString("base64")
    : "";
  const sealBody = t.leafCover
    ? `<defs><radialGradient id="g" cx=".3" cy=".3" r=".9"><stop offset="0" stop-color="${t.sealFrom}"/><stop offset="1" stop-color="${t.sealTo}"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="url(#g)"/><g transform="translate(25 25) scale(2.0833)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${t.sealMark}"/></g>`
    : t.sealKind === "heart"
    ? `<style>@keyframes mdd-heartbeat{0%,100%{transform:scale(.985)}50%{transform:scale(1.025)}}#seal-heart{transform-box:fill-box;transform-origin:center;animation:mdd-heartbeat 2.6s ease-in-out infinite}@media(prefers-reduced-motion:reduce){#seal-heart{animation:none}}</style><defs><radialGradient id="g" cx=".3" cy=".3" r=".9"><stop offset="0" stop-color="${t.sealFrom}"/><stop offset="1" stop-color="${t.sealTo}"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="url(#g)"/><g transform="translate(25 25) scale(2.0833)"><path id="seal-heart" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="${t.sealMark}"/></g>`
    : t.sealKind === "mask"
      ? `<defs><radialGradient id="g" cx="30%" cy="30%" r="90%"><stop offset="0" stop-color="#e8f0e4"/><stop offset="1" stop-color="#cad2c6"/></radialGradient><mask id="emblem" maskUnits="userSpaceOnUse" x="18" y="18" width="64" height="64" mask-type="alpha"><image href="data:image/png;base64,${emblemPng}" x="18" y="18" width="64" height="64" preserveAspectRatio="none"/></mask></defs><circle cx="50" cy="50" r="48" fill="url(#g)"/><rect x="18" y="18" width="64" height="64" fill="${t.sealMark}" fill-opacity=".9" mask="url(#emblem)"/>`
    : `<circle cx="50" cy="50" r="48" fill="${t.sealBg ?? t.cream}"/><text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-size="58" font-family="${FONT}" fill="${t.sealMark}">囍</text>`;
  writeFileSync(resolve(dir, `seal-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${sealBody}</svg>\n`);
  writeFileSync(resolve(dir, `ring-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46.5" fill="none" stroke="${t.sealKind === "heart" ? t.sealFrom : t.cream}" stroke-width="5.4"/></svg>\n`);
  // Nút Mở thiệp là hình pill kèm bóng vẽ trong SVG (bóng của khối Hình khối bị cắt thành ô vuông quanh nút).
  writeFileSync(resolve(dir, `button-${t.key}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 88"><defs><filter id="s" x="-30%" y="-60%" width="160%" height="240%"><feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="${t.button}" flood-opacity=".35"/></filter></defs><rect x="20" y="20" width="140" height="48" rx="24" fill="${t.button}" filter="url(#s)"/></svg>\n`);
  // Đường kẻ hai bên ❦: mờ dần ra ngoài (mẫu Minimalism) hoặc nét liền mảnh.
  const fade = (left: boolean) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 1" preserveAspectRatio="none"><defs><linearGradient id="r" x1="${left ? 0 : 1}" x2="${left ? 1 : 0}"><stop offset="0" stop-color="${t.accent ?? t.ink}" stop-opacity="0"/><stop offset="1" stop-color="${t.accent ?? t.ink}"/></linearGradient></defs><rect width="40" height="1" fill="url(#r)"/></svg>\n`;
  writeFileSync(resolve(dir, `rule-${t.key}-left.svg`), fade(true));
  writeFileSync(resolve(dir, `rule-${t.key}-right.svg`), fade(false));
}

type Open = { effect: string; time: number; delay: number };
const OPEN = (effect: string, time: number, delay = 0): Open => ({ effect, time, delay });
const center = (offset: number): Axis => ({ anchor: "center", offset });
const stretch: Axis = { anchor: "stretch", start: 0, end: 0 };

function put(type: string, id: string, box: { x: number | Axis; y: number | Axis; w: number; h: number; rotation?: number }, props: Record<string, JsonValue>, open: Open | undefined, styles: NodeStyles = {}): FreeNode {
  const node = newNode(registry, type, id, SIZE, { props }) as FreeNode;
  node.position = { mode: "free", x: typeof box.x === "number" ? center(box.x) : box.x, y: typeof box.y === "number" ? center(box.y) : box.y };
  node.size = { w: { kind: "px", v: box.w }, h: { kind: "px", v: box.h } };
  node.rotation = box.rotation ?? 0;
  node.styles = { ...node.styles, ...styles };
  if (open) node.props = { ...node.props, openEffect: open.effect, openTime: open.time, openDelay: open.delay };
  return node;
}

function buildCover(t: Theme) {
  writeAssets(t);
  const H = t.cardH ?? 420;
  const D = (H - 420) / 2;
  // Bìa hoa (Minimalism): cả tấm thẻ bay lên khỏi màn hình trong 0,8s (đo: envelope-away); các bìa khác mờ dần từ 0,9s.
  const FADE = t.flowers || t.leafCover ? OPEN("Bay lên rồi biến mất", 0.8, 0.25) : OPEN("Mờ dần", 0.7, 0.9);
  const decoration = (id: string, file: string, box: Parameters<typeof put>[2], open: Open | undefined, styles: NodeStyles = {}) =>
    put("Decoration", id, box, { src: `/demo/song-hy/${file}`, alt: "", fit: "contain", motion: false, motionTarget: "" }, open, styles);
  // Trái tim con dấu Hoa Mộc Xanh lấy nguyên path 24x24 của trang gốc (28px trong vòng 56px).
  // Con dấu tim đập nhịp tim; nút có vệt sáng quét (gốc: shine 3s, vệt 32px trên nút 140x48).
  const beat = (node: FreeNode): FreeNode => {
    if (t.leafCover) node.props = { ...node.props, idleEffect: "Thở nhẹ" };
    else if (t.sealKind === "heart") node.props = { ...node.props, idleEffect: "Đập" };
    if (t.sealKind === "mask") node.props = { ...node.props, idleEffect: "Thở nhẹ" };
    return node;
  };
  const text = (id: string, value: string, box: { x: number; y: number; w: number; h: number }, size: number, color: string, font: string, extra: Record<string, JsonValue> = {}) =>
    put("Text", id, box, { text: value, size, color, font, bold: false, italic: false, underline: false, align: "center", ...extra }, FADE);
  const rule = (id: string, side: "left" | "right") => t.ruleKind === "fade"
    ? decoration(id, `rule-${t.key}-${side}.svg`, { x: side === "left" ? -37 : 37, y: 14 - D, w: 40, h: 1 }, FADE)
    : put("Shape", id, { x: side === "left" ? -50 : 50, y: 13 - D, w: 60, h: 1 }, { shape: "rectangle", fill: t.cream, motionTarget: "" }, FADE, { opacity: 40 });
  const motifs = t.flowers || t.leafCover || t.flower ? [] : [
    decoration("open-motif-left", `xi-${t.key}.svg`, { x: -250, y: -170, w: 410, h: 410, rotation: -18 }, OPEN("Phóng ra rồi mờ dần", 1.3), { opacity: 0 }),
    decoration("open-motif-right", `xi-${t.key}.svg`, { x: 250, y: 170, w: 410, h: 410, rotation: 162 }, OPEN("Phóng ra rồi mờ dần", 1.3), { opacity: 0 }),
  ];
  // Hai bản sao hoa góc đứng yên, ẩn sẵn, rồi phóng to và nhoè khi mở (gốc: dragon-fly-forward 1,2s); hoa trong thẻ vẫn bay lên cùng thẻ.
  const fl = t.flower;
  const flowerClones = fl && t.key === "mbn" ? [
    put("Decoration", "open-flower-left", { x: fl.lx, y: fl.ly, w: fl.w, h: fl.h, rotation: fl.rot }, { src: fl.src, alt: "", fit: fl.fit ?? "contain", motion: false, motionTarget: "" }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
    put("Decoration", "open-flower-right", { x: fl.rx, y: fl.ry, w: fl.w, h: fl.h, rotation: -fl.rot }, { src: fl.src, alt: "", fit: "contain", motion: false, motionTarget: "", flipX: fl.flipRight }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
  ] : t.leafCover ? [
    put("Decoration", "open-flower-left", { x: -269, y: -109, w: 300, h: 300 }, { src: "/demo/hoa-moc-xanh/cover-flower.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
    put("Decoration", "open-flower-right", { x: 268.5, y: 119.5, w: 300, h: 300, rotation: 160 }, { src: "/demo/hoa-moc-xanh/cover-flower.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
  ] : t.flowers ? [
    decoration("open-flower-left", "hoa-do-ruou.svg", { x: -264.3, y: -78.4, w: 117.2, h: 280, rotation: 25 }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0 }),
    decoration("open-flower-right", "hoa-do-ruou.svg", { x: 264.3, y: -77, w: 117.2, h: 280, rotation: -25 }, OPEN("Phóng to rồi nhoè", 1.2), { opacity: 0, flipX: true }),
  ] : [];
  // Hoa trong thẻ là hai khối riêng đặt trong khối Thẻ thiệp (cắt ở mép thẻ, bo góc 8px); cả thẻ bay lên cùng nhau khi mở.
  const panel = (() => {
    if (!t.flowers && !t.leafCover && !t.flower && t.key !== "xanh") return [] as FreeNode[];
    const node = put("CardPanel", "open-card-panel", { x: 0, y: 0, w: 600, h: H }, {}, FADE, { borderRadius: 8 });
    delete (node.styles as Record<string, unknown>).background;
    delete (node.styles as Record<string, unknown>).borderWidth;
    delete (node.styles as Record<string, unknown>).borderColor;
    node.children = fl ? [
      ...(t.cardImage ? [put("Decoration", "open-card-image", { x: 0, y: 0, w: 600, h: 420 }, { src: t.cardImage, alt: "", fit: "cover", motion: false, motionTarget: "" }, FADE)] : []),
      put("Decoration", "open-card-flower-left", { x: fl.lx, y: fl.ly, w: fl.w, h: fl.h, rotation: fl.rot }, { src: fl.src, alt: "", fit: fl.fit ?? "contain", motion: false, motionTarget: "" }, FADE, { opacity: fl.opL }),
      put("Decoration", "open-card-flower-right", { x: fl.rx, y: fl.ry, w: fl.rw ?? fl.w, h: fl.rh ?? fl.h, rotation: -fl.rot }, { src: fl.rsrc ?? fl.src, alt: "", fit: "contain", motion: false, motionTarget: "", flipX: fl.flipRight }, FADE, { opacity: fl.opR }),
    ] : t.leafCover ? [
      put("Decoration", "open-card-flower-left", { x: -269, y: -109, w: 300, h: 300 }, { src: "/demo/hoa-moc-xanh/cover-flower.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, FADE, { opacity: 40 }),
      put("Decoration", "open-card-flower-right", { x: 268.5, y: 119.5, w: 300, h: 300, rotation: 160 }, { src: "/demo/hoa-moc-xanh/cover-flower.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, FADE, { opacity: 30 }),
    ] : t.flowers ? [
      decoration("open-card-flower-left", "hoa-do-ruou.svg", { x: -264.3, y: -78.4, w: 117.2, h: 280, rotation: 25 }, OPEN("Mờ dần", 0.7, 0.25), { opacity: 80 }),
      decoration("open-card-flower-right", "hoa-do-ruou.svg", { x: 264.3, y: -77, w: 117.2, h: 280, rotation: -25 }, OPEN("Mờ dần", 0.7, 0.25), { opacity: 80, flipX: true }),
    ] : [
      put("Decoration", "open-card-chu-hy-left", { x: -280, y: -164, w: 300, h: 300, rotation: 30 }, { src: "/demo/song-hy-xanh/chu-hy.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, FADE, { opacity: 15 }),
      put("Decoration", "open-card-chu-hy-right", { x: 293, y: 164, w: 300, h: 300, rotation: 30 }, { src: "/demo/song-hy-xanh/chu-hy.webp", alt: "", fit: "contain", motion: false, motionTarget: "" }, FADE, { opacity: 15 }),
    ];
    return [node];
  })();
  const nodes: FreeNode[] = [
    put("Gradient", "open-bg", { x: stretch, y: stretch, w: 960, h: 900 }, { from: t.gradient[0], mid: t.gradient[1], to: t.gradient[2], direction: "Chéo xuống phải" }, undefined),
    put("Particles", "open-particles", { x: stretch, y: stretch, w: 960, h: 900 }, { shape: t.particleShape, direction: t.flowers || t.leafCover ? "Rơi xuống" : "Bay lên", char: t.particleChar, palette: t.leafCover ? "Một màu" : t.flowers ? "Đỏ vàng" : t.palette, color: t.leafCover ? (t.leafColor ?? "#c8dfa0") : t.cream, count: t.leafCover ? 12 : t.flowers ? 24 : 12, size: t.leafCover ? 19 : t.flowers ? 16 : 17, speed: t.leafCover ? 110 : t.flowers ? 150 : 100, opacity: t.leafCover ? 50 : t.flowers ? 100 : 50, drift: t.leafCover ? 19 : t.flowers ? 16 : 20 }, OPEN("Mờ dần", 1.3)),
    ...motifs,
    decoration("open-card", `card-${t.key}.svg`, { x: 0, y: 0, w: 600, h: H }, FADE, { shadow: { x: 0, y: 25, blur: 60, spread: -12, color: "#000000", opacity: 45 } }),
    ...panel,
    ...flowerClones,
    decoration("open-ring", `ring-${t.key}.svg`, { x: 0, y: -160 - D, w: t.sealImage ? 64 : 56, h: t.sealImage ? 64 : 56 }, OPEN("Gợn sóng lan ra", 0.6)),
    // Con dấu tim có quầng bóng mềm cùng màu (gốc: 0 5px 27px #511419 @.5); bo tròn để bóng không thành ô vuông.
    beat(t.sealImage ? put("Decoration", "open-seal", { x: 0, y: -160 - D, w: 52, h: 52 }, { src: t.sealImage, alt: "", fit: "contain", motion: false, motionTarget: "" }, OPEN("Thu nhỏ rồi biến mất", 0.5), { borderRadius: 26, shadow: { x: 0, y: 4, blur: 20, spread: 0, color: t.cream, opacity: 50 } }) : decoration("open-seal", `seal-${t.key}.svg`, { x: 0, y: -160 - D, w: 56, h: 56 }, OPEN("Thu nhỏ rồi biến mất", 0.5), t.sealKind === "heart"
      ? { borderRadius: 28, shadow: { x: 0, y: 5, blur: 27, spread: 0, color: t.sealFrom ?? "#511419", opacity: 50 } }
      : t.sealKind === "mask" ? { borderRadius: 28, shadow: { x: 0, y: 4, blur: 20, spread: 0, color: "#e8f0e4", opacity: 50 } } : {})),
    text("open-name1", t.name1, { x: 0, y: -91 - D, w: 500, h: 44 }, 36, t.ink, t.nameFont),
    text("open-amp", "&", { x: 0, y: -60 - D, w: 100, h: 26 }, 20, t.ink, t.ampFont ?? baskerville),
    text("open-name2", t.name2, { x: 0, y: -26 - D, w: 500, h: 44 }, 36, t.ink, t.nameFont),
    rule("open-rule-left", "left"),
    text("open-orn", "❦", { x: 0, y: 14 - D, w: 40, h: 22 }, 14, t.accent ?? t.ink, baskerville),
    rule("open-rule-right", "right"),
    text("open-date", t.date, { x: 0, y: 46 - D, w: 400, h: 30 }, 18, t.dim, lora),
    // Dòng "Thân mời": khối Khách mời, hiện "Thân mời <tên khách>" khi mở link riêng, còn link chung thì giữ chữ "Thân Mời".
    t.guestChip || t.inviteLabel ? text("open-invite", t.inviteLabel ?? "Thân Mời", { x: 0, y: t.inviteY ?? 93 - D, w: 300, h: 30 }, 18, t.dim, lora) : put("GuestText", "open-invite", { x: 0, y: t.inviteY ?? 93 - D, w: 300, h: 30 }, { field: "Tên khách", prefix: "Thân mời", fallback: "Thân Mời", size: 18, color: t.dim, font: lora, bold: false, italic: false, align: "center" }, FADE),
    ...(t.guestChip ? [
      put("Shape", "open-guest-chip", { x: 0, y: t.guestChip.y, w: t.guestChip.w, h: t.guestChip.h }, { shape: "rectangle", fill: t.guestChip.fill, motionTarget: "" }, FADE, { opacity: t.guestChip.fillOpacity, borderRadius: t.guestChip.radius }),
      put("GuestText", "open-guest-name", { x: 0, y: t.guestChip.y, w: t.guestChip.w - 12, h: 32 }, { field: "Tên khách", prefix: "", fallback: t.guestChip.fallback, size: t.guestChip.size, color: t.guestChip.color, font: lora, bold: false, italic: false, align: "center" }, FADE),
    ] : []),
    ...(t.extraLine ? [text("open-extra-line", t.extraLine.text, { x: 0, y: t.extraLine.y, w: t.extraLine.w, h: 24 }, t.extraLine.size, t.extraLine.color, lora)] : []),
    decoration("open-button", `button-${t.key}.svg`, { x: 0, y: t.buttonY ?? 154 + D, w: 180, h: 88 }, FADE),
    ...(t.flowers || t.leafCover || t.flower || t.key === "xanh" ? [(() => { const shine = decoration("open-button-shine", "", { x: 0, y: t.buttonY ?? 154 + D, w: 140, h: 48 }, FADE); shine.props = { ...shine.props, src: "", idleEffect: "Ánh sáng quét", shineRadius: 24 }; return shine; })()] : []),
    text("open-label", t.openLabel ?? "Mở thiệp", { x: 0, y: t.buttonY ?? 154 + D, w: 140, h: 48 }, t.openLabel && t.openLabel.length > 12 ? 13 : 18, t.buttonText, lora, { motionTarget: "cover" }),
    put("Burst", "open-burst", { x: 0, y: 235 + D, w: 96, h: 40 }, { char: t.burstChar, ...(t.leafCover ? { shape: "Lá" } : {}), count: 32, spread: 420, delay: 0.5, palette: t.leafCover ? (t.burstPalette ?? "Lá xanh") : t.palette }, undefined),
  ];
  const page = emptyPage();
  const data = { ...page, root: { ...page.root, styles: { ...page.root.styles, background: t.gradient[1], minHeight: 900, phoneMinHeight: 812 }, children: nodes } };
  const cover = { id: "cover", name: "Bìa", layout: "full", data, interactions: { "open-label": { type: "go-to-page", targetPageId: "invitation", transition: "fade", durationMs: 450 } } };
  writeFileSync(resolve(__dirname, `../public/demo/song-hy/cover-${t.key}.json`), JSON.stringify(cover));
  console.log(`Đã ghi bìa ${t.key} với ${nodes.length} khối`);
}

// Chạy một chủ đề: `npx tsx scripts/make-song-hy-covers.ts mbn`; không đối số thì sinh lại tất cả.
themes.filter((t) => !process.argv[2] || t.key === process.argv[2]).forEach(buildCover);
