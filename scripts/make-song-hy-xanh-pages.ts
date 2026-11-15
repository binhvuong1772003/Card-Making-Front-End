// Tạo dữ liệu thiệp Song Hỷ Xanh từ số đo DOM mẫu; mọi nội dung trong trang đều là node CardMaking có thể chỉnh trong editor.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { builtInRegistry, emptyPage, newNode, type Axis, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../lib/cards/blocks/definitions";
import { formPresets } from "../lib/cards/blocks/form-presets";

const registry = { ...builtInRegistry, ...cardDefinitions };
const PAGE_W = 960;
const PAGE_H = 6487;
const SIZE = { w: PAGE_W, h: PAGE_H };
const ROOT_PAD = 30;
const dir = resolve(__dirname, "../public/demo/song-hy-xanh");

const GREEN = "#1f3a25";
const LIGHT = "#e8f0e4";
const PAPER = "#fff7eb";
const CANVAS = "#ffffff";
const MUTED = "#666666";
const GARAmond = "'EB Garamond', serif";
const BASKERVILLE = "Baskerville, 'Times New Roman', serif";
const TIMES = "'Times New Roman', serif";
const CEREMONY = "Gala Center, 415 Hoàng Văn Thụ, Phường 2, Tân Bình, Hồ Chí Minh";

type Box = { x: number; y: number; w: number; h: number; rotation?: number };

// Tọa độ x theo mép trái cột 900px trong trang 960px.
const centerX = (left: number, width: number): Axis => ({ anchor: "center", offset: left + width / 2 + ROOT_PAD - PAGE_W / 2 });
const topY = (top: number): Axis => ({ anchor: "start", offset: top });

// Rê chuột vào hộp quà (số đo igbDecorFlyUp 1-7): bay lên, lệch ngang, thời gian, trễ.
const GIFT_FLY: Record<string, { rise: number; sway: number; time: number; delay: number }> = {
  "gift-mini-1": { rise: 55, sway: -14, time: 1.6, delay: 0 }, "gift-mini-2": { rise: 60, sway: 14, time: 1.8, delay: 0.15 },
  "gift-mini-3": { rise: 65, sway: -10, time: 1.4, delay: 0.3 }, "gift-mini-4": { rise: 70, sway: 12, time: 1.7, delay: 0.45 },
  "gift-mini-5": { rise: 80, sway: -8, time: 1.9, delay: 0.1 }, "gift-mini-6": { rise: 75, sway: 10, time: 1.3, delay: 0.35 },
  "gift-mini-7": { rise: 72, sway: 14, time: 1.7, delay: 0.2 },
};
const giftFly = (id: string): Record<string, JsonValue> => { const f = GIFT_FLY[id]!; return { hoverEffect: "Bay lên rồi hiện lại", hoverGroup: "qua", hoverRise: f.rise, hoverSway: f.sway, hoverTime: f.time, hoverDelay: f.delay }; };

function put(type: string, id: string, box: Box, props: Record<string, JsonValue>, styles: NodeStyles = {}): FreeNode {
  const node = newNode(registry, type, id, SIZE, { props }) as FreeNode;
  node.position = { mode: "free", x: centerX(box.x, box.w), y: topY(box.y) };
  node.size = { w: { kind: "px", v: box.w }, h: { kind: "px", v: box.h } };
  node.rotation = box.rotation ?? 0;
  node.styles = { ...node.styles, ...styles };
  return node;
}

const text = (id: string, value: string, box: Box, size: number, color = GREEN, font = BASKERVILLE, extra: Record<string, JsonValue> = {}, styles: NodeStyles = {}) =>
  put("Text", id, box, { text: value, size, color, font, bold: false, italic: false, underline: false, align: "center", ...extra }, styles);
const shape = (id: string, kind: string, box: Box, fill: string, styles: NodeStyles = {}) =>
  put("Shape", id, box, { shape: kind, fill, motionTarget: "" }, styles);
const image = (id: string, src: string, box: Box, alt = "", styles: NodeStyles = {}) =>
  put("Decoration", id, box, { src, alt, fit: "contain", motion: false, floatMotion: false, motionTarget: "" }, styles);
