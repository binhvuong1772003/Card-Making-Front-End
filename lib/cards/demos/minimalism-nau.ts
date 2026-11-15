import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles, type PageData, type TreeNode } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import { nameLayers } from "../layers";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-mbn.json";

// Source study: https://chungdoi.com/vi/mau-thiep/minimalism-nau/demo
// Each image, text and section is a normal CardMaking block so the whole draft stays editable.
const registry = { ...builtInRegistry, ...cardDefinitions };
const root = "/demo/minimalism-nau";
const paper = "#fff7f3";
const ink = "#7c6a60";
const dark = "#563d35";
const gold = "#b89b71";
const bodyFont = "Baskerville, 'Times New Roman', serif";
const displayFont = "'EB Garamond', 'Times New Roman', serif";
const titleFont = "'Times New Roman', serif";
const scriptFont = "'The Nautigal', cursive";
type Rect = [number, number, number, number];
const nodes: TreeNode[] = [];

function add(type: string, id: string, desktop: Rect, props: Record<string, JsonValue>, styles: NodeStyles = {}, rotation = 0, phone?: Rect): FreeNode {
  const [x, y, w, h] = desktop;
  const [px, py, pw, ph] = phone ?? [Math.round(x / 2.4), Math.round(y * 0.86), Math.round(w / 2.4), Math.round(h / 2.4)];
  const node = newNode(registry, type, id, { w: 900, h: 7200 }, { props }) as FreeNode;
  node.position = { mode: "free", x: { anchor: "start", offset: x }, y: { anchor: "start", offset: y } };
  node.size = { w: { kind: "px", v: w }, h: { kind: "px", v: h } };
  node.phone = { x: { anchor: "start", offset: px }, y: { anchor: "start", offset: py }, w: { kind: "px", v: pw }, h: { kind: "px", v: ph }, rotation };
  node.rotation = rotation;
  node.styles = { ...node.styles, ...styles };
  nodes.push(node);
  return node;
}

function text(id: string, value: string, rect: Rect, options: { size?: number; color?: string; font?: string; bold?: boolean; align?: "left" | "center" | "right"; opacity?: number; letterSpacing?: number; phone?: Rect } = {}) {
  const n = add("Text", id, rect, {
    text: value, size: options.size ?? 26, color: options.color ?? ink,
    font: options.font ?? bodyFont, bold: options.bold ?? false,
    italic: false, underline: false, align: options.align ?? "center",
    letterSpacing: options.letterSpacing ?? 0,
  }, options.opacity === undefined ? {} : { opacity: options.opacity }, 0, options.phone);
  n.phoneProps = { size: Math.max(12, Math.round((options.size ?? 26) * 0.66)) };
  return n;
}

function shape(id: string, rect: Rect, fill: string, styles: NodeStyles = {}, kind = "rectangle", phone?: Rect) {
  return add("Shape", id, rect, { shape: kind, fill }, styles, 0, phone);
}

function art(id: string, asset: string, rect: Rect, options: { opacity?: number; rotation?: number; float?: boolean; flipX?: boolean; fit?: string; phone?: Rect; extra?: Record<string, JsonValue>; src?: string } = {}) {
  return add("Decoration", id, rect, {
    src: options.src ?? `${root}/decoration-${asset}.webp`, alt: asset.replaceAll("-", " "), fit: options.fit ?? "contain",
    flipX: options.flipX ?? false, motion: false, floatMotion: options.float ?? false, ...options.extra,
  }, options.opacity === undefined ? {} : { opacity: options.opacity }, options.rotation ?? 0, options.phone);
}

function heading(id: string, value: string, y: number, width = 850, size = 28) {
  text(id, value, [(900 - width) / 2, y, width, 42], { size, font: titleFont, bold: true, color: ink });
}

// Shared botanical and architecture backdrops remain separately selectable.
art("leaf-paper-backdrop", "leaf-background", [-216, 20, 467, 1328], { opacity: 12, float: true, phone: [-50, 5, 230, 850] });
art("house-paper-backdrop", "house-background", [-135, 320, 1170, 1150], { opacity: 8, phone: [-60, 260, 490, 730] });

