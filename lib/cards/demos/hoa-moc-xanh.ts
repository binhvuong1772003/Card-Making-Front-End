import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles, type PageData } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";

// Editable reference study. Event details are fictional; asset provenance is beside the demo images.
const registry = { ...builtInRegistry, ...cardDefinitions };
const assets = "/demo/hoa-moc-xanh";
const green = "#31551c";
const muted = "#6d805b";
const serif = "'Cormorant Garamond', serif";
const sans = "'Montserrat', sans-serif";
type Rect = [x: number, y: number, w: number, h: number];
const children: FreeNode[] = [];
const box = ([x, y, w, h]: Rect, rotation = 0) => ({ position: { mode: "free" as const, x: { anchor: "start" as const, offset: x }, y: { anchor: "start" as const, offset: y } }, size: { w: { kind: "px" as const, v: w }, h: { kind: "px" as const, v: h } }, rotation });

function block(id: string, type: string, desktop: Rect, phone: Rect, props: Record<string, JsonValue> = {}, styles: NodeStyles = {}, rotation = 0) {
  const base = newNode(registry, type, id, { w: 960, h: 8200 }, { props }) as FreeNode;
  const mobile = box(phone, rotation);
  const node: FreeNode = { ...base, ...box(desktop, rotation), phone: { x: mobile.position.x, y: mobile.position.y, w: mobile.size.w, h: mobile.size.h, rotation }, styles: { ...base.styles, ...styles } };
  children.push(node);
  return node;
}

function text(id: string, value: string, desktop: Rect, phone: Rect, size = 28, phoneSize = 20, extra: Record<string, JsonValue> = {}) {
  const node = block(id, "Text", desktop, phone, { text: value, size, color: green, font: serif, align: "center", ...extra });
  node.phoneProps = { size: phoneSize };
}

function image(id: string, name: string, desktop: Rect, phone: Rect, styles: NodeStyles = {}, rotation = 0, fit = "contain") {
  block(id, "Image", desktop, phone, { src: `${assets}/${name}.webp`, alt: "", fit }, styles, rotation);
}

function heading(id: string, value: string, y: number, py: number) {
  text(id, value, [120, y, 720, 65], [20, py, 335, 58], 38, 26, { bold: true });
}

function rule(id: string, y: number, py: number) {
  block(id, "Shape", [365, y, 230, 1], [132, py, 111, 1], { shape: "rectangle", fill: "#a8b394" });
}

// The botanical layers are ordinary image blocks, so they can be selected and moved in the editor.
image("flower-top-left", "flowers", [-100, -110, 490, 490], [-80, -60, 250, 250], { opacity: 48 }, -25);
image("flower-top-right", "flowers", [640, 30, 420, 420], [245, 20, 220, 220], { opacity: 18 }, 155);
image("flower-hero-bottom", "flowers", [-140, 650, 550, 550], [-115, 710, 340, 340], { opacity: 40 }, 20);
for (const [i, y, py] of [[1, 1310, 1320], [2, 2400, 2230], [3, 3630, 3000], [4, 4580, 3890], [5, 5880, 4970], [6, 7120, 6170]]) {
  image(`flower-section-${i}`, "flowers", [650, y!, 450, 450], [250, py!, 230, 230], { opacity: 14 }, 165);
}
image("hero-floral-band", "floral-band", [0, 475, 960, 150], [0, 470, 375, 100], {}, 0, "cover");

text("hero-intro", "Hẹn nhau trong một ngày thật đẹp", [240, 55, 480, 38], [35, 55, 305, 35], 26, 17, { italic: true, color: muted });
text("hero-names", "Gia Huy & Ngọc Anh", [130, 95, 700, 100], [15, 105, 345, 65], 66, 32);
image("groom-portrait", "groom", [175, 240, 275, 370], [45, 215, 175, 245], { borderWidth: 5, borderColor: "#b59c7d" }, -13, "cover");
text("groom-role", "CHÚ RỂ", [510, 315, 280, 32], [220, 305, 130, 30], 17, 11, { font: sans, color: muted });
text("groom-name", "Gia Huy", [490, 350, 300, 80], [215, 337, 145, 58], 56, 29);
image("bride-portrait", "bride", [520, 590, 275, 370], [155, 580, 175, 245], { borderWidth: 5, borderColor: "#b59c7d" }, 13, "cover");
text("bride-role", "CÔ DÂU", [165, 680, 280, 32], [10, 665, 130, 30], 17, 11, { font: sans, color: muted });
text("bride-name", "Ngọc Anh", [155, 715, 300, 80], [5, 697, 145, 58], 56, 29);

