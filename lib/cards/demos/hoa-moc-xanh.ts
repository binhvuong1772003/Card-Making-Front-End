import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles, type PageData } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import { nameLayers } from "../layers";
import coverJson from "../../../public/demo/song-hy/cover-hmx.json";
import giftJson from "../../../public/demo/hoa-moc-xanh/gift-details.json";

// Editable reference study. Event details are fictional; asset provenance is beside the demo images.
const registry = { ...builtInRegistry, ...cardDefinitions };
const assets = "/demo/hoa-moc-xanh";
const green = "#30530f";
const muted = "#464646";
const paper = "#fffaf7";
const serif = "Baskerville, 'Times New Roman', serif";
const displaySerif = "'EB Garamond', 'Times New Roman', serif";
const script = "Pattaya, cursive";
type Rect = [x: number, y: number, w: number, h: number];
const children: FreeNode[] = [];
const box = ([x, y, w, h]: Rect, rotation = 0) => ({ position: { mode: "free" as const, x: { anchor: "start" as const, offset: x }, y: { anchor: "start" as const, offset: y } }, size: { w: { kind: "px" as const, v: w }, h: { kind: "px" as const, v: h } }, rotation });

function block(id: string, type: string, desktop: Rect, phone: Rect, props: Record<string, JsonValue> = {}, styles: NodeStyles = {}, rotation = 0) {
  const base = newNode(registry, type, id, { w: 900, h: 6900 }, { props }) as FreeNode;
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

function decoration(id: string, name: string, desktop: Rect, phone: Rect, styles: NodeStyles = {}, rotation = 0, floatMotion = false, flipX = false) {
  block(id, "Decoration", desktop, phone, { src: `${assets}/${name}.webp`, alt: name === "flowers" ? "Cụm hoa trắng và lá xanh" : name === "gift" ? "Hộp quà" : "", fit: "contain", flipX, motion: false, motionStyle: "Hộp quà", floatMotion }, styles, rotation);
}

function heading(id: string, value: string, y: number, py: number) {
  text(id, value, [1, y, 898, 36], [20, py, 335, 36], 24, 20, { bold: true, font: "'Times New Roman', serif" });
}

// XPath /html/body/div[3]/div/div[1]/main/div/div — keep each source flower layer editable.
decoration("flower-hero-main", "flowers", [130, -390, 760, 760], [111.5, -327, 622.77, 622.77], {}, -0.76, true);
decoration("flower-hero-left", "flowers", [-66, 18, 507, 507], [-83, 5, 450, 450], { opacity: 20 }, 142, true, true);
decoration("flower-fixed-left", "flowers", [-228, 608, 530, 530], [-181.5, 503, 415.05, 415.05], {}, -60.58);
decoration("flower-right-upper", "flowers", [400, 360, 800, 800], [-15, 302, 610, 610], { opacity: 15 }, 152, true);
decoration("flower-left-upper", "flowers", [-140, 1190, 990, 990], [-110, 1054, 750, 750], { opacity: 15 }, 132, true);
decoration("flower-left-album", "flowers", [-420, 2550, 720, 720], [-388.5, 2350, 558.77, 558.77], {}, 0, true);
decoration("flower-right-middle", "flowers", [415, 2020, 1005, 1005], [-35, 1848, 750, 750], { opacity: 15 }, 122, true);
decoration("flower-right-ceremony", "flowers", [700, 1320, 390, 390], [227, 1180, 290, 290], {}, -36, true, true);
decoration("flower-left-middle", "flowers", [-390, 2720, 1425, 1425], [-290, 2545, 1062, 1062], { opacity: 15 }, 128, true);
decoration("flower-left-lower", "flowers", [-315, 3880, 400, 400], [-131.25, 4060, 297, 297], {}, 176, true);
decoration("flower-right-lower", "flowers", [700, 3150, 390, 390], [227, 2960, 290, 290], {}, -36, true, true);
decoration("flower-bottom-right", "flowers", [520, 6020, 780, 780], [175, 6200, 600, 600], { opacity: 20 }, 139, true);
// Dải nằm trong hero wrapper: top 280px từ md, 170px trên mobile.
decoration("hero-floral-band", "floral-band", [0, 536, 900, 150], [0, 380, 375, 100]);

// Source XPath: /html/body/div[3]/div/div[1]/main/div/div/header/div[3]
// Source /header/div[3]: 500×640 at md, 320×440 on mobile; labels center beside each print.
image("groom-portrait", "groom", [225, 270, 235, 352], [47.5, 170, 155, 233], { borderWidth: 5, borderColor: "#b28e72" }, -17, "cover");
text("groom-role", "Trưởng Nam", [476, 410, 190, 21], [214.5, 258, 150, 20], 14, 11, { color: muted, align: "left", letterSpacing: 2 });
text("groom-name", "Minh Quân", [476, 434, 205, 48], [214.5, 280, 160, 38], 32, 25, { font: "'Playfair Display', serif", align: "left" });
image("bride-portrait", "bride", [435.5, 590, 235, 352], [162, 375, 155, 233], { borderWidth: 5, borderColor: "#b28e72" }, 13, "cover");
text("bride-role", "Út Nữ", [315, 730, 120, 21], [82.5, 463, 125, 20], 14, 11, { color: muted, align: "right", letterSpacing: 2 });
text("bride-name", "Thu Hà", [315, 754, 125, 48], [82.5, 485, 140, 38], 32, 25, { font: "'Playfair Display', serif", align: "right" });

heading("ceremony-heading", "THÔNG TIN LỄ CƯỚI", 1048, 990);
text("groom-family-role", "Ông Bà", [45, 1120, 354, 24], [15, 1085, 165, 20], 16, 12);
text("groom-family-father", "Trần Văn Hùng", [45, 1150, 354, 35], [15, 1107, 165, 24], 23, 13, { bold: true });
text("groom-family-mother", "Hạm Thị Lan", [45, 1191, 354, 35], [15, 1132, 165, 24], 23, 13, { bold: true });
text("groom-family-address", "25 Ngõ 12 Đặng Văn Ngữ, Đống Đa, Hà Nội", [45, 1232, 354, 20], [15, 1158, 165, 26], 10, 10);
block("family-divider", "Shape", [449, 1137, 1, 88], [186, 1100, 1, 68], { shape: "rectangle", fill: "#d0d5c8" });
text("bride-family-role", "Ông Bà", [500, 1120, 354, 24], [195, 1085, 165, 20], 16, 12);
text("bride-family-father", "Nguyễn Văn Bình", [500, 1150, 354, 35], [195, 1107, 165, 24], 23, 13, { bold: true });
text("bride-family-mother", "Phan Thị Hương", [500, 1191, 354, 35], [195, 1132, 165, 24], 23, 13, { bold: true });
text("bride-family-address", "18 Ngõ 86 Chùa Hà, Cầu Giấy, Hà Nội", [500, 1232, 354, 20], [195, 1158, 165, 26], 10, 10);
text("ceremony-invite", "TRÂN TRỌNG BÁO TIN\nLỄ THÀNH HÔN CỦA CON CHÚNG TÔI", [170, 1320, 560, 60], [25, 1280, 325, 58], 20, 17);
text("ceremony-groom", "Trần Minh Quân", [80, 1410, 740, 80], [20, 1385, 335, 66], 64, 43, { font: displaySerif });
text("ceremony-groom-role", "TRƯỞNG NAM", [300, 1498, 300, 24], [90, 1454, 195, 20], 12, 10, { letterSpacing: 2 });
text("ceremony-and", "&", [380, 1528, 140, 55], [137, 1478, 100, 40], 38, 30, { font: script });
text("ceremony-bride", "Nguyễn Thu Hà", [80, 1615, 740, 80], [15, 1525, 345, 66], 64, 42, { font: displaySerif });
text("ceremony-bride-role", "ÚT NỮ", [300, 1700, 300, 24], [90, 1597, 195, 20], 12, 10, { letterSpacing: 2 });
text("ceremony-place", "LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA", [267, 1757, 366, 60], [25, 1650, 325, 50], 20, 16);
text("ceremony-time-label", "VÀO LÚC", [350, 1825, 200, 27], [90, 1702, 195, 22], 18, 14);
text("ceremony-time", "09:00", [350, 1870, 200, 50], [90, 1728, 195, 36], 30, 24);
text("ceremony-day", "CHỦ NHẬT", [220, 1958, 150, 24], [20, 1768, 95, 24], 16, 12);
text("ceremony-day-divider-left", "|", [370, 1956, 20, 28], [116, 1768, 10, 24], 28, 14);
text("ceremony-date-day", "24", [400, 1937, 75, 64], [130, 1755, 60, 50], 40, 30);
text("ceremony-day-divider-right", "|", [480, 1956, 20, 28], [194, 1768, 10, 24], 28, 14);
text("ceremony-month", "THÁNG 05", [520, 1958, 150, 24], [207, 1768, 150, 24], 16, 12);
text("ceremony-year", "2026", [380, 2025, 140, 40], [130, 1800, 115, 30], 24, 20);
text("ceremony-lunar", "(TỨC NGÀY 8 THÁNG 4 NĂM BÍNH NGỌ)", [257, 2081, 386, 22], [25, 1840, 325, 22], 14, 11);

heading("album-heading", "ALBUM ẢNH", 2219, 1955);
block("wedding-album", "Album", [170, 2279, 560, 552], [10, 2055, 355, 390], { images: Array.from({ length: 8 }, (_, i) => `${assets}/photo-${i + 1}.webp`), autoplay: false, interval: 1.1, startAt: 1, lightbox: true, radius: 16, dotColor: muted });

heading("party-heading", "THÔNG TIN TIỆC CƯỚI", 2927, 2640);
text("party-invite", "TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:", [120, 2995, 720, 36], [20, 2715, 335, 40], 26, 20);
text("party-time", "18:00", [280, 3050, 400, 45], [90, 2765, 195, 40], 32, 25, { bold: true });
text("party-day", "CHỦ NHẬT", [296, 3131, 89, 16], [20, 2798, 95, 24], 16, 12, { align: "right" });
text("party-day-divider-left", "|", [396, 3127, 14, 28], [116, 2798, 10, 24], 28, 14);
text("party-date-day", "24", [434, 3110, 40, 40], [130, 2785, 60, 50], 40, 30);
text("party-day-divider-right", "|", [498, 3127, 14, 28], [194, 2798, 10, 24], 28, 14);
text("party-month", "THÁNG 05", [524, 3131, 80, 16], [207, 2798, 150, 24], 16, 12, { align: "left" });
text("party-year", "2026", [426, 3190, 48, 24], [130, 2830, 115, 30], 24, 20);
text("party-lunar", "(TỨC NGÀY 8 THÁNG 4 NĂM BÍNH NGỌ)", [180, 3230, 600, 30], [20, 2880, 335, 30], 18, 13, { color: muted });
text("party-arrival-label", "ĐÓN KHÁCH", [359, 3303, 82, 12], [40, 2920, 120, 18], 12, 12);
text("party-arrival-time", "17:30", [377, 3322, 46, 20], [40, 2940, 120, 28], 20, 18);
text("party-banquet-label", "KHAI TIỆC", [473, 3303, 69, 12], [215, 2920, 120, 18], 12, 12);
text("party-banquet-time", "18:00", [484, 3322, 46, 20], [215, 2940, 120, 28], 20, 18);
// Lịch theo số đo gốc: ô rộng 50px, hàng cao 36px, tên tháng 14px đậm 600, thứ 11px đậm 500, số ngày 13px nhẹ 300.
block("wedding-calendar", "Calendar", [275, 3379, 350, 337], [30, 2990, 315, 320], { date: "2026-05-24", color: green, weekColor: green, markColor: green, markShape: "Tim đầy", markTextColor: "#ffffff", markWeight: "700", markSize: 12, font: serif, titleFont: serif, size: 13, titleSize: 14, titleWeight: "600", titleSpacing: 0.35, titleGap: 25, weekSize: 11, weekWeight: "500", weekGap: 20, dayWeight: "300", eventGap: 44, padding: 0, eventButton: "Thêm vào lịch", eventTitle: "Đám cưới Trần Minh Quân & Nguyễn Thu Hà", eventTime: "18:00", eventPlace: "Tiệc Cưới Hoàng Gia, Ngõ 74 P. Nguyễn Thị Định, Nhân Chính, Thanh Xuân, Hà Nội" });

block("rsvp-button", "Button", [340, 3742, 280, 50], [70, 3325, 235, 46], { label: "XÁC NHẬN THAM DỰ", href: "", action: "", payload: {}, fill: green, textColor: "#ffffff", shape: "rounded", size: 16, font: serif });

heading("venue-heading", "TIỆC CƯỚI SẼ TỔ CHỨC TẠI", 3822, 3390);
text("venue-address", "Tiệc Cưới Hoàng Gia, Ngõ 74 P. Nguyễn Thị Định, Nhân Chính, Thanh Xuân, Hà Nội", [100, 3890, 760, 60], [20, 3395, 335, 70], 20, 15);
// Bản đồ theo DOM gốc: không khung, bản đồ 560x380 bo 15 ở x=170, nút Chỉ đường 143x40 cách bản đồ 20px; địa chỉ là đoạn chữ riêng phía trên.
block("wedding-map", "Map", [170, 4013, 560, 440], [20, 3470, 335, 435], { name: "Tiệc Cưới Hoàng Gia", address: "Tiệc Cưới Hoàng Gia, Ngõ 74 P. Nguyễn Thị Định, Nhân Chính, Thanh Xuân, Hà Nội", showText: false, heading: "", divider: false, button: "Chỉ đường", color: green, padding: 0, innerFrame: false }, { borderWidth: 0, borderRadius: 0 });

heading("dress-heading", "DRESS CODE", 4565, 4020);
text("dress-note", "Trang phục dự tiệc", [170, 4610, 620, 45], [30, 4090, 315, 45], 24, 18);
for (const [i, color] of ["#224327", "#4a6b4f", "#c2e3c7"].entries()) {
  block(`dress-color-${i}`, "Shape", [335 + i * 92, 4680, 58, 58], [64 + i * 65, 4190, 48, 48], { shape: "ellipse", fill: color });
}

heading("timeline-heading", "LỊCH TRÌNH NGÀY CƯỚI", 4793, 4380);
// Trục và chấm đo từ DOM: trục 1px ở x=450 từ tâm chấm đầu (4875) tới tâm chấm cuối, chấm 10px cách nhau 68px ngang hàng chữ.
block("timeline-line", "Shape", [450, 4875, 1, 272], [186, 4490, 2, 400], { shape: "rectangle", fill: "#c0caaa" });
const schedule = [["17:30", "Đón khách"], ["18:30", "Khai tiệc"], ["18:45", "Rót rượu, cắt bánh"], ["19:00", "Phục vụ món chính"], ["21:00", "Kết thúc tiệc"]];
schedule.forEach(([time, label], i) => {
  const y = 4860 + i * 60;
  const py = 4480 + i * 65;
  block(`timeline-dot-${i}`, "Shape", [445, 4870 + 68 * i, 10, 10], [181, py + 16, 12, 12], { shape: "ellipse", fill: green });
  text(`timeline-time-${i}`, time!, [225, y, 210, 55], [30, py, 130, 50], 35, 18, { align: "right" });
  text(`timeline-label-${i}`, label!, [525, y, 310, 55], [211, py, 150, 60], 27, 18, { align: "left" });
});

heading("wishes-heading", "SỔ LƯU BÚT", 5258, 5790);
const wishes = formPresets.find((preset) => preset.id === "wishes")!;
block("wedding-wishes", "Form", [150, 5318, 600, 277], [20, 5870, 335, 340], { ...wishes.props, formId: "demo-hoa-moc-xanh-wishes", heading: "", intro: "", button: "GỬI LỜI CHÚC", color: green, fieldBorderColor: green, fieldColor: green, padding: 24, font: serif, compact: true, previewSampleCount: 0 }, { borderWidth: 1, borderColor: "#cbd0bd", borderRadius: 8, background: "#f9f5f0" });

const comments = [
  ["Bạn Hoàng dev", "23:44:27 6/4/2026", "Chúc 2 bạn mãi yêu nhau, đầu bạc răng long"],
  ["Hoài Nam", "23:43:31 6/4/2026", "Chúc hai bạn luôn nắm tay nhau qua mọi chặng đường!!!"],
  ["Bạn Linh", "23:42:15 6/4/2026", "Mừng ngày trọng đại! Chúc hai bạn cười nhiều hơn cãi, yêu nhiều hơn giận nhen!"],
  ["Chị Huyền", "23:42:15 6/4/2026", "Chúc hai em trăm năm hạnh phúc, vợ chồng đồng lòng <3"],
  ["Cô My", "23:41:50 6/4/2026", "Chúc vợ chồng son mãi yêu thương, sớm có tin vui :D"],
  ["Chị Thanh", "23:41:09 6/4/2026", "Mừng ngày vu quy, chúc đôi uyên ương hạnh phúc bền lâu <3"],
 ] as const;
const commentTops = [5627, 5724, 5820, 5917, 6014, 6111];
comments.forEach(([name, date, message], index) => {
  const y = commentTops[index]!;
  block(`wish-${index + 1}-paper`, "Shape", [150, y, 600, 85], [10, 6100 + index * 110, 355, 88], { shape: "rectangle", fill: "#fafbf8" }, { borderWidth: 1, borderColor: "#d6ddce", borderRadius: 8 });
  text(`wish-${index + 1}-name`, name as string, [174, y + 13, 360, 24], [25, 0, 325, 22], 16, 15, { bold: true, align: "left" });
  text(`wish-${index + 1}-date`, date as string, [565, y + 13, 160, 22], [25, 22, 325, 20], 13, 12, { color: muted, align: "right" });
  text(`wish-${index + 1}-message`, message as string, [174, y + 45, 552, 30], [25, 45, 325, 30], 16, 14, { align: "left" });
});

heading("gift-heading", "HỘP QUÀ MỪNG", 6300, 6520);
// Hộp quà theo nút gốc 260x280 tại (320, 6335): hộp boho_floral_green, bảy vật nhỏ bay lên khi rê chuột, bốn ngôi sao ✦ chớp 2s lệch pha, pháo giấy, dòng "Nhấn để mở". Ảnh tải từ trang gốc.
{
  const ox = 320;
  const oy = 6335;
  const pox = 96;
  const poy = 6600;
  const FLY: Record<string, [number, number, number, number]> = { "gift-mini-1": [55, -14, 1.6, 0], "gift-mini-2": [60, 14, 1.8, 0.15], "gift-mini-3": [65, -10, 1.4, 0.3], "gift-mini-4": [70, 12, 1.7, 0.45], "gift-mini-5": [80, -8, 1.9, 0.1], "gift-mini-6": [75, 10, 1.3, 0.35], "gift-mini-7": [72, 14, 1.7, 0.2] };
  const part = (id: string, left: number, top: number, w: number, h: number, props: Record<string, JsonValue>, rotation = 0) =>
    block(id, "Decoration", [ox + left, oy + top, w, h], [pox + left * 0.7, poy + top * 0.7, w * 0.7, h * 0.7], { fit: "contain", motion: false, motionTarget: "", alt: "", ...props }, {}, rotation);
  const mini = (n: number, file: string, left: number, top: number, w: number, h: number, rotation: number) => {
    const [rise, sway, time, delay] = FLY[`gift-mini-${n}`]!;
    part(`gift-mini-${n}`, left, top, w, h, { src: `${assets}/gift2/${file}`, floatMotion: true, hoverEffect: "Bay lên rồi hiện lại", hoverGroup: "qua", hoverRise: rise, hoverSway: sway, hoverTime: time, hoverDelay: delay }, rotation);
  };
  mini(1, "porcelain_brown.webp", 5, 39, 44, 44, -22);
  mini(2, "silk_flora_brown.webp", 192, 30, 49, 50, 20);
  mini(3, "floral_fiesta_yellow.webp", 10, 150, 33, 34, -18);
  mini(4, "glass_garden_blue.webp", 209, 145, 29, 29, 14);
  part("wedding-gift", 45, 81, 170, 172, { src: `${assets}/gift2/boho_floral_green.webp`, alt: "Hộp quà mừng cưới", floatMotion: true, hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 });
  mini(5, "chateau_blue.webp", 19, 203, 50, 51, 8);
  mini(6, "baroque_gold.webp", 54, 214, 30, 31, -10);
  mini(7, "royal_v2_purple.webp", 144, 205, 49, 49, -14);
  part("gift-confetti", 120, 98, 20, 4, { src: "", hoverEffect: "Pháo giấy", hoverGroup: "qua" });
  ([[39, 27, 22, 0], [225, 57, 16, 0.6], [236, 73, 14, 1.2], [13, 89, 14, 1.7]] as const).forEach(([left, top, size, delay], index) =>
    part(`gift-sparkle-${index + 1}`, left, top, size, size, { src: `${assets}/sparkle.svg`, idleEffect: "Chớp sáng", idleDelay: delay }));
  text("gift-hint", "Nhấn để mở", [415, 6599, 69, 15], [140, 6800, 100, 20], 12, 12);
}
text("thank-you", "Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!", [150, 6740, 660, 50], [20, 6850, 335, 50], 20, 15);
text("footer-brand", "♡ CardMaking", [300, 6796, 300, 24], [20, 6902, 335, 22], 14, 12, { color: muted });

// Số đo đọc trực tiếp từ DOM trang mẫu (getBoundingClientRect của từng đoạn chữ so với cột 900px + computed style), thay cho số ước lượng bằng mắt.
// [x, y, w, cỡ chữ, độ đậm, giãn chữ]; nút chữ rộng thêm một đoạn để không bị xuống dòng khi phông của mình rộng hơn.
type Measured = [x: number, y: number, w: number, size: number, weight: number, spacing: number, extra?: Record<string, JsonValue>];
const SANS = "'Gotham', system-ui, sans-serif";
const MEASURED: Record<string, Measured> = {
  "groom-role": [476, 415, 90, 14, 300, 1.4], "groom-name": [476, 434, 160, 32, 400, 0], "bride-role": [375, 735, 45, 14, 300, 1.4], "bride-name": [315, 754, 105, 32, 400, 0],
  "ceremony-heading": [318, 1156, 263, 24, 700, 1], "groom-family-role": [197, 1222, 51, 16, 300, 0], "bride-family-role": [652, 1222, 51, 16, 300, 0],
  "groom-family-father": [140, 1252, 165, 23, 600, 0], "bride-family-father": [585, 1252, 186, 23, 600, 0], "groom-family-mother": [151, 1293, 143, 23, 600, 0], "bride-family-mother": [588, 1293, 178, 23, 600, 0],
  "groom-family-address": [45, 1334, 354, 10, 300, 0], "bride-family-address": [500, 1334, 354, 10, 300, 0], "ceremony-invite": [170, 1381, 560, 20, 300, 0],
  "ceremony-groom": [1, 1473, 898, 64, 400, 0], "ceremony-groom-role": [409, 1570, 82, 10, 300, 1], "ceremony-and": [438, 1598, 24, 42, 300, 0, { font: "'Ms Madi', cursive" }],
  "ceremony-bride": [1, 1677, 898, 64, 400, 0], "ceremony-bride-role": [431, 1774, 38, 10, 300, 1], "ceremony-place": [267, 1819, 366, 20, 400, 0],
  "ceremony-time-label": [409, 1887, 82, 18, 400, 0], "ceremony-time": [416, 1942, 68, 30, 300, 0], "ceremony-date-day": [434, 2007, 40, 40, 300, 0],
  "ceremony-day-divider-left": [396, 2023, 14, 28, 300, 0], "ceremony-day-divider-right": [498, 2023, 14, 28, 300, 0], "ceremony-day": [284, 2028, 88, 16, 300, 0], "ceremony-month": [536, 2028, 79, 16, 300, 0],
  "ceremony-year": [426, 2087, 48, 24, 300, 0], "ceremony-lunar": [257, 2143, 386, 14, 300, 3.5],
  "album-heading": [371, 2224, 158, 24, 700, 1], "party-heading": [304, 2932, 291, 24, 700, 1], "party-invite": [287, 2995, 326, 20, 400, 0, { font: SANS }], "party-time": [416, 3045, 68, 30, 300, 0],
  "party-lunar": [257, 3246, 386, 14, 300, 3.5], "party-day": [296, 3131, 89, 16, 600, 0], "party-month": [524, 3131, 80, 16, 600, 0], "party-date-day": [434, 3110, 40, 40, 600, 0], "party-day-divider-left": [396, 3127, 14, 28, 300, 0], "party-day-divider-right": [498, 3127, 14, 28, 300, 0], "party-year": [426, 3190, 48, 24, 300, 0], "party-arrival-label": [359, 3303, 82, 12, 300, 0.6], "party-arrival-time": [377, 3322, 46, 20, 600, 0], "party-banquet-label": [473, 3303, 69, 12, 300, 0.6], "party-banquet-time": [484, 3322, 46, 20, 600, 0], "venue-heading": [258, 3870, 383, 26, 700, 1], "venue-address": [200, 3921, 500, 16, 300, 0.4],
  "dress-heading": [369, 4570, 163, 24, 700, 1], "dress-note": [388, 4608, 124, 16, 300, 0], "timeline-heading": [294, 4798, 312, 24, 700, 1], "wishes-heading": [372, 5263, 156, 24, 700, 1],
  "gift-heading": [347, 6283, 206, 24, 700, 1], "gift-hint": [415, 6599, 69, 12, 500, 0, { font: SANS }], "thank-you": [100, 6671, 700, 18, 300, 0], "footer-brand": [403, 6731, 94, 12, 300, 0, { font: SANS }],
  ...Object.fromEntries([0, 1, 2, 3, 4].flatMap((i) => [[`timeline-time-${i}`, [220, 4863 + 68 * i, 190, 17, 300, 0.425]], [`timeline-label-${i}`, [490, [4865, 4933, 5001, 5070, 5138][i]!, 200, 19, 500, 0]]])),
  ...Object.fromEntries([[5644, 0], [5741, 1], [5837, 2], [5934, 3], [6031, 4], [6128, 5]].flatMap(([y, i]) => [[`wish-${i! + 1}-name`, [167, y!, 360, 14, 600, 0]], [`wish-${i! + 1}-date`, [631, y!, 94, 12, 300, 0]], [`wish-${i! + 1}-message`, [167, y! + 28, 558, 14, 300, 0]]])),
};
// Trôi theo cuộn đo từ trang mẫu (‰ quãng cuộn, [ngang, dọc]) bằng hai lần đo ở cách nhau 1000px cuộn; "flower-fixed-left" đứng yên.
const PARALLAX: Record<string, [number, number]> = {"flower-hero-main": [1, 100], "flower-hero-left": [0, 130], "flower-right-upper": [-37, -71], "flower-left-upper": [-82, -73], "flower-left-album": [0, 50], "flower-right-middle": [-51, -32], "flower-right-ceremony": [24, -32], "flower-left-middle": [-55, -43], "flower-left-lower": [-2, -29], "flower-right-lower": [24, -32], "flower-bottom-right": [-59, -68]};
function applyParallax() {
  for (const node of children) {
    const p = PARALLAX[node.id];
    if (p) node.props = { ...node.props, parallaxX: p[0], parallaxY: p[1] };
  }
}
function applyMeasured() {
  for (const node of children) {
    const m = MEASURED[node.id];
    if (!m || node.type !== "Text") continue;
    const [x, y, w, size, weight, spacing, extra] = m;
    const align = String(node.props.align ?? "center");
    const wide = w >= 800 ? 0 : 24;
    const left = align === "right" ? x - wide : align === "left" ? x : x - wide / 2;
    node.position = { mode: "free", x: { anchor: "start", offset: left }, y: { anchor: "start", offset: y } };
    const was = Number((node.size.h as { v: number }).v);
    // Đoạn nhiều dòng (khung cũ cao hơn hai dòng chữ) giữ chiều cao cũ; một dòng thì cao 1,4 lần cỡ chữ.
    node.size = { w: { kind: "px", v: w + wide }, h: { kind: "px", v: was > size * 2.6 ? was : Math.round(size * 1.4) } };
    node.props = { ...node.props, size, bold: false, fontWeight: String(weight), letterSpacing: spacing, ...(extra ?? {}) };
  }
}
applyMeasured();
applyParallax();

const paperColumn = newNode(registry, "CardPanel", "paper-column", { w: 960, h: 6900 }) as FreeNode;
paperColumn.position = { mode: "free", x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 0 } };
paperColumn.size = { w: { kind: "px", v: 900 }, h: { kind: "px", v: 6900 } };
paperColumn.phone = { x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 0 }, w: { kind: "px", v: 375 }, h: { kind: "px", v: 7100 }, rotation: 0 };
paperColumn.styles = { ...paperColumn.styles, background: paper, borderWidth: 1, borderColor: "#d9e2d4", borderRadius: 0 };
paperColumn.children = children;