const pageData = (children: FreeNode[], height = PAGE_H) => {
  const page = emptyPage();
  return { ...page, root: { ...page.root, styles: { ...page.root.styles, background: CANVAS, minHeight: height, phoneMinHeight: 812 }, children } };
};

function invitation() {
  const nodes: FreeNode[] = [
    // Tờ giấy kem 900px nằm giữa canvas trắng; viền mảnh chỉ nằm ở mép ngoài tờ giấy.
    shape("paper-column", "rectangle", { x: 0, y: 0, w: 900, h: PAGE_H }, PAPER, { borderWidth: 1, borderColor: "#e1ded1" }),
    // Source: 872px circle, half above the header, recolored by its CSS filter.
    // Keep it as an editable ellipse rather than a faint red SVG.
    shape("sunburst", "ellipse", { x: 14, y: -435, w: 872, h: 872 }, "#0d2a0c"),
  ];

  // Phần mở đầu của trang trong (y=0–940): chữ, dấu Song Hỷ, ảnh vòm và chữ cong là các khối độc lập.
  nodes.push(put("CurvedText", "hero-welcome", { x: 1, y: 53, w: 898, h: 21 }, { text: "WELCOME TO OUR WEDDING", size: 14, color: LIGHT, font: "'Cormorant Garamond', 'Times New Roman', serif", bold: false, italic: false, amount: 0, layout: "Tự do", letterSpacing: 0.35 }));
  nodes.push(text("hero-groom-role", "Trưởng Nam", { x: 54, y: 101.75, w: 334.5, h: 21 }, 14, LIGHT, "'Avenir Next', sans-serif", { fontWeight: "300", textShadow: "Nhẹ", textShadowColor: GREEN }));
  nodes.push(text("hero-groom", "HẢI NAM", { x: 54, y: 126.75, w: 334.5, h: 34.5 }, 23, LIGHT, "'Big Caslon', Baskerville, 'Times New Roman', serif"));
  const emblem = image("hero-chu-hy", "/demo/song-hy-xanh/chu-hy.webp", { x: 408, y: 90, w: 83, h: 83 }, "Chữ Song Hỷ");
  emblem.props = { ...emblem.props, tint: true, tintColor: "#d8efd5" };
  nodes.push(emblem);
  nodes.push(text("hero-bride-role", "Út Nữ", { x: 511.5, y: 101.75, w: 334.5, h: 21 }, 14, LIGHT, "'Avenir Next', sans-serif", { fontWeight: "300", textShadow: "Nhẹ", textShadowColor: GREEN }));
  nodes.push(text("hero-bride", "KHÁNH LINH", { x: 511.5, y: 126.75, w: 334.5, h: 34.5 }, 23, LIGHT, "'Big Caslon', Baskerville, 'Times New Roman', serif"));
  nodes.push(put("PhotoFrame", "hero-couple", { x: 264, y: 258, w: 372, h: 625.625 }, {
    src: "/demo/song-hy-xanh/hero-couple.jpg", alt: "Ảnh cưới Võ Hải Nam và Huỳnh Khánh Linh",
    shape: { id: "arch", geometry: "arch", maskPath: "" }, zoom: 100, posX: 50, posY: 50, frameWidth: 0, frameColor: GREEN,
  }));
  nodes.push(put("CurvedText", "hero-curved", { x: 264, y: 238, w: 372, h: 186 }, {
    text: "LOVE NEVER FAILS", size: 18, color: LIGHT, font: "'Cormorant Garamond', 'Times New Roman', serif", bold: false, italic: false, amount: 90, layout: "Nửa tròn", radius: 104.78, letterSpacing: 0.22,
  }));
  const star = "https://res.cloudinary.com/djrcgraqq/image/upload/v1794706476/cardmaking/decorations/ref-songhy-green-star.webp";
  nodes.push(image("hero-star-left", star, { x: 286.7386, y: 292.6713, w: 20.8112, h: 20.8112 }, "Ngôi sao Song Hỷ", { opacity: 90 }));
  nodes.push(image("hero-star-right", star, { x: 592.4517, y: 292.6713, w: 20.8112, h: 20.8112 }, "Ngôi sao Song Hỷ", { opacity: 90 }));

  const band = (id: string, label: string, y: number) => {
    nodes.push(shape(`${id}-band`, "rectangle", { x: 0, y, w: 900, h: 68 }, GREEN));
    nodes.push(text(`${id}-title`, label, { x: 140, y: y + 13, w: 620, h: 36 }, 24, LIGHT, TIMES, { bold: true }));
  };

  // Thông tin lễ cưới (941–1926).
  band("family", "THÔNG TIN LỄ CƯỚI", 941);
  nodes.push(shape("family-divider", "rectangle", { x: 449, y: 1035, w: 1, h: 98 }, MUTED, { opacity: 35 }));
  const familyRows = [
    { id: "groom", x: 165, label: "Ông Bà", first: "Võ Nhật Minh", second: "Trần Thu Thảo", address: "63 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh" },
    { id: "bride", x: 616, label: "Ông Bà", first: "Huỳnh Thanh Nam", second: "Nguyễn Thị Kim Oanh", address: "456 Lê Lợi, Quận 3, TP. Hồ Chí Minh" },
  ];
  for (const row of familyRows) {
    nodes.push(text(`${row.id}-parents`, row.label, { x: row.x + 28, y: 1035, w: 80, h: 17 }, 15, MUTED, BASKERVILLE, { fontWeight: "300" }));
    nodes.push(text(`${row.id}-parent-one`, row.first, { x: row.x, y: 1061, w: 140, h: 17 }, 15, GREEN, BASKERVILLE, { bold: true, fontWeight: "600" }));
    nodes.push(text(`${row.id}-parent-two`, row.second, { x: row.x - 10, y: 1088, w: 160, h: 17 }, 15, GREEN, BASKERVILLE, { bold: true, fontWeight: "600" }));
    nodes.push(text(`${row.id}-address`, row.address, { x: row.x - 50, y: 1116, w: 260, h: 24 }, 13, MUTED, BASKERVILLE, { fontWeight: "300", lineHeight: 16.25 }));
  }
  nodes.push(text("family-announcement", "TRÂN TRỌNG BÁO TIN\nLỄ THÀNH HÔN CỦA CON CHÚNG TÔI", { x: 186, y: 1164, w: 528, h: 60 }, 20, GREEN, BASKERVILLE, { fontWeight: "300", letterSpacing: 1 }));
  nodes.push(text("groom-name", "Võ Hải Nam", { x: 91, y: 1240, w: 718, h: 100 }, 64, GREEN, GARAmond));
  nodes.push(text("groom-role", "TRƯỞNG NAM", { x: 328, y: 1358, w: 244, h: 15 }, 13, MUTED));
  nodes.push(text("couple-ampersand", "&", { x: 437, y: 1392, w: 26, h: 53 }, 35, MUTED, GARAmond));
  nodes.push(text("bride-name", "Huỳnh Khánh Linh", { x: 91, y: 1460, w: 718, h: 100 }, 64, GREEN, GARAmond));
  nodes.push(text("bride-role", "ÚT NỮ", { x: 422, y: 1578, w: 56, h: 15 }, 13, MUTED));
  nodes.push(text("ceremony-home", "LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA", { x: 267, y: 1652, w: 366, h: 65 }, 20));
  nodes.push(text("ceremony-time", "VÀO LÚC 09:00", { x: 355, y: 1725, w: 190, h: 23 }, 15, MUTED));
  nodes.push(put("Text", "ceremony-weekday", { x: 323, y: 1787, w: 98, h: 20 }, { text: "THỨ NĂM", size: 15, color: MUTED, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "right" }));
  nodes.push(shape("ceremony-date-divider", "rectangle", { x: 449, y: 1768, w: 1, h: 58 }, MUTED, { opacity: 35 }));
  nodes.push(put("Text", "ceremony-day", { x: 389, y: 1767, w: 54, h: 57 }, { text: "30", size: 38, color: GREEN, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "right" }));
  nodes.push(put("Text", "ceremony-month", { x: 502, y: 1787, w: 100, h: 20 }, { text: "THÁNG 07", size: 15, color: MUTED, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "left" }));
  nodes.push(text("ceremony-year", "2026", { x: 466, y: 1832, w: 54, h: 33 }, 22, MUTED));
  nodes.push(text("ceremony-lunar", "(TỨC NGÀY 17 THÁNG 6 NĂM BÍNH NGỌ)", { x: 306, y: 1873, w: 289, h: 21 }, 14, MUTED));

  // Album Coverflow đúng 6 ảnh gốc, vuốt được trên điện thoại và bấm để phóng lớn.
  band("album", "ALBUM ẢNH", 1926);
  nodes.push(put("Album", "wedding-album", { x: 0, y: 1994, w: 900, h: 572 }, {
    images: [1, 2, 3, 4, 5, 6].map((index) => `/demo/song-hy-xanh/photo-${index}.jpg`),
    autoplay: true, interval: 2.5, lightbox: true, radius: 16, dotColor: GREEN,
  }));

  // Thông tin tiệc cưới (2566–3385).
  band("reception", "THÔNG TIN TIỆC CƯỚI", 2566);
  nodes.push(text("reception-intro", "TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:", { x: 200, y: 2657, w: 500, h: 30 }, 20));
  nodes.push(text("reception-time", "18:00", { x: 400, y: 2700, w: 100, h: 36 }, 24, GREEN, BASKERVILLE, { bold: true }));
  nodes.push(put("Text", "reception-weekday", { x: 320, y: 2771, w: 80, h: 20 }, { text: "THỨ NĂM", size: 15, color: MUTED, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "right" }));
  nodes.push(shape("reception-date-divider-left", "rectangle", { x: 414, y: 2752, w: 1, h: 58 }, MUTED, { opacity: 35 }));
  nodes.push(put("Text", "reception-day", { x: 428, y: 2751, w: 44, h: 57 }, { text: "30", size: 38, color: GREEN, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "center" }));
  nodes.push(shape("reception-date-divider-right", "rectangle", { x: 486, y: 2752, w: 1, h: 58 }, MUTED, { opacity: 35 }));
  nodes.push(put("Text", "reception-month", { x: 500, y: 2771, w: 85, h: 20 }, { text: "THÁNG 07", size: 15, color: MUTED, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "left" }));
  nodes.push(text("reception-year", "2026", { x: 400, y: 2820, w: 100, h: 33 }, 22, MUTED, BASKERVILLE));
  nodes.push(text("reception-lunar", "(Tức ngày 17 tháng 6 năm Bính Ngọ)", { x: 220, y: 2863, w: 460, h: 21 }, 14, MUTED));
  nodes.push(text("banquet-time-label", "KHAI TIỆC", { x: 400, y: 2902, w: 100, h: 16 }, 11, MUTED));
  nodes.push(text("banquet-time", "18:00", { x: 400, y: 2921, w: 100, h: 30 }, 20, GREEN, BASKERVILLE, { bold: true }));
  nodes.push(put("CalendarFrame", "wedding-calendar", { x: 275, y: 2958, w: 350, h: 272 }, {
    date: "2026-07-30", sundayFirst: false, weekOnly: false, showTitle: true, lines: false, innerFrame: false,
    markShape: "Tim", markColor: GREEN, markTextColor: LIGHT, color: GREEN, weekColor: "#778b75", size: 13, padding: 12,
    font: "Roboto, Arial, sans-serif", titleFont: "Roboto, Arial, sans-serif", eventButton: "", eventTitle: "Lễ cưới Song Hỷ Xanh", eventTime: "18:00", eventMinutes: 240, eventPlace: CEREMONY, eventNote: "",
  }, { borderWidth: 1, borderColor: "#c9c7b8", borderRadius: 8 }));
  nodes.push(shape("calendar-title-rule", "rectangle", { x: 287, y: 3002, w: 326, h: 1 }, "#c9c7b8"));
  nodes.push(shape("calendar-week-rule", "rectangle", { x: 287, y: 3030, w: 326, h: 1 }, GREEN));
  nodes.push(text("calendar-link", "Thêm vào lịch", { x: 401, y: 3257, w: 98, h: 20 }, 14, GREEN, BASKERVILLE, { underline: true }));
  nodes.push(put("Button", "rsvp-button", { x: 341, y: 3317, w: 219, h: 42 }, {
    label: "XÁC NHẬN THAM DỰ", href: "", action: "", payload: {}, fill: GREEN, textColor: LIGHT, shape: "rounded", size: 16, font: BASKERVILLE,
  }));

  // Địa điểm (3385–4091), bản đồ là block thật để người dùng đổi địa chỉ, zoom và nút chỉ đường.
  band("venue", "TIỆC CƯỚI SẼ TỔ CHỨC TẠI", 3391);
  nodes.push(text("venue-address", CEREMONY, { x: 130, y: 3493, w: 640, h: 24 }, 16, MUTED));
  nodes.push(put("Map", "venue-map", { x: 76, y: 3542, w: 748, h: 500 }, {
    name: "Gala Center", address: CEREMONY, showText: false, zoom: 16, heading: "", divider: false,
    button: "Chỉ đường", color: GREEN, innerFrame: false, padding: 0,
  }));

  // Dress code: một block đổi được chữ, hình mẫu và cả màu sắc; đúng ba vòng tròn của mẫu.
  nodes.push(put("DressCode", "dress-code", { x: 290, y: 4139, w: 320, h: 140 }, {
    heading: "DRESS CODE", subtitle: "Trang phục dự tiệc", headingColor: GREEN, subtitleColor: GREEN,
    swatchShape: "circle", swatchSize: 48, swatchGap: 24, colors: ["#8b9a6b", "#e8e8e8", "#e8dcc8"],
  }));

  // Lịch trình: các giờ, dấu mốc và mô tả đều là khối riêng.
  nodes.push(text("timeline-title", "LỊCH TRÌNH NGÀY CƯỚI", { x: 298, y: 4367, w: 304, h: 36 }, 24, GREEN, TIMES, { bold: true }));
  nodes.push(shape("timeline-line", "rectangle", { x: 449, y: 4447, w: 1, h: 273 }, GREEN, { opacity: 45 }));
  const schedule = [
    ["17:30", "Đón khách"], ["18:30", "Khai tiệc"], ["18:45", "Rót rượu, cắt bánh"], ["19:00", "Phục vụ món chính"], ["21:00", "Kết thúc tiệc"],
  ];
  schedule.forEach(([time, label], index) => {
    const y = 4437 + index * 68;
    nodes.push(put("Text", `timeline-${index + 1}-time`, { x: 220, y, w: 190, h: 25 }, { text: time!, size: 17, color: GREEN, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "right" }));
    nodes.push(shape(`timeline-${index + 1}-dot`, "ellipse", { x: 443, y: y + 7, w: 13, h: 13 }, GREEN, { borderWidth: 2, borderColor: LIGHT }));
    nodes.push(put("Text", `timeline-${index + 1}-description`, { x: 490, y: y + 2, w: 230, h: 25 }, { text: label!, size: 19, color: MUTED, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "left" }));
  });

  // Guestbook, input form và sáu lời chúc không reserve khoảng trống cố định; từng lời chúc mẫu đều sửa được.
  band("guestbook", "SỔ LƯU BÚT", 4784);
  const wishes = formPresets.find((preset) => preset.id === "wishes")!;
  nodes.push(put("Form", "guestbook-form", { x: 150, y: 4917, w: 600, h: 308 }, {
    ...(cardDefinitions.Form!.defaultProps as Record<string, JsonValue>), ...(wishes.props as Record<string, JsonValue>),
    heading: "", intro: "", button: "GỬI LỜI CHÚC", success: "Cảm ơn bạn. Lời chúc đã hiện trong sổ.",
    formId: "songhyxanh-guestbook", color: GREEN, padding: 25, compact: true,
    publicList: { enabled: false, nameFieldId: "", textFieldId: "" },
    fieldColor: "#666666", fieldBorderColor: "#d1d5db",
  }, { background: "#ffffff", borderWidth: 0, borderColor: "#ffffff", borderRadius: 8, shadow: { x: 0, y: 4, blur: 8, spread: 0, color: "#000000", opacity: 12 } }));
  const comments = [
    ["Gia đình cô Lan", "20:58:41 29/7/2026", "Chúc hai cháu trăm năm hạnh phúc, sớm sinh quý tử!", 92],
    ["Trần Thị Quỳnh Như", "9:08:37 17/7/2026", "Hy vọng tổ ấm nhỏ này sẽ sớm rộn rã tiếng cười và hạnh phúc viên mãn.", 122],
    ["Gia đình Minh Anh", "10:32:39 14/7/2026", "Chúc hai bạn luôn yêu thương, đồng hành và sẻ chia cùng nhau.", 96],
    ["Hoàng Phúc", "6:37:55 14/7/2026", "Mong hai bạn xây dựng một mái ấm tràn đầy tiếng cười và niềm vui.", 96],
    ["Ngọc Hân", "6:37:15 14/7/2026", "Chúc cô dâu chú rể một ngày cưới thật trọn vẹn và đáng nhớ!", 96],
    ["Bạn thân", "6:36:55 14/7/2026", "Chúc hai bạn mãi hạnh phúc, sớm đón thêm nhiều niềm vui.", 96],
  ] as const;
  const commentTops = [5248, 5356, 5490, 5598, 5706, 5814];
  comments.forEach(([name, date, message, height], index) => {
    const y = commentTops[index]!;
    nodes.push(shape(`wish-${index + 1}-paper`, "rectangle", { x: 150, y, w: 592, h: height }, "#ffffff", { borderWidth: 1, borderColor: "#e7e8e4", borderRadius: 8 }));
    nodes.push(put("Text", `wish-${index + 1}-name`, { x: 167, y: y + 15, w: 360, h: 28 }, { text: name, size: 18, color: GREEN, font: TIMES, bold: true, italic: false, underline: false, align: "left" }));
    nodes.push(put("Text", `wish-${index + 1}-date`, { x: 540, y: y + 17, w: 185, h: 22 }, { text: date, size: 12, color: MUTED, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "right" }));
    nodes.push(put("Text", `wish-${index + 1}-message`, { x: 167, y: y + 51, w: 558, h: height - 58 }, { text: message, size: 16, color: MUTED, font: BASKERVILLE, bold: false, italic: false, underline: false, align: "left" }));
  });

  // Hộp quà (5942–6458). Asset hộp chính, 7 hộp mini, bóng và lấp lánh tách riêng; không gộp thành ảnh phẳng.
  nodes.push(text("gift-title", "HỘP QUÀ MỪNG", { x: 344, y: 5974, w: 212, h: 36 }, 24, GREEN, BASKERVILLE, { bold: true }));
  nodes.push(shape("gift-shadow", "ellipse", { x: 383, y: 6272, w: 134, h: 12 }, "#33402e", { opacity: 25, shadow: { x: 0, y: 0, blur: 4, spread: 0, color: "#000000", opacity: 30 } }));
  const giftDecor = [
    ["gift-mini-1", "/demo/song-hy-xanh/gift/mini/baroque_gold.webp", 324, 6062, 44, 45, -22],
    ["gift-mini-2", "/demo/song-hy-xanh/gift/mini/minimalism_green.webp", 512, 6053, 49, 49, 20],
    ["gift-mini-3", "/demo/song-hy-xanh/gift/mini/baroque_v2_darkgreen.webp", 330, 6173, 33, 34, -18],
    ["gift-mini-4", "/demo/song-hy-xanh/gift/mini/silk_ribbon_pink.webp", 529, 6168, 29, 29, 14],
  ] as const;
  giftDecor.forEach(([id, src, x, y, w, h, rotation]) => nodes.push(put("Decoration", id, { x, y, w, h, rotation }, { src, alt: "Hộp quà nhỏ", fit: "contain", motion: false, floatMotion: true, motionTarget: "", ...giftFly(id as string) })));
  nodes.push(put("Decoration", "gift-main", { x: 365, y: 6099, w: 170, h: 178 }, { src: "/demo/song-hy-xanh/gift/main.webp", alt: "Hộp quà Song Hỷ Xanh", fit: "contain", motion: false, floatMotion: true, motionTarget: "", hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 }));
  // Pháo giấy bắn lên từ mép trên hộp khi rê chuột (8 mảnh theo trang mẫu).
  nodes.push(put("Decoration", "gift-confetti", { x: 440, y: 6116, w: 20, h: 4 }, { src: "", alt: "", fit: "contain", motion: false, floatMotion: false, motionTarget: "", hoverEffect: "Pháo giấy", hoverGroup: "qua" }));
  [
    ["gift-mini-5", "/demo/song-hy-xanh/gift/mini/lien_hoa_pink.webp", 339, 6226, 50, 50, 8],
    ["gift-mini-6", "/demo/song-hy-xanh/gift/mini/minimalism_red.webp", 376, 6237, 30, 30, -10],
    ["gift-mini-7", "/demo/song-hy-xanh/gift/mini/crystal_floral_red.webp", 462, 6229, 50, 56, -14],
  ].forEach(([id, src, x, y, w, h, rotation]) => nodes.push(put("Decoration", id as string, { x: x as number, y: y as number, w: w as number, h: h as number, rotation: rotation as number }, { src: src as string, alt: "Hộp quà nhỏ", fit: "contain", motion: false, floatMotion: true, motionTarget: "", ...giftFly(id as string) })));
  [[357, 6046, 20, 37], [540, 6075, 14, 27], [335, 6121, 8, 12], [558, 6104, 8, 12]].forEach(([x, y, w, h], index) =>
    {
      const sparkle = image(`gift-sparkle-${index + 1}`, star, { x, y, w, h }, "Ngôi sao Song Hỷ", { opacity: 90 });
      // Chớp sáng 2s (mờ -> sáng -> mờ), bốn ngôi sao lệch pha 0 / 0,6 / 1,2 / 1,7s như trang mẫu.
      sparkle.props = { ...sparkle.props, idleEffect: "Chớp sáng", idleDelay: [0, 0.6, 1.2, 1.7][index]! };
      nodes.push(sparkle);
    });
  nodes.push(text("gift-open-hint", "Nhấn để mở", { x: 380, y: 6290, w: 140, h: 20 }, 12, "#464646"));
  nodes.push(text("footer-thanks", "Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!", { x: 170, y: 6370, w: 560, h: 56 }, 20, MUTED));
  nodes.push(text("footer-brand", "♡ chungdoi.com", { x: 390, y: 6464, w: 120, h: 18 }, 12, MUTED));

  return { id: "invitation", name: "Thiệp mời", data: pageData(nodes), interactions: {
    "rsvp-button": { type: "open-popup" as const, targetPageId: "rsvp", transition: "fade" as const, durationMs: 250 },
    "gift-main": { type: "open-popup" as const, targetPageId: "gift-details", transition: "fade" as const, durationMs: 250 },
    "gift-open-hint": { type: "open-popup" as const, targetPageId: "gift-details", transition: "fade" as const, durationMs: 250 },
  } };
}