// Hero image + decorative surround (the photo/frame can each be replaced independently).
shape("hero-paper", [0, 0, 900, 1055], paper);
add("Image", "hero-photo", [226, 234, 420, 598], { src: `${root}/photo-1.webp`, alt: "Ảnh cưới của Hoàng Nam và Thảo Vy", fit: "cover" }, {}, 0, [47, 152, 245, 350]);
art("hero-avatar-frame", "frame-avatar", [189, 190, 520, 739], { phone: [27, 112, 270, 408] });
art("hero-flower-left", "flower2-decoration", [163, 553, 177, 411], { float: true, rotation: -4, phone: [9, 346, 104, 242] });
art("hero-leaf-accent", "leaf-background", [620, 200, 180, 380], { opacity: 14, phone: [284, 125, 78, 220] });
text("hero-kicker", "THE WEDDING OF", [200, 22, 500, 34], { size: 17, color: ink, font: bodyFont, letterSpacing: 5 });

// Wedding details panel. Original page measurements: panel y≈1057, 560×992; headline y≈1093.
shape("details-panel", [170, 1057, 560, 992], "#fffaf5", { borderRadius: 2, shadow: { x: 0, y: 12, blur: 28, spread: 0, color: dark, opacity: 12 } }, "rectangle", [8, 910, 359, 810]);
art("details-paper-texture", "paper", [170, 1057, 560, 992], { opacity: 50, fit: "cover", phone: [8, 910, 359, 810] });
art("details-flower-left", "flower2-decoration", [55, 1250, 175, 425], { float: true, phone: [-5, 1040, 104, 245] });
art("details-flower-right", "flower2-decoration", [645, 1682, 179, 416], { float: true, phone: [290, 1330, 100, 238] });
heading("families-heading", "THÔNG TIN LỄ CƯỚI", 1093, 500, 29);
text("groom-family-label", "Ông Bà", [205, 1164, 210, 26], { size: 16, phone: [15, 1000, 165, 24] });
text("groom-family-father", "Trần Quốc Hưng", [205, 1190, 210, 30], { size: 18, bold: true, color: dark, phone: [10, 1025, 170, 28] });
text("groom-family-mother", "Nguyễn Thị Hồng", [205, 1220, 210, 30], { size: 18, bold: true, color: dark, phone: [10, 1055, 170, 28] });
text("groom-family-address", "Quận 1, TP. Hồ Chí Minh", [195, 1255, 230, 25], { size: 13, phone: [8, 1088, 175, 34] });
shape("family-divider", [449, 1160, 1, 112], "#c7b7a8", {}, "rectangle", [187, 1000, 1, 120]);
text("bride-family-label", "Ông Bà", [485, 1164, 210, 26], { size: 16, phone: [195, 1000, 165, 24] });
text("bride-family-father", "Lê Văn Thành", [485, 1190, 210, 30], { size: 18, bold: true, color: dark, phone: [190, 1025, 170, 28] });
text("bride-family-mother", "Phạm Thị Lan", [485, 1220, 210, 30], { size: 18, bold: true, color: dark, phone: [190, 1055, 170, 28] });
text("bride-family-address", "Quận 3, TP. Hồ Chí Minh", [475, 1255, 230, 25], { size: 13, phone: [190, 1088, 175, 34] });
text("invite-copy", "TRÂN TRỌNG BÁO TIN\nLỄ THÀNH HÔN CỦA CON CHÚNG TÔI", [220, 1320, 460, 70], { size: 23, font: titleFont, color: dark, phone: [20, 1145, 335, 60] });
text("groom-name", "Nguyễn Hoàng Nam", [205, 1415, 490, 80], { size: 58, font: displayFont, color: dark, phone: [15, 1220, 345, 68] });
text("groom-role", "TRƯỞNG NAM", [300, 1505, 300, 24], { size: 13, letterSpacing: 2, phone: [70, 1295, 235, 20] });
text("couple-ampersand", "&", [380, 1550, 140, 45], { size: 36, font: scriptFont, color: dark, phone: [137, 1335, 100, 38] });
text("bride-name", "Trần Thảo Vy", [205, 1600, 490, 80], { size: 58, font: displayFont, color: dark, phone: [15, 1372, 345, 68] });
text("bride-role", "ÚT NỮ", [300, 1690, 300, 24], { size: 13, letterSpacing: 2, phone: [70, 1445, 235, 20] });
text("ceremony-place", "LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA", [245, 1735, 410, 66], { size: 23, font: titleFont, color: dark, phone: [25, 1480, 325, 54] });
text("ceremony-time-label", "VÀO LÚC 09:00", [220, 1820, 220, 30], { size: 16, phone: [25, 1540, 155, 28] });
text("ceremony-day", "THỨ BẢY", [475, 1820, 200, 30], { size: 16, phone: [195, 1540, 155, 28] });
text("ceremony-date", "03  │  THÁNG 01\n       2026", [300, 1870, 300, 92], { size: 28, font: bodyFont, color: dark, phone: [90, 1580, 195, 76] });
text("ceremony-lunar", "(TỨC NGÀY 15 THÁNG 11 NĂM ẤT TỴ)", [230, 1970, 440, 28], { size: 15, letterSpacing: 1, phone: [25, 1660, 325, 26] });