export const hoaMocXanhDemo: PageData = {
  ...emptyPage(),
  // Bảng Lớp: khối không phải chữ mang tên đọc được. Không gom nhóm vì gom nhóm bỏ số đo điện thoại riêng của từng khối.
  root: nameLayers({ ...emptyPage().root, styles: { background: "#ffffff", minHeight: 6900, phoneMinHeight: 7100 }, children: [paperColumn] }),
  theme: { colors: { primary: green, secondary: muted, paper }, fonts: { body: serif, heading: serif } },
  meta: { title: "Minh Quân & Thu Hà · Hoa Mộc Xanh", description: "Thiệp cưới Hoa Mộc Xanh, dựng bằng thành phần chỉnh sửa được của CardMaking." },
};

// Popup quà mừng sinh bằng scripts/make-hoa-moc-xanh-gift.ts theo số đo cửa sổ gốc (thanh đầu xanh, hai cột QR).
const giftPage = giftJson as unknown as CardPage;
const attendance = formPresets.find((preset) => preset.id === "attendance")!;
const rsvpPopupChildren: FreeNode[] = [];
const rsvpNode = newNode(registry, "Form", "rsvp-popup-form", { w: 600, h: 620 }, { props: { ...attendance.props, formId: "demo-hoa-moc-xanh-rsvp", heading: "Xác nhận tham dự", intro: "Sự hiện diện của bạn là niềm vinh hạnh cho gia đình chúng tôi. Xin xác nhận để chúng tôi chuẩn bị chu đáo nhất.", color: green, padding: 20 } }) as FreeNode;
rsvpPopupChildren.push({ ...rsvpNode, ...box([28, 86, 544, 490]), phone: { x: { anchor: "start", offset: 20 }, y: { anchor: "start", offset: 86 }, w: { kind: "px", v: 335 }, h: { kind: "px", v: 490 }, rotation: 0 }, styles: { ...rsvpNode.styles } });
const rsvpPage: CardPage = { id: "rsvp", name: "Xác nhận tham dự", data: { ...emptyPage(), root: { ...emptyPage().root, styles: { background: "#ffffff", minHeight: 620, phoneMinHeight: 620 }, children: rsvpPopupChildren } }, popup: { width: 448, effect: "fade", backdropColor: "#000000", backdropOpacity: 62 }, interactions: {} };
// Bìa mở thiệp sinh bằng scripts/make-song-hy-covers.ts (chủ đề hmx); nút "Mở thiệp" chuyển sang trang thiệp mời.
const coverPage = coverJson as unknown as CardPage;
export const hoaMocXanhDemoDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "cover", pages: [
    coverPage,
    { id: "invitation", name: "Thiệp mời", data: hoaMocXanhDemo, interactions: { "wedding-gift": { type: "open-popup", targetPageId: giftPage.id, transition: "fade", durationMs: 280 }, "rsvp-button": { type: "open-popup", targetPageId: rsvpPage.id, transition: "fade", durationMs: 200 } } },
    giftPage,
    rsvpPage,
  ],
};
