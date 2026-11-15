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

// Số đo đọc trực tiếp từ DOM trang gốc (cột 900px; y gốc tính từ khung nội dung, trang bắt đầu cao hơn 104,5px). Mọi y bên dưới là y của trang.
const Y = (v: number) => Math.round(v + 104.5);
const KICK = "#827771";
const MUTED = "#918077";
const LIGHT = "#ded9d7";
const corm = "'Cormorant Garamond', serif";
const madi = "'Ms Madi', cursive";
// Chữ căn giữa theo tâm cx của bản gốc; điện thoại giữ tâm lệch theo tỉ lệ 375/900.
const tc = (id: string, value: string, cx: number, y: number, w: number, h: number, o: Parameters<typeof text>[3] = {}) => {
  const pw = Math.min(w, 345);
  return text(id, value, [Math.round(cx - w / 2), y, w, h], { ...o, phone: o.phone ?? [Math.round(187.5 + (cx - 450) * 0.42 - pw / 2), Math.round(y * 0.86), pw, h] });
};
const panelShadow = { x: 4, y: 4, blur: 8, spread: 0, color: "#000000", opacity: 18 };
const panel = (id: string, rect: Rect, radius: number, asset: string) => {
  shape(`${id}-panel`, rect, "#f6eadd", { borderRadius: radius, shadow: panelShadow }, "rectangle", [8, Math.round(rect[1] * 0.86), 359, Math.round(rect[3] * 0.82)]);
  // Gốc: ảnh giấy nhân màu 50% lên nền #f6eadd; ở đây hoạ tiết đã trộn sẵn thành một ảnh để người dùng thay được.
  art(`${id}-paper`, "", [rect[0], rect[1], rect[2], rect[3]], { src: `${root}/panel-${asset}.webp`, fit: "cover", phone: [8, Math.round(rect[1] * 0.86), 359, Math.round(rect[3] * 0.82)] });
};

// Lớp nền chung: lá và nhà nền hoà vào trang (gốc nhân màu, độ mờ 8-12%).
art("leaf-paper-backdrop", "leaf-background", [-215, Y(-82), 467, 1328], { opacity: 12, float: true, phone: [-50, 5, 230, 850] });
art("house-paper-backdrop", "house-background", [-134, Y(214), 1167, 1151], { opacity: 8, phone: [-60, 260, 490, 730] });

// Đầu trang: chữ tên phía trên, ảnh đôi trong khung polaroid, hoa khô.
tc("hero-kicker", "THE WEDDING OF", 450, Y(-55), 240, 24, { size: 16, color: KICK, font: corm, bold: true, letterSpacing: 2.6 });
tc("hero-name-1", "Hoàng Nam", 345, Y(-15), 260, 69, { size: 46, color: KICK, font: titleFont });
nodes[nodes.length - 1]!.props = { ...nodes[nodes.length - 1]!.props, italic: true };
tc("hero-amp", "&", 486, Y(-7), 60, 54, { size: 54, color: MUTED, font: scriptFont });
tc("hero-name-2", "Thảo Vy", 592, Y(-15), 190, 69, { size: 46, color: KICK, font: titleFont });
nodes[nodes.length - 1]!.props = { ...nodes[nodes.length - 1]!.props, italic: true };
// Ảnh 374x569 xoay -4,78 độ (nền trắng, cắt theo khung), tâm lệch (-13, -26) so với tâm khung 520x739; khung nằm trên ảnh.
add("Image", "hero-photo", [250, 249, 374, 569], { src: `${root}/photo-1.webp`, alt: "Ảnh cưới của Hoàng Nam và Thảo Vy", fit: "cover" }, { background: "#ffffff" }, -4.78, [58, 155, 194, 295]);
art("hero-avatar-frame", "frame-avatar", [190, Y(86), 520, 739], { phone: [27, 112, 270, 384] });
art("hero-flower-left", "flower2-decoration", [164, Y(449), 177, 411], { float: true, phone: [9, 346, 104, 242] });
// Hoa và lá cạnh panel đầu (đọc tâm và góc xoay từ DOM: hoa lật ngang bên phải, lá xoay 10,57 độ bên trái).
art("details-flower-right", "flower2-decoration", [646, 1683, 179, 416], { float: true, flipX: true, phone: [290, 1330, 100, 238] });
art("details-leaf-left", "leaf-background", [80, 1378, 157, 446], { rotation: 10.57, phone: [-5, 1040, 90, 255] });