// Source HTML shows one 3D coverflow Album with 8 photos; keep the gallery as one editable Album block.
heading("album-heading", "ALBUM ẢNH", 2089);
add("Album", "wedding-album", [150, 2159, 600, 552], {
  images: Array.from({ length: 8 }, (_, index) => `${root}/photo-${index + 1}.webp`),
  autoplay: false, interval: 3, startAt: 1, lightbox: true, radius: 16, dotColor: ink,
}, {}, 0, [10, 1825, 355, 360]);

// Reception, calendar and RSVP.
shape("reception-panel", [170, 2731, 560, 935], "#fffaf5", { borderRadius: 2, shadow: { x: 0, y: 10, blur: 24, spread: 0, color: dark, opacity: 12 } }, "rectangle", [8, 2345, 359, 760]);
art("reception-paper-texture", "paper", [170, 2731, 560, 935], { opacity: 50, fit: "cover", phone: [8, 2345, 359, 760] });
art("reception-leaf-accent", "leaf-background", [675, 2850, 235, 465], { opacity: 14, phone: [287, 2370, 90, 210] });
art("reception-flowers", "flower2-decoration", [65, 3260, 175, 420], { float: true, phone: [0, 2650, 90, 210] });
heading("reception-heading", "THÔNG TIN TIỆC CƯỚI", 2767, 500);
text("reception-intro", "TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:", [280, 2821, 340, 42], { size: 24, font: bodyFont });
text("reception-time", "18:00", [350, 2875, 200, 42], { size: 26, bold: true, color: dark });
text("reception-date", "THỨ BẢY     │     03     │     THÁNG 01\n2026", [260, 2930, 380, 80], { size: 24, color: dark });
text("reception-lunar", "(TỨC NGÀY 15 THÁNG 11 NĂM ẤT TỴ)", [265, 3025, 370, 26], { size: 14, letterSpacing: 1 });
text("arrival", "ĐÓN KHÁCH\n17:30", [280, 3090, 145, 58], { size: 17, color: dark });
text("banquet", "KHAI TIỆC\n18:00", [475, 3090, 145, 58], { size: 17, color: dark });
add("Calendar", "wedding-calendar", [280, 3170, 340, 345], {
  date: "2026-01-03", color: dark, weekColor: ink, markColor: dark, markTextColor: "#fffaf5",
  markShape: "Tròn", font: bodyFont, titleFont: scriptFont, size: 14, titleSize: 22,
  titleWeight: "400", titleSpacing: 0, titleGap: 14, weekSize: 12, weekWeight: "400", weekGap: 12,
  dayWeight: "400", padding: 10, lines: true, innerFrame: false,
  eventButton: "Thêm vào lịch", eventTitle: "Đám cưới Nguyễn Hoàng Nam & Trần Thảo Vy", eventTime: "18:00",
  eventPlace: "Trung Tâm Hội Nghị White Palace, TP. Hồ Chí Minh",
}, { background: "#f6eadd", borderWidth: 1, borderColor: "#bca995", borderRadius: 4 }, 0, [26, 2710, 323, 328]);
add("Button", "rsvp-button", [330, 3550, 240, 48], { label: "XÁC NHẬN THAM DỰ", href: "", action: "", payload: {}, fill: dark, textColor: "#fffaf5", shape: "rounded", size: 15, font: bodyFont });