heading("ceremony-heading", "THÔNG TIN LỄ CƯỚI", 1100, 1060);
text("groom-family", "GIA ĐÌNH NHÀ TRAI\nÔng Trần Minh Đức\nBà Lê Thanh Mai", [90, 1220, 340, 135], [15, 1155, 165, 120], 28, 18);
text("bride-family", "GIA ĐÌNH NHÀ GÁI\nÔng Nguyễn Hoài Nam\nBà Phạm Thu Hương", [530, 1220, 340, 135], [195, 1155, 165, 120], 28, 18);
rule("ceremony-rule", 1410, 1320);
text("ceremony-invite", "Hai gia đình hân hoan kính mời bạn\nđến chung vui trong lễ thành hôn", [170, 1460, 620, 90], [25, 1360, 325, 75], 28, 20);
text("ceremony-groom", "Trần Gia Huy", [140, 1580, 680, 105], [20, 1465, 335, 75], 76, 46);
text("ceremony-and", "&", [380, 1695, 200, 60], [137, 1545, 100, 50], 44, 32, { font: "'Great Vibes', cursive", color: muted });
text("ceremony-bride", "Nguyễn Ngọc Anh", [100, 1770, 760, 105], [15, 1600, 345, 80], 76, 44);
text("ceremony-place", "TẠI TƯ GIA NHÀ TRAI", [180, 1920, 600, 45], [20, 1730, 335, 38], 22, 16, { font: sans });
text("ceremony-time", "09:00 · CHỦ NHẬT", [220, 1985, 520, 52], [25, 1790, 325, 42], 32, 23);
text("ceremony-date", "22  |  THÁNG 11  |  2026", [160, 2050, 640, 80], [20, 1840, 335, 65], 48, 30);
text("ceremony-note", "Một lời hẹn trăm năm, một ngày chung đôi.", [180, 2150, 600, 52], [25, 1930, 325, 55], 25, 19, { italic: true, color: muted });

heading("album-heading", "ALBUM ẢNH CƯỚI", 2330, 2070);
block("wedding-album", "Album", [50, 2460, 860, 520], [10, 2170, 355, 350], { images: Array.from({ length: 8 }, (_, i) => `${assets}/photo-${i + 1}.webp`), autoplay: false, radius: 16, dotColor: muted });

heading("party-heading", "HẸN BẠN TẠI TIỆC CƯỚI", 3130, 2640);
text("party-invite", "Một buổi tối ấm áp, có gia đình và những người thương.", [150, 3220, 660, 65], [28, 2715, 319, 65], 28, 20, { italic: true, color: muted });
text("party-time", "17:30", [280, 3320, 400, 100], [90, 2800, 195, 80], 76, 52);
text("party-date", "CHỦ NHẬT · 22.11.2026", [190, 3430, 580, 55], [20, 2885, 335, 45], 31, 22);
block("wedding-calendar", "Calendar", [285, 3550, 390, 350], [30, 2960, 315, 320], { date: "2026-11-22", color: green, weekColor: muted, markColor: green, font: serif, titleFont: serif, size: 21, padding: 12, eventButton: "Thêm vào lịch", eventTitle: "Lễ cưới Gia Huy & Ngọc Anh", eventTime: "17:30", eventPlace: "Địa điểm tổ chức tiệc — thông tin minh hoạ" });

heading("venue-heading", "NƠI MÌNH GẶP NHAU", 4060, 3390);
block("wedding-map", "Map", [155, 4170, 650, 500], [20, 3470, 335, 435], { name: "Riverside Palace", address: "360D Bến Vân Đồn, Quận 4, Hồ Chí Minh", heading: "", button: "Xem đường đi", color: green, padding: 20, innerFrame: false }, { borderColor: "#c6ceb9", borderRadius: 4 });

