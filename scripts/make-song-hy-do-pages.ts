// Tạm: sinh trang trong của mẫu "Song Hỷ - Đỏ" theo số đo trang mẫu (cột 900px, cao 6528px), nội dung giả.
// Ghi public/demo/song-hy/pages-do.json (trang "invitation" và popup "rsvp") cùng các SVG tự vẽ.
// Ảnh cặp đôi dùng ảnh tham chiếu có sẵn trong public/demo (xem hoa-moc-xanh/SOURCES.md: phải thay bằng ảnh có bản quyền trước khi phát hành).
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { builtInRegistry, emptyPage, newNode, type Axis, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../lib/cards/blocks/definitions";
import { formPresets } from "../lib/cards/blocks/form-presets";

const registry = { ...builtInRegistry, ...cardDefinitions };
const COLUMN = 900;
const PAGE_H = 6560;
const SIZE = { w: 960, h: PAGE_H };
const dir = resolve(__dirname, "../public/demo/song-hy");

const MAROON = "#800000";
const CREAM = "#ffeed2";
const PAPER = "#fff7eb";
const GREY = "#666666";
const serif = "'Lora', serif";
const body = "'Cormorant Garamond', serif";
const display = "'Playfair Display', serif";
const GIFT_BOX = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794281150/cardmaking/decorations/starter-wedding-gift-box.webp";

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
type TextOptions = { bold?: boolean; opacity?: number; italic?: boolean; underline?: boolean; align?: "left" | "center" | "right"; effects?: JsonValue };
const text = (id: string, value: string, box: Box, size: number, color: string, font: string, o: TextOptions = {}) =>
  put("Text", id, o.align && o.align !== "center" ? box : roomy(box), { text: value, size, color, font, bold: o.bold ?? false, italic: o.italic ?? false, underline: o.underline ?? false, align: o.align ?? "center", ...(o.effects ? { effects: o.effects } : {}) }, o.opacity ? { opacity: o.opacity } : {});
const deco = (id: string, src: string, box: Box, styles: NodeStyles = {}) => put("Decoration", id, box, { src, alt: "", fit: "contain", motion: false, motionTarget: "" }, styles);
const shape = (id: string, kind: string, box: Box, fill: string, styles: NodeStyles = {}) => put("Shape", id, box, { shape: kind, fill, motionTarget: "" }, styles);

function art() {
  const w = (name: string, content: string) => writeFileSync(resolve(dir, name), content);
  // Hình bán nguyệt đỏ treo từ mép trên: nửa dưới của đường tròn đường kính 872.
  w("bowl-do.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 872 437"><path d="M0 0H872A436 436 0 0 1 0 0Z" fill="${MAROON}"/></svg>\n`);
  w("sparkle-do.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0c1.6 6.1 3.9 8.4 10 10-6.1 1.6-8.4 3.9-10 10C10.4 13.9 8.1 11.6 2 10 8.1 8.4 10.4 6.1 12 0Z" fill="${CREAM}"/></svg>\n`);
  const FONT = "'Noto Serif SC','Songti SC','STSong','Source Han Serif SC','SimSun','Microsoft YaHei',serif";
  w("logo-do.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="52" text-anchor="middle" dominant-baseline="central" font-size="96" font-family="${FONT}" fill="${CREAM}">囍</text></svg>\n`);
  w("pill-do.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 143 40"><rect x=".5" y=".5" width="142" height="39" rx="20" fill="${PAPER}" stroke="${MAROON}" stroke-opacity=".19"/></svg>\n`);
}

function invitation(): FreeNode[] {
  const nodes: FreeNode[] = [];
  const band = (id: string, label: string, top: number) => {
    nodes.push(shape(`${id}-band`, "rectangle", { x: 1, y: top, w: 898, h: 68 }, MAROON));
    nodes.push(text(`${id}-band-title`, label, { x: 300, y: top + 20, w: 300, h: 28 }, 24, CREAM, serif, { bold: true }));
  };
  const heading = (id: string, label: string, top: number, left: number, width: number) => text(id, label, { x: left, y: top, w: width, h: 30 }, 24, MAROON, serif, { bold: true });

  // Nền cột kem; hai bên trắng như trang gốc.
  nodes.push(shape("column-bg", "rectangle", { x: 1, y: 0, w: 898, h: PAGE_H - 30 }, PAPER));

  // Hero (0-940).
  nodes.push(deco("hero-bowl", "/demo/song-hy/bowl-do.svg", { x: 14, y: 0, w: 872, h: 437 }));
  nodes.push(text("hero-welcome", "WELCOME TO OUR WEDDING", { x: 250, y: 26, w: 400, h: 22 }, 14, CREAM, body));
  nodes.push(text("hero-groom-role", "ÚT NAM", { x: 194, y: 103, w: 54, h: 19 }, 14, CREAM, body));
  nodes.push(text("hero-groom", "GIA HUY", { x: 149, y: 130, w: 145, h: 27 }, 23, CREAM, display));
  nodes.push(deco("hero-logo", "/demo/song-hy/logo-do.svg", { x: 409, y: 90, w: 83, h: 83 }));
  nodes.push(text("hero-bride-role", "ÚT NỮ", { x: 658, y: 103, w: 42, h: 19 }, 14, CREAM, body));
  nodes.push(text("hero-bride", "QUỲNH NHƯ", { x: 601, y: 130, w: 155, h: 27 }, 23, CREAM, display));
  // Chữ cong ôm đỉnh vòm: đỉnh cung ở y~238, hai đầu hạ ~28px (đo từ trang gốc); amount 90 cho độ võng đó.
  nodes.push(put("CurvedText", "hero-curved", { x: 264, y: 200, w: 372, h: 100 }, { text: "LOVE NEVER FAILS", size: 18, color: CREAM, font: body, bold: false, italic: false, amount: 90 }));
  nodes.push(deco("hero-star-left", "/demo/song-hy/sparkle-do.svg", { x: 286, y: 296, w: 22, h: 22 }));
  nodes.push(deco("hero-star-right", "/demo/song-hy/sparkle-do.svg", { x: 592, y: 296, w: 22, h: 22 }));
  nodes.push(put("PhotoFrame", "hero-couple", { x: 264, y: 258, w: 372, h: 626 }, { src: "/demo/hoa-moc-xanh/photo-2.webp", alt: "Ảnh cô dâu chú rể", shape: { id: "arch", geometry: "arch", maskPath: "" }, zoom: 100, posX: 50, posY: 50, frameWidth: 0, frameColor: MAROON }));

  // Thông tin lễ cưới (941-1943).
  band("info", "THÔNG TIN LỄ CƯỚI", 941);
  nodes.push(shape("info-divider", "rectangle", { x: 449, y: 1035, w: 1, h: 98 }, GREY, { opacity: 35 }));
  for (const [side, left, a, b, addr] of [["l", 159, "Phan Văn Hoàng", "Lê Thị Mai", "Số 85 Nguyễn Thái Sơn, Phường 4, Gò Vấp, TP. Hồ Chí Minh"], ["r", 624, "Phạm Văn Mạnh", "Huỳnh Thị Kim Oanh", "Ngõ 95 Láng Hạ, Láng Hạ, Đống Đa, Hà Nội"]] as const) {
    nodes.push(text(`info-${side}-label`, "Ông Bà", { x: left + 35, y: 1035, w: 47, h: 17 }, 15, GREY, body));
    nodes.push(text(`info-${side}-a`, a, { x: left, y: 1061, w: 117, h: 17 }, 15, MAROON, body, { bold: true }));
    nodes.push(text(`info-${side}-b`, b, { x: left - 5, y: 1088, w: 127, h: 17 }, 15, MAROON, body, { bold: true }));
    nodes.push(text(`info-${side}-addr`, addr, { x: left - 82, y: 1116, w: 280, h: 33 }, 13, GREY, body));
  }
  nodes.push(text("info-invite", "TRÂN TRỌNG BÁO TIN\nLỄ THÀNH HÔN CỦA CON CHÚNG TÔI", { x: 186, y: 1181, w: 528, h: 60 }, 20, MAROON, body));
  nodes.push(text("info-groom", "Phan Gia Huy", { x: 91, y: 1257, w: 718, h: 100 }, 64, MAROON, body));
  nodes.push(text("info-groom-role", "ÚT NAM", { x: 416, y: 1375, w: 68, h: 15 }, 13, GREY, body));
  nodes.push(text("info-amp", "&", { x: 437, y: 1408, w: 26, h: 53 }, 35, GREY, body));
  nodes.push(text("info-bride", "Phạm Quỳnh Như", { x: 91, y: 1477, w: 718, h: 100 }, 64, MAROON, body));
  nodes.push(text("info-bride-role", "ÚT NỮ", { x: 422, y: 1595, w: 56, h: 15 }, 13, GREY, body));
  nodes.push(text("info-where", "LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA", { x: 267, y: 1668, w: 366, h: 65 }, 20, MAROON, body));
  nodes.push(text("info-time", "VÀO LÚC 09:00", { x: 397, y: 1741, w: 106, h: 23 }, 15, GREY, body));
  nodes.push(put("Text", "info-weekday", { x: 332, y: 1803, w: 66, h: 17 }, { text: "THỨ HAI", size: 15, color: GREY, font: body, bold: false, italic: false, underline: false, align: "right" }));
  nodes.push(shape("info-rule-l", "rectangle", { x: 412, y: 1795, w: 1, h: 38 }, GREY, { opacity: 35 }));
  nodes.push(text("info-day", "01", { x: 431, y: 1784, w: 38, h: 57 }, 38, MAROON, body));
  nodes.push(shape("info-rule-r", "rectangle", { x: 488, y: 1795, w: 1, h: 38 }, GREY, { opacity: 35 }));
  nodes.push(put("Text", "info-month", { x: 502, y: 1803, w: 90, h: 17 }, { text: "THÁNG 06", size: 15, color: GREY, font: body, bold: false, italic: false, underline: false, align: "left" }));
  nodes.push(text("info-year", "2026", { x: 428, y: 1849, w: 44, h: 33 }, 22, GREY, body));
  nodes.push(text("info-lunar", "(TỨC NGÀY 16 THÁNG 4 NĂM BÍNH NGỌ)", { x: 306, y: 1890, w: 289, h: 21 }, 14, GREY, body));

  // Album (1943-2583).
  band("album", "ALBUM ẢNH", 1943);
  nodes.push(put("Album", "album", { x: 0, y: 2040, w: 900, h: 480 }, { images: ["photo-1", "photo-2", "photo-3", "photo-4", "photo-5", "photo-6", "photo-7"].map((name) => `/demo/hoa-moc-xanh/${name}.webp`), autoplay: true, interval: 1.5, lightbox: true, radius: 16, dotColor: MAROON }));

  // Thông tin tiệc cưới (2583-3402).
  band("party", "THÔNG TIN TIỆC CƯỚI", 2583);
  nodes.push(text("party-lead", "TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:", { x: 287, y: 2674, w: 325, h: 30 }, 20, MAROON, body));
  nodes.push(text("party-time", "10:30", { x: 423, y: 2712, w: 55, h: 36 }, 24, MAROON, body, { bold: true }));
  nodes.push(put("Text", "party-weekday", { x: 316, y: 2787, w: 82, h: 17 }, { text: "CHỦ NHẬT", size: 15, color: GREY, font: body, bold: false, italic: false, underline: false, align: "right" }));
  nodes.push(shape("party-rule-l", "rectangle", { x: 412, y: 2779, w: 1, h: 38 }, GREY, { opacity: 35 }));
  nodes.push(text("party-day", "14", { x: 431, y: 2768, w: 38, h: 57 }, 38, MAROON, body));
  nodes.push(shape("party-rule-r", "rectangle", { x: 488, y: 2779, w: 1, h: 38 }, GREY, { opacity: 35 }));
  nodes.push(put("Text", "party-month", { x: 502, y: 2787, w: 90, h: 17 }, { text: "THÁNG 06", size: 15, color: GREY, font: body, bold: false, italic: false, underline: false, align: "left" }));
  nodes.push(text("party-year", "2026", { x: 428, y: 2833, w: 44, h: 33 }, 22, GREY, body));
  nodes.push(text("party-lunar", "(Tức ngày 29 tháng 4 năm Bính Ngọ)", { x: 344, y: 2874, w: 212, h: 21 }, 14, GREY, body));
  nodes.push(text("party-open-label", "KHAI TIỆC", { x: 421, y: 2912, w: 58, h: 13 }, 11, GREY, body));
  nodes.push(text("party-open-time", "10:30", { x: 427, y: 2931, w: 46, h: 30 }, 20, MAROON, body, { bold: true }));
  nodes.push(put("CalendarFrame", "party-calendar", { x: 274, y: 2969, w: 352, h: 269 }, { date: "2026-06-14", sundayFirst: false, weekOnly: false, showTitle: true, lines: true, innerFrame: true, markShape: "Tim", markColor: MAROON, markTextColor: "#ffffff", color: MAROON, weekColor: MAROON, size: 13, padding: 8, font: body, titleFont: serif, eventButton: "", eventTitle: "Tiệc cưới", eventTime: "10:30", eventMinutes: 240, eventPlace: "", eventNote: "" }));
  nodes.push(text("party-addcal", "Thêm vào lịch", { x: 401, y: 3262, w: 98, h: 20 }, 14, MAROON, serif, { underline: true }));
  nodes.push(shape("rsvp-button", "rectangle", { x: 341, y: 3322, w: 219, h: 40 }, MAROON, { borderRadius: 10 }));
  nodes.push(put("Text", "rsvp-label", roomy({ x: 357, y: 3330, w: 187, h: 24 }), { text: "XÁC NHẬN THAM DỰ", size: 16, color: CREAM, font: serif, bold: true, italic: false, underline: false, align: "center" }));

  // Địa điểm (3402-4108).
  band("venue", "TIỆC CƯỚI SẼ TỔ CHỨC TẠI", 3402);
  nodes.push(text("venue-address", "Sun Palace, 170 Kinh Dương Vương, Phường 13, Quận 6, Hồ Chí Minh", { x: 112, y: 3510, w: 676, h: 24 }, 16, GREY, body, { bold: true }));
  nodes.push(put("Map", "venue-map", { x: 66, y: 3566, w: 768, h: 500 }, { name: "Trung Tâm Hội Nghị Tiệc Cưới Sun Palace", address: "170 Kinh Dương Vương, Phường 13, Quận 6, Hồ Chí Minh", showText: false, zoom: 16, heading: "", divider: false, button: "Chỉ đường", color: MAROON, innerFrame: false, padding: 0 }));

  // Dress code (4108-4384).
  nodes.push(heading("dress-title", "DRESS CODE", 4156, 371, 159));
  nodes.push(text("dress-sub", "Trang phục dự tiệc", { x: 388, y: 4199, w: 124, h: 18 }, 16, MAROON, body));
  [[354, "#651212"], [426, "#8d3a3a"], [498, "#ffb2b2"]].forEach(([left, color], index) =>
    nodes.push(shape(`dress-${index + 1}`, "ellipse", { x: left as number, y: 4240, w: 48, h: 48 }, color as string, { shadow: { x: 0, y: 3, blur: 8, spread: 0, color: "#000000", opacity: 18 }, ...(index === 2 ? { borderWidth: 1, borderColor: "#c98888" } : {}) })));

  // Lịch trình (4384-4800).
  nodes.push(heading("plan-title", "LỊCH TRÌNH NGÀY CƯỚI", 4384, 298, 304));
  nodes.push(shape("plan-line", "rectangle", { x: 450, y: 4466, w: 1, h: 273 }, MAROON, { opacity: 45 }));
  [["17:30", "Đón khách"], ["18:30", "Khai tiệc"], ["18:45", "Rót rượu, cắt bánh"], ["19:00", "Phục vụ món chính"], ["21:00", "Kết thúc tiệc"]].forEach(([time, label], index) => {
    const top = Math.round(4453 + index * 68.25);
    nodes.push(put("Text", `plan-${index}-time`, { x: 220, y: top, w: 190, h: 25 }, { text: time as string, size: 17, color: MAROON, font: body, bold: false, italic: false, underline: false, align: "right" }));
    nodes.push(shape(`plan-${index}-dot`, "ellipse", { x: 445, y: top + 8, w: 10, h: 10 }, MAROON, { shadow: { x: 0, y: 2, blur: 4, spread: 0, color: MAROON, opacity: 35 } }));
    nodes.push(put("Text", `plan-${index}-label`, { x: 490, y: top + 3, w: 190, h: 22 }, { text: label as string, size: 19, color: GREY, font: body, bold: true, italic: false, underline: false, align: "left" }));
  });

  // Sổ lưu bút (4800-6010).
  band("note", "SỔ LƯU BÚT", 4800);
  const wishes = formPresets.find((preset) => preset.id === "wishes")!;
  nodes.push(put("Form", "guestbook", { x: 150, y: 4924, w: 600, h: 1050 }, { ...(cardDefinitions.Form!.defaultProps as Record<string, JsonValue>), ...(wishes.props as Record<string, JsonValue>), formId: "guestbook-do", color: MAROON, heading: "" }));

  // Hộp quà mừng (6010-6498) + chân trang.
  nodes.push(heading("gift-title", "HỘP QUÀ MỪNG", 6060, 340, 220));
  nodes.push(put("Decoration", "wedding-gift", { x: 360, y: 6150, w: 180, h: 185 }, { src: GIFT_BOX, alt: "Hộp quà mừng", fit: "contain", motion: true, motionTarget: "" }));
  nodes.push(text("footer-thanks", "Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!", { x: 150, y: 6510, w: 600, h: 24 }, 14, GREY, body));
  nodes.push(text("footer-brand", "♡ CardMaking", { x: 380, y: 6545, w: 140, h: 22 }, 13, GREY, body, { opacity: 70 }));
  return nodes;
}

function rsvpPage() {
  const attendance = formPresets.find((preset) => preset.id === "attendance")!;
  const form = newNode(registry, "Form", "rsvp-form", { w: 960, h: 760 }, { props: { ...(cardDefinitions.Form!.defaultProps as Record<string, JsonValue>), ...(attendance.props as Record<string, JsonValue>), formId: "rsvp-do", color: MAROON } }) as FreeNode;
  form.position = { mode: "free", x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 24 } };
  form.size = { w: { kind: "px", v: 420 }, h: { kind: "px", v: 640 } };
  form.rotation = 0;
  const page = emptyPage();
  const data = { ...page, root: { ...page.root, styles: { ...page.root.styles, background: PAPER, minHeight: 700, phoneMinHeight: 700 }, children: [form] } };
  return { id: "rsvp", name: "Xác nhận tham dự", data, interactions: {}, popup: { width: 520, effect: "fade", backdropColor: "#17251e", backdropOpacity: 56 } };
}

art();
const page = emptyPage();
const nodes = invitation();
const data = { ...page, root: { ...page.root, styles: { ...page.root.styles, background: "#ffffff", minHeight: PAGE_H, phoneMinHeight: 812 }, children: nodes } };
const invitationPage = { id: "invitation", name: "Thiệp mời", data, interactions: { "rsvp-label": { type: "open-popup", targetPageId: "rsvp", transition: "fade", durationMs: 250 }, "wedding-gift": { type: "open-popup", targetPageId: "gift-details", transition: "fade", durationMs: 250 } } };
writeFileSync(resolve(dir, "pages-do.json"), JSON.stringify({ invitation: invitationPage, rsvp: rsvpPage() }));
console.log(`Đã ghi trang invitation với ${nodes.length} khối`);