// Venue/map section, followed by an editable dress-code block.
shape("venue-panel", [0, 3681, 900, 594], "#fffaf5", { opacity: 96 }, "rectangle", [0, 3165, 375, 515]);
art("venue-paper-texture", "paper", [170, 3681, 560, 530], { opacity: 48, fit: "cover", phone: [8, 3165, 359, 485] });
art("venue-house-background", "house-background", [-100, 3622, 1120, 620], { opacity: 8, phone: [-40, 3050, 455, 420] });
art("venue-flower", "flower2-decoration", [680, 3750, 190, 435], { float: true, flipX: true, phone: [286, 3120, 82, 198] });
heading("venue-heading", "TIỆC CƯỚI SẼ TỔ CHỨC TẠI", 3713, 600, 28);
text("venue-name", "Trung Tâm Hội Nghị White Palace", [190, 3760, 520, 38], { size: 22, color: dark });
text("venue-address", "194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh", [170, 3800, 560, 44], { size: 16 });
add("Map", "wedding-map", [210, 3860, 480, 340], {
  name: "Trung Tâm Hội Nghị White Palace", address: "194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh",
  heading: "", button: "Chỉ đường", color: dark, innerFrame: true, padding: 12, zoom: 15,
}, { borderColor: "#c8b7a8", borderRadius: 4 }, 0, [20, 3200, 335, 240]);
add("DressCode", "dress-code", [280, 4360, 340, 185], {
  heading: "DRESS CODE", subtitle: "Trang phục dự tiệc", headingColor: dark, subtitleColor: ink,
  swatchShape: "circle", swatchSize: 46, swatchGap: 20, colors: ["#8d9d70", "#e7e8e9", "#e8dec6"],
}, {}, 0, [18, 3660, 339, 185]);

// Five-row schedule with individual editable icons and labels.
shape("schedule-panel", [170, 4513, 560, 410], "#fffaf5", { borderRadius: 2, shadow: { x: 0, y: 8, blur: 20, spread: 0, color: dark, opacity: 10 } }, "rectangle", [8, 3880, 359, 330]);
art("schedule-paper", "paper", [170, 4513, 560, 410], { opacity: 48, fit: "cover", phone: [8, 3880, 359, 330] });
art("schedule-flower", "flower2-decoration", [695, 4447, 195, 370], { float: true, flipX: true, phone: [296, 3730, 77, 195] });
heading("schedule-heading", "LỊCH TRÌNH NGÀY CƯỚI", 4549, 600, 28);
shape("schedule-line", [340, 4620, 1, 260], "#b9a99c");
const schedule = [
  ["17:00", "Đón khách", "gate"], ["18:00", "Khai tiệc", "water"],
  ["18:30", "Nghi thức cưới", "gate"], ["19:00", "Cắt bánh & nâng ly", "cake"], ["20:30", "Kết thúc tiệc", "water"],
] as const;
schedule.forEach(([time, label, icon], i) => {
  const y = 4605 + i * 54;
  art(`schedule-icon-${i + 1}`, icon, [240, y, 38, 42], { phone: [55, Math.round((y - 4500) * 0.9), 24, 28] });
  text(`schedule-time-${i + 1}`, time, [360, y + 4, 120, 34], { size: 20, color: dark });
  text(`schedule-label-${i + 1}`, label, [495, y + 4, 230, 34], { size: 18, align: "left" });
});

// Guestbook: native form plus 10 compact sample entries; the published form can grow without reserved blank space.
art("guestbook-leaf-background", "leaf-background", [-170, 4804, 1000, 1129], { opacity: 9, phone: [-60, 4240, 485, 670] });
art("guestbook-paper-note", "paper-note", [125, 5019, 650, 478], { opacity: 96, fit: "cover", phone: [10, 4315, 355, 330] });
heading("guestbook-heading", "SỔ LƯU BÚT", 5082, 500, 29);
const wishes = formPresets.find(({ id }) => id === "wishes")!;
add("Form", "guestbook-form", [190, 5140, 520, 330], {
  ...wishes.props, formId: "demo-minimalism-nau-wishes", heading: "", intro: "", button: "GỬI LỜI CHÚC",
  color: dark, fieldColor: dark, fieldBorderColor: "#9a8177", font: bodyFont, padding: 12, compact: true,
  previewSampleCount: 0,
}, { borderWidth: 0, borderRadius: 0 }, 0, [14, 4430, 347, 310]);
const sampleWishes = [
  ["Mỹ Linh", "Chúc hai bạn trăm năm hạnh phúc!"],
  ["Minh Anh", "Chúc hai bạn luôn yêu thương và đồng hành bên nhau."],
  ["Gia đình cô Hoa", "Chúc mừng ngày trọng đại của hai con."],
  ["Tuấn Anh", "Chúc đôi uyên ương viên mãn, sớm đón tin vui."],
  ["Khánh Vy", "Chúc tình yêu của hai bạn luôn đong đầy."],
  ["Hoài Nam", "Mừng ngày vui, chúc hai bạn bền lâu."],
  ["Phương Anh", "Chúc hai bạn mãi nắm tay nhau."],
  ["Thu Hà", "Một ngày thật đẹp và một đời thật vui nhé!"],
  ["Bảo Ngọc", "Chúc gia đình nhỏ luôn tràn ngập tiếng cười."],
  ["Quốc Hưng", "Chúc hai bạn hạnh phúc dài lâu."],
] as const;
sampleWishes.forEach(([name, message], i) => {
  const y = 5530 + i * 100;
  shape(`wish-card-${i + 1}`, [145, y, 610, 82], "#fffaf5", { borderWidth: 1, borderColor: "#d7c7bc", borderRadius: 8, opacity: 92 });
  text(`wish-name-${i + 1}`, name, [165, y + 9, 300, 24], { size: 17, color: dark, bold: true, align: "left" });
  text(`wish-date-${i + 1}`, "03/01/2026", [535, y + 9, 195, 22], { size: 13, align: "right" });
  text(`wish-message-${i + 1}`, message, [165, y + 37, 555, 34], { size: 16, align: "left" });
});