heading("dress-heading", "DRESS CODE", 4830, 4020);
text("dress-note", "Chọn một sắc màu dịu dàng để cùng lưu lại kỷ niệm.", [170, 4915, 620, 65], [30, 4090, 315, 65], 27, 20, { italic: true, color: muted });
for (const [i, color] of ["#355438", "#a6b18f", "#e6ddc7", "#b7a186"].entries()) {
  block(`dress-color-${i}`, "Shape", [307 + i * 92, 5025, 65, 65], [64 + i * 65, 4190, 48, 48], { shape: "ellipse", fill: color });
}

heading("timeline-heading", "MỘT NGÀY ĐỂ NHỚ", 5270, 4380);
block("timeline-line", "Shape", [479, 5400, 2, 430], [186, 4490, 2, 400], { shape: "rectangle", fill: "#c0caaa" });
const schedule = [["17:30", "Đón bạn đến chung vui"], ["18:00", "Trao lời hẹn ước"], ["18:30", "Nâng ly chúc mừng"], ["19:00", "Dùng tiệc & lưu kỷ niệm"], ["21:00", "Gửi lời cảm ơn"]];
schedule.forEach(([time, label], i) => {
  const y = 5390 + i * 105;
  const py = 4480 + i * 100;
  block(`timeline-dot-${i}`, "Shape", [473, y + 17, 14, 14], [181, py + 16, 12, 12], { shape: "ellipse", fill: green });
  text(`timeline-time-${i}`, time!, [225, y, 210, 55], [30, py, 130, 50], 35, 25, { align: "right" });
  text(`timeline-label-${i}`, label!, [525, y, 310, 55], [211, py, 150, 60], 27, 18, { align: "left" });
});

heading("rsvp-heading", "BẠN SẼ ĐẾN CHỨ?", 6010, 5020);
const attendance = formPresets.find((preset) => preset.id === "attendance")!;
block("wedding-rsvp", "Form", [175, 6130, 610, 510], [20, 5110, 335, 510], { ...attendance.props, formId: "demo-hoa-moc-xanh-rsvp", heading: "", intro: "Gia Huy và Ngọc Anh rất mong được đón bạn.", color: green, padding: 24 }, { borderColor: "#c6ceb9", borderRadius: 8, background: "#fffefb" });

heading("wishes-heading", "GỬI MỘT LỜI THƯƠNG", 6800, 5790);
const wishes = formPresets.find((preset) => preset.id === "wishes")!;
block("wedding-wishes", "Form", [175, 6910, 610, 620], [20, 5870, 335, 620], { ...wishes.props, formId: "demo-hoa-moc-xanh-wishes", heading: "", intro: "Những lời chúc của bạn là món quà thật đẹp.", color: green, padding: 24 }, { borderColor: "#c6ceb9", borderRadius: 8, background: "#fffefb" });

image("wedding-gift", "gift", [350, 7630, 260, 270], [98, 6550, 180, 200]);
text("thank-you", "Cảm ơn vì đã ở đây", [150, 7920, 660, 90], [20, 6810, 335, 75], 64, 42, { font: "'Great Vibes', cursive" });
text("thank-you-note", "Chúng mình mong được cùng bạn viết thêm\nmột kỷ niệm đẹp trong ngày chung đôi.", [180, 8020, 600, 90], [30, 6905, 315, 90], 26, 19, { color: muted });

export const hoaMocXanhDemo: PageData = {
  ...emptyPage(),
  root: { ...emptyPage().root, styles: { background: "#fffcf8", minHeight: 8200, phoneMinHeight: 7100 }, children },
  theme: { colors: { primary: green, secondary: muted, paper: "#fffcf8" }, fonts: { body: serif, heading: serif } },
  meta: { title: "Gia Huy & Ngọc Anh · Hoa Mộc Xanh", description: "Bản dựng thử thiệp tĩnh bằng các khối có sẵn của CardMaking. Nội dung sự kiện là minh hoạ." },
};