// Thông tin lễ cưới: panel #f6eadd bo 13, đổ bóng 4px 4px 8px.
panel("details", [170, Y(953), 560, 992], 13, "details");
tc("families-heading", "THÔNG TIN LỄ CƯỚI", 450, Y(993), 260, 22, { size: 20, font: titleFont, bold: true, letterSpacing: 0.5 });
const family = (side: "groom" | "bride", cx: number, father: string, mother: string, address: string) => {
  tc(`${side}-family-label`, "Ông Bà", cx, Y(1045), 80, 14, { size: 12, color: MUTED });
  tc(`${side}-family-father`, father, cx, Y(1066), 150, 14, { size: 12, bold: true });
  tc(`${side}-family-mother`, mother, cx, Y(1087), 150, 14, { size: 12, bold: true });
  tc(`${side}-family-address`, address, cx, Y(1110), 170, 13, { size: 10, color: MUTED });
};
family("groom", 382, "Trần Quốc Hưng", "Nguyễn Thị Hồng", "Quận 1, TP. Hồ Chí Minh");
family("bride", 518, "Lê Văn Thành", "Phạm Thị Lan", "Quận 3, TP. Hồ Chí Minh");
shape("family-divider", [450, Y(1040), 1, 90], "#7c6a60", { opacity: 30 }, "rectangle", [187, 1000, 1, 100]);
tc("invite-copy", "TRÂN TRỌNG BÁO TIN\nLỄ THÀNH HÔN CỦA CON CHÚNG TÔI", 450, Y(1146), 440, 60, { size: 20 });
tc("groom-name", "Nguyễn Hoàng Nam", 450, Y(1230), 480, 80, { size: 46, font: displayFont });
tc("groom-role", "TRƯỞNG NAM", 450, Y(1327), 140, 12, { size: 10, color: MUTED, font: corm, letterSpacing: 1.4 });
tc("couple-ampersand", "&", 450, Y(1357), 60, 53, { size: 35, font: madi });
tc("bride-name", "Trần Thảo Vy", 450, Y(1426), 480, 80, { size: 46, font: displayFont });
tc("bride-role", "ÚT NỮ", 450, Y(1523), 100, 12, { size: 10, color: MUTED, font: corm, letterSpacing: 1.4 });
tc("ceremony-place", "LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA", 450, Y(1561), 420, 60, { size: 20, color: MUTED });
tc("ceremony-time-label", "VÀO LÚC", 450, Y(1629), 120, 27, { size: 18, color: MUTED });
tc("ceremony-time", "09:00", 450, Y(1684), 100, 45, { size: 30 });
tc("ceremony-day", "THỨ BẢY", 330, Y(1770), 110, 18, { size: 16 });
tc("ceremony-bar-1", "|", 397, Y(1767), 20, 24, { size: 24, opacity: 40 });
tc("ceremony-date-day", "03", 447, Y(1749), 70, 60, { size: 40 });
tc("ceremony-bar-2", "|", 497, Y(1767), 20, 24, { size: 24, opacity: 40 });
tc("ceremony-month", "THÁNG 01", 566, Y(1770), 120, 18, { size: 16 });
tc("ceremony-year", "2026", 450, Y(1829), 80, 36, { size: 24 });
tc("ceremony-lunar", "(TỨC NGÀY 15 THÁNG 11 NĂM ẤT TỴ)", 450, Y(1885), 420, 20, { size: 14, color: MUTED, letterSpacing: 3.5 });