// Gift section. Every decorative present remains its own node and can be moved or removed.
art("gift-house-background", "house-background", [-170, 6559, 1210, 600], { opacity: 8, phone: [-45, 5660, 465, 320] });
heading("gift-heading", "HỘP QUÀ MỪNG", 6559, 520, 29);
// Hộp quà: số đo đọc từ nút "Nhấn để mở" (260x280, trái x=320, trên y=6605). Hộp chính và bảy hộp nhỏ tách riêng,
// rê chuột cả nhóm "qua" (hộp nảy lên, hộp nhỏ bay lên rồi hiện lại, pháo giấy), bóng thở và bốn ngôi sao chớp lệch pha 0 / 0,6 / 1,2 / 1,7s.
const GIFT_LEFT = 320;
const GIFT_TOP = 6605;
const giftFly = (rise: number, sway: number, time: number, delay: number): Record<string, JsonValue> => ({ hoverEffect: "Bay lên rồi hiện lại", hoverGroup: "qua", hoverRise: rise, hoverSway: sway, hoverTime: time, hoverDelay: delay });
shape("gift-shadow", [GIFT_LEFT + 130 - 72, GIFT_TOP + 249, 144, 12], "#33261f", { opacity: 27, shadow: { x: 0, y: 0, blur: 4, spread: 0, color: "#000000", opacity: 30 } }, "ellipse", [128, 5990, 120, 10]);
const GIFT_MINIS: Array<[string, string, number, number, number, number, number, Rect, Record<string, JsonValue>]> = [
  ["gift-mini-1", "gift-mini-minimalism_purple", 27, 60, 34, 34, -22, [92, 5750, 23, 26], giftFly(55, -14, 1.6, 0)],
  ["gift-mini-2", "gift-mini-song_hac_red", 217, 55, 38, 39, 20, [263, 5745, 22, 26], giftFly(60, 14, 1.8, 0.15)],
  ["gift-mini-3", "gift-mini-minimalism_darkred", 27, 166, 26, 27, -18, [71, 5810, 24, 26], giftFly(65, -10, 1.4, 0.3)],
  ["gift-mini-4", "gift-mini-spring_garden_blue", 224, 160, 24, 25, 14, [282, 5810, 23, 26], giftFly(70, 12, 1.7, 0.45)],
  ["gift-mini-5", "gift-mini-porcelain_brown", 44, 227, 44, 44, 8, [90, 5850, 23, 26], giftFly(80, -8, 1.9, 0.1)],
  ["gift-mini-6", "gift-mini-porcelain_v2_pink", 69, 229, 26, 27, -10, [260, 5847, 23, 26], giftFly(75, 10, 1.3, 0.35)],
  ["gift-mini-7", "gift-mini-double_dragon_red", 168, 229, 40, 41, -14, [175, 5885, 23, 26], giftFly(72, 14, 1.7, 0.2)],
];
GIFT_MINIS.slice(0, 4).forEach(([id, asset, cx, cy, w, h, rotation, phone, extra]) => art(id, asset, [GIFT_LEFT + cx - w / 2, GIFT_TOP + cy - h / 2, w, h], { rotation, float: true, phone, extra }));
art("gift-main", "gift-main", [GIFT_LEFT + 130 - 85, GIFT_TOP + 164 - 89.5, 170, 179], { float: true, phone: [110, 5770, 155, 170], extra: { hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 } });
art("gift-confetti", "", [440, GIFT_TOP + 70, 20, 4], { src: "", phone: [178, 5765, 20, 4], extra: { hoverEffect: "Pháo giấy", hoverGroup: "qua" } });
GIFT_MINIS.slice(4).forEach(([id, asset, cx, cy, w, h, rotation, phone, extra]) => art(id, asset, [GIFT_LEFT + cx - w / 2, GIFT_TOP + cy - h / 2, w, h], { rotation, float: true, phone, extra }));
([[45, 38.5, 24], [227.5, 62, 18], [18.5, 100.5, 16], [241.5, 84, 16]] as const).forEach(([cx, cy, side], index) => {
  const star = art(`gift-sparkle-${index + 1}`, "sparkle", [GIFT_LEFT + cx - side / 2, GIFT_TOP + cy - side / 2, side, side], { src: `${root}/sparkle.svg`, phone: [[100, 5740, 12, 12], [255, 5750, 10, 10], [86, 5760, 9, 9], [268, 5757, 9, 9]][index] as Rect, extra: { idleEffect: "Chớp sáng", idleDelay: [0, 0.6, 1.2, 1.7][index]! } });
  star.props = { ...star.props, alt: "Ngôi sao" };
});
text("gift-open-hint", "Nhấn để mở", [GIFT_LEFT + 95 - 35, GIFT_TOP + 264, 139, 15], { size: 12, color: ink, font: "system-ui, 'Gotham', sans-serif", phone: [118, 5985, 140, 18] });
text("thank-you", "Sự hiện diện của quý khách là niềm vui của gia đình chúng tôi!", [110, 7040, 680, 34], { size: 15, color: ink });