function popupPage(id: string, name: string, children: FreeNode[], size: { w: number; h: number }, width: number, background = PAPER) {
  const page = emptyPage();
  const data = { ...page, root: { ...page.root, styles: { ...page.root.styles, background, minHeight: size.h, phoneMinHeight: size.h }, children } };
  return { id, name, data, interactions: {}, popup: { width, effect: "fade" as const, backdropColor: GREEN, backdropOpacity: 68 } };
}

function rsvp() {
  const preset = formPresets.find((item) => item.id === "attendance")!;
  return popupPage("rsvp", "Xác nhận tham dự", [
    shape("rsvp-popup-paper", "rectangle", { x: 20, y: 20, w: 920, h: 700 }, PAPER, { borderRadius: 16, shadow: { x: 0, y: 12, blur: 32, spread: 0, color: "#17331e", opacity: 25 } }),
    text("rsvp-popup-title", "XÁC NHẬN THAM DỰ", { x: 210, y: 62, w: 540, h: 44 }, 26, GREEN, TIMES, { bold: true }),
    put("Form", "rsvp-form", { x: 260, y: 140, w: 440, h: 500 }, {
      ...(cardDefinitions.Form!.defaultProps as Record<string, JsonValue>), ...(preset.props as Record<string, JsonValue>),
      formId: "songhyxanh-rsvp", color: GREEN, heading: "", intro: "Cô dâu chú rể rất mong có bạn.", button: "GỬI XÁC NHẬN",
    }),
  ], { w: PAGE_W, h: 760 }, 560);
}

