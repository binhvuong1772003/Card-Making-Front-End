// Sinh trang trong và popup của mẫu "Minimalism - Đỏ Đậm" theo nội dung, ảnh nguồn và bố cục đọc được từ trang mẫu.
// Ảnh gốc được lưu tại public/demo/minimalism-do-dam; QR trong popup chỉ là hình minh hoạ, không dùng để chuyển tiền.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { builtInRegistry, emptyPage, newNode, type Axis, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../lib/cards/blocks/definitions";
import { formPresets } from "../lib/cards/blocks/form-presets";

const registry = { ...builtInRegistry, ...cardDefinitions };
const COLUMN = 900;
// Lời chúc nằm trong khung cuộn cao tối đa 420px bắt đầu ở y 5200 (xem form-view.tsx), nên mục Hộp quà mừng chỉ cách đó 440px thay vì 900px của trang gốc.
const GIFT_SHIFT = 440;
const PAGE_H = 6716 - GIFT_SHIFT;
const SIZE = { w: 960, h: PAGE_H };
const dir = resolve(__dirname, "../public/demo/minimalism-do-dam");

const INK = "#511419";
const PANEL = "#481015";
const CREAM = "#ece4d8";
const PAPER = "#fff7eb";
const serif = "'Times New Roman', serif";
const body = "'Baskerville', 'Libre Baskerville', 'Times New Roman', serif";
const viaoda = "'Viaoda Libre', 'The Nautigal', cursive";
const script = "'Ms Madi', cursive";
const nautigal = "'The Nautigal', cursive";
const GIFT_ENVELOPES = "/demo/minimalism-do-dam/envelope-single.webp";
const RED_FLOWER = "/demo/minimalism-do-dam/flower.svg";
const RED_CASTLE = "/demo/minimalism-do-dam/castle.svg";
const HERO_PHOTO = "/demo/minimalism-do-dam/photo-1.svg";
const ALBUM_PHOTOS = Array.from({ length: 7 }, (_, index) => `/demo/minimalism-do-dam/photo-${index + 2}.svg`);

const x = (left: number, width: number): Axis => ({ anchor: "center", offset: Math.round(left + width / 2 - COLUMN / 2) });
const y = (top: number): Axis => ({ anchor: "start", offset: top });

type Box = { x: number; y: number; w: number; h: number; rotation?: number };
function put(type: string, id: string, box: Box, props: Record<string, JsonValue>, styles: NodeStyles = {}): FreeNode {
  const node = newNode(registry, type, id, SIZE, { props }) as FreeNode;
  node.position = { mode: "free", x: x(box.x, box.w), y: y(box.y) };
  node.size = { w: { kind: "px", v: box.w }, h: { kind: "px", v: box.h } };
  node.rotation = box.rotation ?? 0;
  node.styles = { ...node.styles, ...styles };
  return node;
}
// Chữ của mình rộng hơn chữ gốc một chút nên khung chữ nới ra hai bên (giữ nguyên tâm) để không bị xuống dòng.
const roomy = (box: Box): Box => { const pad = Math.max(24, Math.round(box.w * 0.15)); return { ...box, x: box.x - pad / 2, w: box.w + pad }; };
const text = (id: string, value: string, box: Box, size: number, color: string, font: string, o: { bold?: boolean; opacity?: number; italic?: boolean; underline?: boolean } = {}) =>
  put("Text", id, roomy(box), { text: value, size, color, font, bold: o.bold ?? false, italic: o.italic ?? false, underline: o.underline ?? false, align: "center" }, o.opacity ? { opacity: o.opacity } : {});
const deco = (id: string, src: string, box: Box, styles: NodeStyles = {}, floatMotion = false) => put("Decoration", id, box, { src, alt: "", fit: "contain", motion: false, floatMotion, motionTarget: "" }, styles);
const shape = (id: string, kind: string, box: Box, fill: string, styles: NodeStyles = {}) => put("Shape", id, box, { shape: kind, fill, motionTarget: "" }, styles);
const image = (id: string, src: string, box: Box, styles: NodeStyles = {}) => put("Image", id, box, { src, alt: "", fit: "cover" }, styles);
const SHADOW = { x: 0, y: 8, blur: 24, spread: 0, color: "#000000", opacity: 25 };