const pageData: PageData = {
  ...emptyPage(),
  root: nameLayers({ ...emptyPage().root, styles: { background: paper, minHeight: 7200, phoneMinHeight: 6200 }, children: nodes }),
  theme: { colors: { primary: dark, secondary: ink, paper }, fonts: { body: bodyFont, heading: titleFont } },
  meta: { title: "Minimalism Nâu · Nguyễn Hoàng Nam & Trần Thảo Vy", description: "Thiệp cưới phong cách Minimalism Nâu." },
};


// Popup quà mừng theo cửa sổ gốc 576x404 (nền #fff7f3, bo 16): thanh đầu nâu 70px (tiêu đề Times 20px chữ hoa), hai cột 256px cách 16px,
// nhãn 12px, thẻ QR trắng 160x160 bo 12 (ảnh 140), ba dòng ngân hàng 10px và nút "Lưu QR" 68x23. Số đo gốc nhân K để vừa khung 960; QR chỉ là hình minh hoạ.
function giftDetailsPage(): CardPage {
  const K = 960 / 576;
  const n = (v: number) => Math.round(v * K);
  const sans = "'Gotham', system-ui, sans-serif";
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";
  const list: FreeNode[] = [];
  const put = (type: string, id: string, left: number, top: number, w: number, h: number, props: Record<string, JsonValue>, styles: NodeStyles = {}) => {
    const node = newNode(registry, type, id, { w: 960, h: n(404) }, { props }) as FreeNode;
    node.position = { mode: "free", x: { anchor: "start", offset: n(left) }, y: { anchor: "start", offset: n(top) } };
    node.size = { w: { kind: "px", v: n(w) }, h: { kind: "px", v: n(h) } };
    node.styles = { ...node.styles, ...styles };
    list.push(node);
  };
  const label = (id: string, value: string, left: number, top: number, w: number, h: number, size: number, color: string, font: string, bold = false) =>
    put("Text", id, left, top, w, h, { text: value, size: Math.round(size * K), color, font, bold, italic: false, underline: false, align: "center" });
  put("Shape", "gift-popup-header", 0, 0, 576, 70, { shape: "rectangle", fill: ink, motionTarget: "" });
  label("gift-popup-title", "HỘP QUÀ MỪNG", 24, 24, 528, 30, 20, "#ffffff", titleFont, true);
  const columns = [
    { key: "groom", left: 24, title: "Chú Rể - Hoàng Nam", bank: "Vietcombank", number: "1023456789", holder: "Hoàng Nam", qr: `${root}/qr-groom.png` },
    { key: "bride", left: 296, title: "Cô Dâu - Thảo Vy", bank: "Techcombank", number: "9988776655", holder: "Thảo Vy", qr: `${root}/qr-bride.png` },
  ];
  for (const c of columns) {
    const mid = c.left + 128;
    label(`gift-popup-${c.key}-label`, c.title, mid - 128, 94, 256, 20, 12, ink, sans);
    put("Shape", `gift-popup-${c.key}-qr-card`, mid - 80, 134, 160, 160, { shape: "rectangle", fill: "#ffffff", motionTarget: "" }, { borderRadius: n(12) });
    put("Image", `gift-popup-${c.key}-qr`, mid - 70, 144, 140, 140, { src: c.qr, alt: `Mã QR mừng cưới ${c.key === "groom" ? "chú rể" : "cô dâu"}`, fit: "contain" });
    label(`gift-popup-${c.key}-bank`, c.bank, mid - 128, 302, 256, 15, 10, ink, sans);
    label(`gift-popup-${c.key}-number`, c.number, mid - 128, 319, 256, 15, 10, ink, mono);
    label(`gift-popup-${c.key}-holder`, c.holder.toUpperCase(), mid - 128, 336, 256, 15, 10, ink, sans, true);
    put("Shape", `gift-popup-${c.key}-save`, mid - 34, 357, 68, 23, { shape: "rectangle", fill: "#f4ebe7", motionTarget: "" }, { borderRadius: n(12) });
    label(`gift-popup-${c.key}-save-label`, "↓ Lưu QR", mid - 34, 361, 68, 15, 10, ink, sans);
  }
  const page = emptyPage();
  const data: PageData = { ...page, root: nameLayers({ ...page.root, styles: { background: paper, minHeight: n(404), phoneMinHeight: n(404) }, children: list }) };
  return { id: "gift-details", name: "Hộp quà mừng", data, interactions: {}, popup: { width: 641, effect: "fade", backdropColor: "#000000", backdropOpacity: 40 } };
}