// Cửa sổ quà mừng theo số đo gốc 576x410: thanh đầu xanh 76px (tiêu đề Baskerville 24px, chữ hoa, trắng), nền #dcebde, hai cột 256px cách nhau 16px.
// Mỗi cột: nhãn 12px, thẻ QR trắng 160x160 bo 12 (ảnh 140x140), ba dòng ngân hàng 10px (thường, số tài khoản, tên đậm), nút "Lưu QR" 68x23. Số đo nhân K để vừa khung 960.
function giftDetails() {
  const K = 960 / 576;
  const n = (v: number) => Math.round(v * K);
  const at = (left: number, top: number, w: number, h: number): Box => ({ x: n(left) - 30, y: n(top), w: n(w), h: n(h) });
  const sans = "'Gotham', system-ui, sans-serif";
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";
  const INK = "#464646";
  const nodes: FreeNode[] = [
    shape("gift-popup-header", "rectangle", at(0, 0, 576, 76), GREEN),
    text("gift-popup-title", "HỘP QUÀ MỪNG", at(24, 24, 528, 36), n(24), "#ffffff", BASKERVILLE, { bold: true }),
  ];
  const columns = [
    { key: "groom", left: 24, title: "Chú Rể - Võ Hải Nam", bank: "Vietcombank", number: "123456789", holder: "VÕ HẢI NAM", qr: "/demo/song-hy-xanh/qr-groom.png" },
    { key: "bride", left: 296, title: "Cô Dâu - Huỳnh Khánh Linh", bank: "Techcombank", number: "987654321", holder: "HUỲNH KHÁNH LINH", qr: "/demo/song-hy-xanh/qr-bride.png" },
  ];
  for (const c of columns) {
    const mid = c.left + 128;
    nodes.push(
      text(`gift-popup-${c.key}-label`, c.title, at(mid - 128, 100, 256, 20), n(12), GREEN, sans),
      shape(`gift-popup-${c.key}-qr-card`, "rectangle", at(mid - 80, 140, 160, 160), "#ffffff", { borderRadius: n(12) }),
      image(`gift-popup-qr-${c.key}`, c.qr, at(mid - 70, 150, 140, 140), `Mã QR mừng cưới ${c.key === "groom" ? "chú rể" : "cô dâu"}`),
      text(`gift-popup-${c.key}-bank`, c.bank, at(mid - 128, 308, 256, 15), n(10), INK, sans),
      text(`gift-popup-${c.key}-number`, c.number, at(mid - 128, 325, 256, 15), n(10), INK, mono),
      text(`gift-popup-${c.key}-holder`, c.holder, at(mid - 128, 342, 256, 15), n(10), INK, sans, { bold: true }),
      shape(`gift-popup-${c.key}-save`, "rectangle", at(mid - 34, 363, 68, 23), "#ccdccf", { borderRadius: n(12) }),
      text(`gift-popup-${c.key}-save-label`, "↓ Lưu QR", at(mid - 34, 367, 68, 15), n(10), GREEN, sans),
    );
  }
  return popupPage("gift-details", "Hộp quà mừng", nodes, { w: PAGE_W, h: n(410) }, 641, "#dcebde");
}

const built = { invitation: invitation(), rsvp: rsvp(), giftDetails: giftDetails() };
writeFileSync(resolve(dir, "pages-xanh.json"), JSON.stringify(built));
console.log(`Đã tạo ${built.invitation.data.root.children.length} node có thể chỉnh trong trang Song Hỷ Xanh.`);