// Album: băng ảnh 3D rộng hơn khối (ảnh hai bên tràn ra), mũi tên ở mép khối 600px.
// Lá lớn nền xoay 38 độ (tâm 854, 2491; gốc 413x1175 độ mờ 10%).
art("album-leaf-background", "leaf-background", [647, 2008, 413, 1175], { opacity: 10, rotation: 38, phone: [150, 1700, 500, 560] });
tc("album-heading", "ALBUM ẢNH", 450, Y(1989), 200, 22, { size: 20, font: titleFont, bold: true, letterSpacing: 0.6 });
add("Album", "wedding-album", [150, Y(2035), 600, 552], {
  images: Array.from({ length: 8 }, (_, index) => `${root}/photo-${index + 1}.webp`),
  autoplay: false, interval: 3, startAt: 1, lightbox: true, radius: 16, dotColor: ink, spread: true,
}, {}, 0, [10, 1825, 355, 360]);

// Tiệc cưới: panel, ngày giờ, lịch nền nâu, nút xác nhận.
panel("reception", [170, Y(2627), 560, 935], 10, "reception");
art("reception-leaf-accent", "leaf-background", [662, 2862, 157, 446], { flipX: true, rotation: -10.57, phone: [287, 2370, 90, 210] });
art("reception-flowers", "flower2-decoration", [52, Y(3201), 179, 416], { float: true, phone: [0, 2650, 90, 210] });
tc("reception-heading", "THÔNG TIN TIỆC CƯỚI", 450, Y(2667), 300, 22, { size: 20, font: titleFont, bold: true, letterSpacing: 0.6 });
tc("reception-intro", "TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:", 450, Y(2717), 400, 28, { size: 20 });
tc("reception-time", "18:00", 450, Y(2767), 100, 45, { size: 30 });
tc("reception-day", "THỨ BẢY", 342, Y(2853), 100, 18, { size: 16 });
tc("reception-bar-1", "|", 394, Y(2850), 20, 24, { size: 24, opacity: 40 });
tc("reception-date-day", "03", 448, Y(2832), 70, 60, { size: 40 });
tc("reception-bar-2", "|", 504, Y(2850), 20, 24, { size: 24, opacity: 40 });
tc("reception-month", "THÁNG 01", 556, Y(2853), 110, 18, { size: 16 });
tc("reception-year", "2026", 450, Y(2912), 80, 36, { size: 24 });
tc("reception-lunar", "(TỨC NGÀY 15 THÁNG 11 NĂM ẤT TỴ)", 450, Y(2968), 420, 20, { size: 14, color: MUTED, letterSpacing: 3.5 });
tc("arrival-label", "ĐÓN KHÁCH", 400, Y(3025), 110, 14, { size: 12, color: MUTED, letterSpacing: 0.6 });
tc("arrival-time", "17:30", 400, Y(3044), 70, 28, { size: 20 });
tc("banquet-label", "KHAI TIỆC", 507, Y(3025), 100, 14, { size: 12, color: MUTED, letterSpacing: 0.6 });
tc("banquet-time", "18:00", 507, Y(3044), 70, 28, { size: 20 });
shape("calendar-card", [269, Y(3104), 362, 306], "#7c6a60", { borderRadius: 10 }, "rectangle", [8, 2810, 359, 306]);
add("Calendar", "wedding-calendar", [269, Y(3104), 362, 380], {
  date: "2026-01-03", color: LIGHT, weekColor: LIGHT, markColor: "#ffffff", markTextColor: "#333333",
  markShape: "Tim đầy", markWeight: "700", markSize: 12, font: bodyFont, titleFont: scriptFont, size: 13, titleSize: 24,
  titleWeight: "400", titleSpacing: 0.6, titleGap: 0, weekSize: 11, weekWeight: "400", weekGap: 0,
  dayWeight: "400", padding: 16, lines: false, innerFrame: false, showTitle: true,
  eventButton: "Thêm vào lịch", eventTitle: "Đám cưới Nguyễn Hoàng Nam & Trần Thảo Vy", eventTime: "18:00", eventGap: 40,
  eventPlace: "Trung Tâm Hội Nghị White Palace, TP. Hồ Chí Minh",
}, {}, 0, [26, 2710, 323, 360]);
add("Button", "rsvp-button", [349, Y(3489), 202, 36], { label: "XÁC NHẬN THAM DỰ", href: "", action: "", payload: {}, fill: "#7c6a60", textColor: LIGHT, shape: "pill", size: 14, font: bodyFont });