// ---------- Assets phụ cho mẫu ----------
function art() {
  const w = (name: string, content: string) => writeFileSync(resolve(dir, name), content);
  // Legacy saved cards still reference this filename for the guestbook paper.
  w("papernote.svg", readFileSync(resolve(dir, "paper.svg"), "utf8"));
  for (const [name, height] of [["info", 872], ["party", 862], ["plan", 405]] as const) {
    w(`${name}-panel-v2.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 ${height}"><rect width="560" height="${height}" rx="16" fill="${PANEL}"/></svg>`);
  }
  const flowerData = readFileSync(resolve(dir, "flower.svg"), "utf8").match(/data:image\/webp;base64,([^\"]+)/)?.[1];
  if (flowerData) w("flower-cluster.svg", `<svg xmlns="http://www.w3.org/2000/svg" width="650" height="700" viewBox="80 650 650 700"><image href="data:image/webp;base64,${flowerData}" x="0" y="0" width="811" height="1938" preserveAspectRatio="none"/></svg>`);
  // Biểu tượng lịch trình: nét kem 2px trên khổ 40x40.
  const icon = (name: string, path: string) => w(`icon-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none" stroke="${CREAM}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>\n`);
  icon("guest", '<circle cx="20" cy="14" r="6"/><path d="M8 34c1-8 6-11 12-11s11 3 12 11"/>');
  icon("ring", '<circle cx="15" cy="24" r="8"/><circle cx="25" cy="24" r="8"/><path d="M13 12l2-3h4l2 3"/>');
  icon("heart", '<path d="M20 31S9 24 9 16a6 6 0 0 1 11-3 6 6 0 0 1 11 3c0 8-11 15-11 15z"/>');
}

// ---------- Trang "invitation" ----------
function invitation(): FreeNode[] {
  const nodes: FreeNode[] = [];
  const panel = (id: string, top: number, height: number) => {
    nodes.push(put("Image", `${id}-panel`, { x: 170, y: top, w: 560, h: height }, { src: `/demo/minimalism-do-dam/${id}-panel-v2.svg`, alt: "", fit: "contain" }, { shadow: SHADOW, borderRadius: 16 }));
  };
  const title = (id: string, value: string, top: number, left: number, width: number, onPanel: boolean, size = 20) =>
    text(id, value, { x: left, y: top, w: width, h: size + 4 }, size, onPanel ? CREAM : INK, serif, { bold: true });

  // Nền: lâu đài mờ + dải trang trí.
  nodes.push(deco("bg-castle", RED_CASTLE, { x: 0, y: 360, w: 900, h: 640 }, { opacity: 10 }));
  nodes.push(deco("bg-castle-2", RED_CASTLE, { x: 0, y: 1900, w: 900, h: 640 }, { opacity: 10 }));
  // Hero (0-958): phong bì + ảnh polaroid + hoa + tên.
  nodes.push(text("hero-save", "SAVE THE DATE", { x: 366, y: 61, w: 168, h: 27 }, 18, "#590310", body, { bold: true }));
  nodes.push(put("Image", "hero-envelope-back", { x: 240, y: 200, w: 420, h: 484 }, { src: "/demo/minimalism-do-dam/envelope-background.svg", alt: "", fit: "contain" }));
  nodes.push(image("hero-polaroid", HERO_PHOTO, { x: 342, y: 166, w: 341, h: 424, rotation: 8 }, { borderWidth: 7, borderColor: "#ffffff", shadow: { x: 0, y: 8, blur: 24, spread: 0, color: "#000000", opacity: 30 } }));
  nodes.push(deco("hero-flowers", RED_FLOWER, { x: 232, y: 141, w: 176, h: 421 }, {}, true));
  nodes.push(put("Image", "hero-envelope-front", { x: 240, y: 407, w: 420, h: 277 }, { src: "/demo/minimalism-do-dam/envelope-cover.svg", alt: "", fit: "contain" }));
  nodes.push(text("hero-name1", "Hoàng Long", { x: 311, y: 764, w: 278, h: 58 }, 58, INK, viaoda));
  nodes.push(text("hero-amp", "&", { x: 410, y: 755, w: 81, h: 120 }, 120, INK, nautigal, { opacity: 15 }));
  nodes.push(text("hero-name2", "Bảo Ngọc", { x: 339, y: 844, w: 221, h: 58 }, 58, INK, viaoda));

  // Thông tin lễ cưới (958-1830).
  panel("info", 958, 872);
  nodes.push(deco("info-flowers", RED_FLOWER, { x: 629, y: 1071, w: 155, h: 535 }, {}, true));
  nodes.push(title("info-title", "THÔNG TIN LỄ CƯỚI", 998, 343, 213, true));
  nodes.push(shape("info-divider", "rectangle", { x: 450, y: 1052, w: 1, h: 78 }, CREAM, { opacity: 40 }));
  for (const [side, left, a, b, addr] of [["l", 313, "Đặng Văn Thắng", "Bùi Thị Mai", "Quận 1, TP. Hồ Chí Minh"], ["r", 483, "Vũ Đức Trung", "Ngô Thị Hạnh", "Quận 3, TP. Hồ Chí Minh"]] as const) {
    nodes.push(text(`info-${side}-label`, "Ông Bà", { x: left + 32, y: 1050, w: 38, h: 14 }, 12, CREAM, body, { opacity: 70 }));
    nodes.push(text(`info-${side}-a`, a, { x: left, y: 1071, w: 107, h: 17 }, 13, CREAM, body, { bold: true }));
    nodes.push(text(`info-${side}-b`, b, { x: left, y: 1094, w: 107, h: 17 }, 13, CREAM, body, { bold: true }));
    nodes.push(text(`info-${side}-addr`, addr, { x: left - 5, y: 1118, w: 117, h: 15 }, 10, CREAM, body, { opacity: 70 }));
  }
  nodes.push(text("info-invite", "TRÂN TRỌNG BÁO TIN\nLỄ THÀNH HÔN CỦA CON CHÚNG TÔI", { x: 260, y: 1155, w: 380, h: 60 }, 20, CREAM, body));
  nodes.push(text("info-groom", "Đặng Hoàng Long", { x: 242, y: 1239, w: 416, h: 80 }, 46, CREAM, viaoda));
  nodes.push(text("info-groom-role", "TRƯỞNG NAM", { x: 407, y: 1333, w: 86, h: 18 }, 10, CREAM, body, { opacity: 70 }));
  nodes.push(text("info-amp", "&", { x: 440, y: 1366, w: 20, h: 53 }, 35, CREAM, script));
  nodes.push(text("info-bride", "Vũ Bảo Ngọc", { x: 242, y: 1434, w: 416, h: 80 }, 46, CREAM, viaoda));
  nodes.push(text("info-bride-role", "ÚT NỮ", { x: 429, y: 1528, w: 42, h: 18 }, 10, CREAM, body, { opacity: 70 }));
  nodes.push(text("info-where", "LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA", { x: 267, y: 1572, w: 366, h: 53 }, 20, CREAM, body, { opacity: 70 }));
  nodes.push(text("info-time", "VÀO LÚC 09:00", { x: 345, y: 1649, w: 106, h: 23 }, 15, CREAM, body, { opacity: 70 }));
  nodes.push(text("info-weekday", "THỨ BẢY", { x: 487, y: 1651, w: 68, h: 17 }, 15, CREAM, body, { opacity: 70 }));
  nodes.push(text("info-day", "03", { x: 368, y: 1698, w: 46, h: 46 }, 46, CREAM, serif));
  nodes.push(shape("info-date-rule", "rectangle", { x: 431, y: 1698, w: 1, h: 50 }, CREAM, { opacity: 50 }));
  nodes.push(text("info-month", "THÁNG 01", { x: 447, y: 1695, w: 86, h: 20 }, 18, CREAM, serif));
  nodes.push(text("info-year", "2026", { x: 447, y: 1723, w: 36, h: 27 }, 18, CREAM, serif));
  nodes.push(text("info-lunar", "(TỨC NGÀY 15 THÁNG 11 NĂM ẤT TỴ)", { x: 296, y: 1770, w: 308, h: 20 }, 14, CREAM, body, { opacity: 70 }));

  // Album (1830-2500): tiêu đề + album xoay 3D.
  nodes.push(title("album-title", "ALBUM ẢNH", 1874, 385, 129, false));
  nodes.push(put("Album", "album", { x: 0, y: 1960, w: 900, h: 440 }, { images: ALBUM_PHOTOS, autoplay: true, interval: 1.5, lightbox: true, radius: 16, dotColor: INK }));

  // Thông tin tiệc cưới (2500-3362).
  panel("party", 2500, 862);
  nodes.push(deco("party-flowers", RED_FLOWER, { x: 45, y: 2600, w: 138, h: 400 }, {}, true));
  nodes.push(title("party-title", "THÔNG TIN TIỆC CƯỚI", 2540, 332, 236, true));
  nodes.push(text("party-lead", "TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:", { x: 287, y: 2590, w: 325, h: 30 }, 20, CREAM, body));
  nodes.push(text("party-time", "18:00", { x: 385, y: 2640, w: 34, h: 23 }, 15, CREAM, body, { opacity: 70 }));
  nodes.push(text("party-weekday", "THỨ BẢY", { x: 447, y: 2642, w: 68, h: 17 }, 15, CREAM, body, { opacity: 70 }));
  nodes.push(text("party-day", "03", { x: 373, y: 2691, w: 46, h: 46 }, 46, CREAM, serif));
  nodes.push(shape("party-date-rule", "rectangle", { x: 436, y: 2691, w: 1, h: 50 }, CREAM, { opacity: 50 }));
  nodes.push(text("party-month", "THÁNG 01", { x: 452, y: 2685, w: 76, h: 17 }, 16, CREAM, serif));
  nodes.push(text("party-year", "2026", { x: 452, y: 2710, w: 48, h: 36 }, 24, CREAM, serif));
  nodes.push(text("party-lunar", "(TỨC NGÀY 15 THÁNG 11 NĂM ẤT TỴ)", { x: 296, y: 2766, w: 308, h: 20 }, 14, CREAM, body, { opacity: 70 }));
  nodes.push(text("party-a-label", "ĐÓN KHÁCH", { x: 359, y: 2823, w: 82, h: 14 }, 12, CREAM, body, { opacity: 70 }));
  nodes.push(text("party-a-time", "17:30", { x: 377, y: 2842, w: 45, h: 28 }, 20, CREAM, body, { bold: true }));
  nodes.push(text("party-b-label", "KHAI TIỆC", { x: 473, y: 2823, w: 69, h: 14 }, 12, CREAM, body, { opacity: 70 }));
  nodes.push(text("party-b-time", "18:00", { x: 484, y: 2842, w: 45, h: 28 }, 20, CREAM, body, { bold: true }));
  nodes.push(shape("party-calendar-bg", "rectangle", { x: 269, y: 2902, w: 362, h: 307 }, CREAM, { borderRadius: 10 }));
  nodes.push(put("CalendarFrame", "party-calendar", { x: 269, y: 2902, w: 362, h: 307 }, { date: "2026-01-03", sundayFirst: false, weekOnly: false, showTitle: true, lines: true, innerFrame: false, markShape: "Tròn", markColor: INK, markTextColor: "#ffffff", color: INK, weekColor: INK, size: 14, padding: 16, font: body, titleFont: nautigal, eventButton: "Thêm vào lịch", eventTitle: "Tiệc cưới Hoàng Long & Bảo Ngọc", eventTime: "18:00", eventMinutes: 240, eventPlace: "Trung Tâm Hội Nghị White Palace, TP. Hồ Chí Minh", eventNote: "Ngày cưới Hoàng Long & Bảo Ngọc" }));
  nodes.push(shape("rsvp-button", "pill", { x: 349, y: 3289, w: 202, h: 36 }, CREAM));
  nodes.push(put("Text", "rsvp-label", { x: 349, y: 3289, w: 202, h: 36 }, { text: "XÁC NHẬN THAM DỰ", size: 14, color: INK, font: body, bold: false, italic: false, underline: false, align: "center" }));

  // Địa điểm (3377-3971).
  nodes.push(deco("venue-castle", RED_CASTLE, { x: -260, y: 3371, w: 1420, h: 1093 }, { opacity: 10 }));
  nodes.push(title("venue-title", "TIỆC CƯỚI SẼ TỔ CHỨC TẠI", 3396, 334, 232, false, 16));
  nodes.push(text("venue-address", "Trung Tâm Hội Nghị White Palace, 194 Hoàng Văn Thụ, Phường 9, Quận\nPhú Nhuận, TP. Hồ Chí Minh", { x: 130, y: 3428, w: 640, h: 42 }, 14, "#825456", body));
  nodes.push(put("Map", "venue-map", { x: 170, y: 3490, w: 560, h: 440 }, { name: "Trung Tâm Hội Nghị White Palace", address: "194 Hoàng Văn Thụ, Phường 9, Quận, Phú Nhuận, TP. Hồ Chí Minh", showText: false, zoom: 16, heading: "", divider: false, button: "Chỉ đường", color: INK, innerFrame: false, padding: 0 }));

  // Dress code (3971-4193).
  nodes.push(title("dress-title", "DRESS CODE", 4023, 383, 133, false));
  nodes.push(text("dress-sub", "Trang phục dự tiệc", { x: 390, y: 4056, w: 121, h: 17 }, 16, INK, serif, { opacity: 80 }));
  [[318, INK], [390, "#8c3a3f"], [462, "#c9a24a"], [534, CREAM]].forEach(([left, color], index) =>
    nodes.push(shape(`dress-${index + 1}`, "ellipse", { x: left as number, y: 4097, w: 48, h: 48 }, color as string)));

  // Lịch trình (4209-4614).
  nodes.push(image("plan-paper", "/demo/minimalism-do-dam/paper.webp", { x: 0, y: 4145, w: 960, h: 640 }, { opacity: 48 }));
  nodes.push(put("Image", "plan-panel", { x: 170, y: 4209, w: 560, h: 405 }, { src: "/demo/minimalism-do-dam/plan-panel-v2.svg", alt: "", fit: "contain" }, { shadow: SHADOW, borderRadius: 16 }));
  nodes.push(deco("plan-flowers", RED_FLOWER, { x: 625, y: 4201, w: 235, h: 420 }, {}, true));
  nodes.push(title("plan-title", "LỊCH TRÌNH NGÀY CƯỚI", 4249, 322, 255, true));
  const rows: Array<[string, string, string?]> = [["17:00", "Đón khách"], ["18:00", "Khai tiệc", "camera"], ["18:30", "Nghi thức cưới", "cake"], ["19:00", "Cắt bánh & nâng ly", "glass"], ["20:30", "Kết thúc tiệc"]];
  nodes.push(shape("plan-line", "rectangle", { x: 450, y: 4303, w: 1, h: 261 }, CREAM, { opacity: 35 }));
  rows.forEach(([time, label, icon], index) => {
    const top = 4291 + index * 65.25;
    nodes.push(shape(`plan-${index}-dot`, "ellipse", { x: 444, y: Math.round(top + 6), w: 12, h: 12 }, CREAM));
    nodes.push(put("Text", `plan-${index}-time`, { x: 220, y: Math.round(top), w: 190, h: 25 }, { text: time, size: 17, color: CREAM, font: serif, bold: false, italic: false, underline: false, align: "right" }));
    if (icon) nodes.push(deco(`plan-${index}-icon`, `/demo/minimalism-do-dam/icon-${icon}.svg`, { x: 303, y: Math.round(top - 4), w: 32, h: 32 }));
    nodes.push(put("Text", `plan-${index}-label`, { x: 490, y: Math.round(top + 4), w: 160, h: 16 }, { text: label, size: 15, color: CREAM, font: serif, bold: false, italic: false, underline: false, align: "left" }, { opacity: 70 }));
  });

  // Sổ lưu bút: ảnh nền gốc chứa sẵn giấy, bóng và cụm hoa ở góc trái.
  nodes.push(put("Image", "note-paper", { x: 155, y: 4601, w: 650, h: 592 }, { src: "/demo/minimalism-do-dam/papernote-background.webp", alt: "", fit: "contain" }, { opacity: 95 }));
  nodes.push(title("note-title", "SỔ LƯU BÚT", 4771, 350, 200, false));
  const wishes = formPresets.find((preset) => preset.id === "wishes")!;
  nodes.push(put("Form", "guestbook", { x: 290, y: 4820, w: 380, h: 270 }, { ...(cardDefinitions.Form!.defaultProps as Record<string, JsonValue>), ...(wishes.props as Record<string, JsonValue>), formId: "guestbook-mdd", color: INK, heading: "", intro: "", compact: true, padding: 0 }, { borderWidth: 0, borderRadius: 0 }));

  // Hộp quà mừng (6153-6628) + chân trang.
  nodes.push(image("gift-background", "/demo/minimalism-do-dam/paper.webp", { x: 0, y: 6100 - GIFT_SHIFT, w: 900, h: PAGE_H - (6100 - GIFT_SHIFT) }, { opacity: 35 }));
  nodes.push(deco("gift-castle", RED_CASTLE, { x: 0, y: 6100 - GIFT_SHIFT, w: 900, h: PAGE_H - (6100 - GIFT_SHIFT) }, { opacity: 14 }));
  nodes.push(title("gift-title", "HỘP QUÀ MỪNG", 6145 - GIFT_SHIFT, 360, 180, false));
  nodes.push(put("Decoration", "wedding-gift", { x: 325, y: 6216 - GIFT_SHIFT, w: 250, h: 357 }, { src: GIFT_ENVELOPES, alt: "Hai bao lì xì hoa đỏ", fit: "contain", motion: true, motionStyle: "Cặp bao lì xì", motionTarget: "" }));
  nodes.push(text("footer-thanks", "Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!", { x: 150, y: 6640 - GIFT_SHIFT, w: 600, h: 24 }, 14, INK, body, { opacity: 80 }));
  nodes.push(text("footer-brand", "♡ CardMaking", { x: 380, y: 6690 - GIFT_SHIFT, w: 140, h: 22 }, 13, INK, body, { opacity: 60 }));
  return nodes;
}

function rsvpPage() {
  const attendance = formPresets.find((preset) => preset.id === "attendance")!;
  const SIZE_R = { w: 960, h: 760 };
  const form = newNode(registry, "Form", "rsvp-form", SIZE_R, { props: { ...(cardDefinitions.Form!.defaultProps as Record<string, JsonValue>), ...(attendance.props as Record<string, JsonValue>), formId: "rsvp-mdd", color: INK } }) as FreeNode;
  form.position = { mode: "free", x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 24 } };
  form.size = { w: { kind: "px", v: 420 }, h: { kind: "px", v: 640 } };
  form.rotation = 0;
  const page = emptyPage();
  const data = { ...page, root: { ...page.root, styles: { ...page.root.styles, background: PAPER, minHeight: 700, phoneMinHeight: 700 }, children: [form] } };
  return { id: "rsvp", name: "Xác nhận tham dự", data, interactions: {}, popup: { width: 520, effect: "fade", backdropColor: "#17251e", backdropOpacity: 56 } };
}

function giftDetailsPage() {
  const giftNodes: FreeNode[] = [];
  const giftText = (id: string, value: string, box: Box, size: number, color = INK, bold = false) =>
    giftNodes.push(put("Text", id, box, { text: value, size, color, font: body, bold, italic: false, underline: false, align: "center" }));
  const giftImage = (id: string, box: Box) =>
    giftNodes.push(deco(id, "/demo/hoa-moc-xanh/qr-minh-hoa.svg", box));

  giftNodes.push(shape("gift-popup-paper", "rectangle", { x: 210, y: 28, w: 480, h: 680 }, "#fffaf3", { borderRadius: 16, shadow: SHADOW }));
  giftNodes.push(image("gift-popup-texture", "/demo/minimalism-do-dam/paper.svg", { x: 210, y: 28, w: 480, h: 680 }, { borderRadius: 16, opacity: 10 }));
  giftText("gift-popup-title", "HỘP QUÀ MỪNG", { x: 270, y: 55, w: 360, h: 52 }, 30, INK, true);
  giftText("gift-popup-intro", "Cảm ơn bạn đã chung vui cùng chúng mình", { x: 255, y: 112, w: 390, h: 36 }, 17, "#825456");
  giftNodes.push(shape("gift-popup-groom-card", "rectangle", { x: 248, y: 172, w: 190, h: 420 }, "#ffffff", { borderRadius: 12, borderWidth: 1, borderColor: "#eaded4" }));
  giftNodes.push(shape("gift-popup-bride-card", "rectangle", { x: 462, y: 172, w: 190, h: 420 }, "#ffffff", { borderRadius: 12, borderWidth: 1, borderColor: "#eaded4" }));
  giftText("gift-popup-groom", "Chú Rể", { x: 264, y: 188, w: 158, h: 28 }, 20, INK, true);
  giftText("gift-popup-bride", "Cô Dâu", { x: 478, y: 188, w: 158, h: 28 }, 20, INK, true);
  giftImage("gift-popup-qr-groom", { x: 273, y: 236, w: 140, h: 140 });
  giftImage("gift-popup-qr-bride", { x: 487, y: 236, w: 140, h: 140 });
  giftText("gift-popup-groom-bank", "Vietcombank\n1023 456 789\nHoàng Long", { x: 260, y: 400, w: 166, h: 88 }, 15);
  giftText("gift-popup-bride-bank", "Techcombank\n9988 776 655\nBảo Ngọc", { x: 474, y: 400, w: 166, h: 88 }, 15);
  giftText("gift-popup-demo-note", "Mã QR minh hoạ · thay bằng thông tin của bạn khi sử dụng mẫu", { x: 255, y: 624, w: 390, h: 42 }, 13, "#825456");
  const page = emptyPage();
  const data = { ...page, root: { ...page.root, styles: { ...page.root.styles, background: PAPER, minHeight: 740, phoneMinHeight: 740 }, children: giftNodes } };
  return { id: "gift-details", name: "Hộp quà mừng", data, interactions: {}, popup: { width: 700, effect: "fade", backdropColor: "#26070a", backdropOpacity: 72 } };
}

art();
const page = emptyPage();
const nodes = invitation();
const data = { ...page, root: { ...page.root, styles: { ...page.root.styles, background: PAPER, minHeight: PAGE_H, phoneMinHeight: 812 }, children: nodes } };
const invitationPage = { id: "invitation", name: "Thiệp mời", data, interactions: { "rsvp-label": { type: "open-popup", targetPageId: "rsvp", transition: "fade", durationMs: 250 }, "wedding-gift": { type: "open-popup", targetPageId: "gift-details", transition: "fade", durationMs: 250 } } };
writeFileSync(resolve(dir, "pages-mdd.json"), JSON.stringify({ invitation: invitationPage, rsvp: rsvpPage(), giftDetails: giftDetailsPage() }));
console.log(`Đã ghi trang invitation với ${nodes.length} khối`);