// Popup "Xác nhận tham dự" (gốc: hộp 448px, tên + có/không + nút gửi): bộ câu hỏi dựng sẵn "Xác nhận tham dự", màu nâu của mẫu.
function rsvpPage(): CardPage {
  const attendance = formPresets.find((preset) => preset.id === "attendance")!;
  const form = newNode(registry, "Form", "rsvp-popup-form", { w: 600, h: 620 }, { props: { ...attendance.props, formId: "demo-minimalism-nau-rsvp", heading: "Xác nhận tham dự", intro: "Sự hiện diện của bạn là niềm vinh hạnh cho gia đình chúng tôi. Xin xác nhận để chúng tôi chuẩn bị chu đáo nhất.", color: ink, padding: 20 } }) as FreeNode;
  form.position = { mode: "free", x: { anchor: "start", offset: 28 }, y: { anchor: "start", offset: 86 } };
  form.size = { w: { kind: "px", v: 544 }, h: { kind: "px", v: 490 } };
  form.phone = { x: { anchor: "start", offset: 20 }, y: { anchor: "start", offset: 86 }, w: { kind: "px", v: 335 }, h: { kind: "px", v: 490 }, rotation: 0 };
  const data: PageData = { ...emptyPage(), root: { ...emptyPage().root, styles: { background: "#ffffff", minHeight: 620, phoneMinHeight: 620 }, children: [form] } };
  return { id: "rsvp", name: "Xác nhận tham dự", data, popup: { width: 448, effect: "fade", backdropColor: "#000000", backdropOpacity: 40 }, interactions: {} };
}

const invitation: CardPage = {
  id: "invitation", name: "Thiệp mời", data: pageData,
  interactions: { "rsvp-button": { type: "open-popup", targetPageId: "rsvp", transition: "fade", durationMs: 200 }, ...Object.fromEntries(["gift-main", "gift-open-hint", ...GIFT_MINIS.map(([id]) => id)].map((id) => [id, { type: "open-popup", targetPageId: "gift-details", transition: "fade", durationMs: 250 } as const])) },
};

export const minimalismNauDemoDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "cover", pages: [coverJson as unknown as CardPage, invitation, giftDetailsPage(), rsvpPage()],
};