// Địa điểm: bản đồ bo 15, nút Chỉ đường, dress code.
art("venue-house-background", "house-background", [-156, Y(3518), 1212, 1195], { opacity: 8, phone: [-40, 3050, 455, 420] });
tc("venue-heading", "TIỆC CƯỚI SẼ TỔ CHỨC TẠI", 450, Y(3612), 320, 17, { size: 16, font: titleFont, bold: true, letterSpacing: 0.5 });
tc("venue-address", "Trung Tâm Hội Nghị White Palace,\n194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh", 450, Y(3644), 460, 39, { size: 14, color: MUTED });
add("Map", "wedding-map", [170, Y(3699), 560, 440], {
  name: "Trung Tâm Hội Nghị White Palace", address: "194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh",
  heading: "", divider: false, showText: false, button: "Chỉ đường", color: MUTED, innerFrame: false, padding: 0, zoom: 15,
}, { borderWidth: 0, borderRadius: 15 }, 0, [20, 3200, 335, 300]);
add("DressCode", "dress-code", [280, Y(4223), 340, 125], {
  heading: "DRESS CODE", subtitle: "Trang phục dự tiệc", headingColor: ink, subtitleColor: MUTED,
  swatchShape: "circle", swatchSize: 48, swatchGap: 24, colors: ["#001a08", "#e1bc7c", "#3b5d3b", "#f5e6c8"],
}, {}, 0, [18, 3660, 339, 150]);
art("schedule-flower", "flower2-decoration", [674, 4452, 151, 351], { float: true, flipX: true, rotation: -6.94, phone: [296, 3730, 77, 195] });

// Lịch trình: bốn mốc giờ canh phải đến x=410, biểu tượng bên trái, nhãn bên phải đường dọc có chấm.
panel("schedule", [170, Y(4409), 560, 405], 10, "schedule");
tc("schedule-heading", "LỊCH TRÌNH NGÀY CƯỚI", 450, Y(4449), 300, 22, { size: 20, font: titleFont, bold: true, letterSpacing: 0.6 });
shape("schedule-line", [450, Y(4503), 1, 262], "#7c6a60", { opacity: 40 }, "rectangle", [187, 3730, 1, 230]);
const schedule = [
  ["17:00", "Đón khách", "", 4491, 4495, 4498], ["18:00", "Khai tiệc", "gate", 4558, 4560, 4564],
  ["18:30", "Nghi thức cưới", "cake", 4623, 4626, 4629], ["19:00", "Cắt bánh & nâng ly", "water", 4689, 4691, 4694], ["20:30", "Kết thúc tiệc", "", 4752, 4757, 4760],
] as const;
schedule.forEach(([time, label, icon, ty, ly, dot], i) => {
  text(`schedule-time-${i + 1}`, time, [220, Y(ty), 190, 25], { size: 17, align: "right", letterSpacing: 0.4, phone: [30, Math.round(Y(ty) * 0.86), 130, 25] });
  text(`schedule-label-${i + 1}`, label, [490, Y(ly), 220, 22], { size: 15, color: MUTED, align: "left", phone: [200, Math.round(Y(ly) * 0.86), 160, 22] });
  shape(`schedule-dot-${i + 1}`, [445, Y(dot), 10, 10], "#7c6a60", {}, "ellipse", [182, Math.round(Y(dot) * 0.86), 10, 10]);
  if (icon) art(`schedule-icon-${i + 1}`, icon, [303, Y(ty - 6), 36, 36], { phone: [128, Math.round(Y(ty) * 0.86), 24, 24] });
});

// Sổ lưu bút: giấy ghi chú, ô nhập và 10 lời chúc mẫu (thẻ trắng 55%, viền nâu 33%, bo 8).
art("guestbook-leaf-background", "leaf-background", [-125, 4807, 395, 1124], { opacity: 10, rotation: 38, phone: [-60, 4240, 485, 670] });
art("guestbook-paper-note", "paper-note", [125, Y(4915), 650, 478], { opacity: 95, fit: "cover", phone: [10, 4315, 355, 330] });
tc("guestbook-heading", "SỔ LƯU BÚT", 450, Y(4982), 200, 22, { size: 20, font: titleFont, bold: true, letterSpacing: 0.6 });
const wishes = formPresets.find(({ id }) => id === "wishes")!;
add("Form", "guestbook-form", [266, Y(5030), 368, 260], {
  ...wishes.props, formId: "demo-minimalism-nau-wishes", heading: "", intro: "", button: "GỬI LỜI CHÚC",
  color: ink, fieldColor: ink, fieldBorderColor: ink, font: titleFont, padding: 0, compact: true,
  previewSampleCount: 0,
}, { borderWidth: 0, borderRadius: 0 }, 0, [14, 4430, 347, 310]);
const sampleWishes = [
  ["Mỹ Linh", "Chúc hai bạn trăm năm hạnh phúc!"],
  ["Trọng Nhân", "Chúc hai bạn luôn yêu thương và đồng hành bên nhau."],
  ["Phương Vy", "Chúc mừng ngày trọng đại của hai bạn."],
  ["Hải Đăng", "Chúc đôi uyên ương viên mãn, sớm đón tin vui."],
  ["Ngọc Diệp", "Chúc tình yêu của hai bạn luôn đong đầy."],
  ["Đức Thịnh", "Mừng ngày vui, chúc hai bạn bền lâu."],
  ["Lan Anh", "Chúc hai bạn mãi nắm tay nhau."],
  ["Quốc Bảo", "Một ngày thật đẹp và một đời thật vui nhé!"],
  ["Thu Hà", "Chúc gia đình nhỏ luôn tràn ngập tiếng cười."],
  ["Minh Tuấn", "Chúc hai bạn hạnh phúc dài lâu."],
] as const;
sampleWishes.forEach(([name, message], i) => {
  const y = Y(5436 + i * 96.7);
  shape(`wish-card-${i + 1}`, [150, y, 592, 85], "#ffffff", { borderWidth: 1, borderColor: "#c8bfba", borderRadius: 8, opacity: 55 });
  text(`wish-name-${i + 1}`, name, [167, y + 14, 300, 20], { size: 14, color: ink, bold: true, align: "left", phone: [24, Math.round(y * 0.86) + 10, 200, 20] });
  text(`wish-date-${i + 1}`, "7:20:27 14/7/2026", [607, y + 17, 118, 16], { size: 12, color: ink, align: "right", phone: [200, Math.round(y * 0.86) + 12, 150, 16] });
  text(`wish-message-${i + 1}`, message, [167, y + 42, 558, 23], { size: 14, color: ink, align: "left", phone: [24, Math.round(y * 0.86) + 36, 327, 23] });
});

// Gift section. Every decorative present remains its own node and can be moved or removed.
art("gift-house-background", "house-background", [-179, Y(6455), 1257, 1239], { opacity: 8, phone: [-45, 5660, 465, 320] });
tc("gift-heading", "HỘP QUÀ MỪNG", 450, Y(6455), 240, 30, { size: 20, font: titleFont, bold: true, letterSpacing: 0.6 });
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
tc("thank-you", "Sự hiện diện của quý khách là niềm vui của gia đình chúng tôi!", 450, Y(6821), 520, 20, { size: 13 });

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
