import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles, type PageData, type TreeNode } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import { nameLayers } from "../layers";
import type { CardDocument } from "../document";

type Rect = [number, number, number, number];
type Template = {
  slug: string; title: string; couple: [string, string]; parents: [string, string, string, string];
  venue: string; address: string; date: string; eventTime: string; weekday: string; day: string; month: string; year: string;
  arrival: string; banquet: string; colors: { page: string; paper: string; ink: string; muted: string; panel: string; accent: string };
  height: number; hero: number; album: number; party: number; venueY: number; dress: number; schedule: number; wishes: number;
  photoCount: number; startAt?: number; rows: [string, string, string?][]; ornaments: [string, Rect, number?][];
  font?: string; titleFont?: string; rounded?: number; backgroundAsset?: string; ornamentFile: string; wishSamples: number;
};

const registry = { ...builtInRegistry, ...cardDefinitions };
const serif = "'EB Garamond', 'Times New Roman', serif";
const book = "'Lora', 'Times New Roman', serif";
const display = "'Cormorant Garamond', 'Times New Roman', serif";
const wishPreset = formPresets.find((preset) => preset.id === "wishes")!;

function build(template: Template): CardDocument {
  const { slug, colors: c, height } = template;
  const prefix = `/demo/${slug}`;
  const content: FreeNode[] = [];
  const mobileRect = ([x, y, w, h]: Rect): Rect => [Math.round(x * 375 / 898), y, Math.max(18, Math.round(w * 375 / 898)), h];
  const add = (type: string, id: string, rect: Rect, props: Record<string, JsonValue>, styles: NodeStyles = {}, rotation = 0, phone = mobileRect(rect)) => {
    const node = newNode(registry, type, id, { w: 960, h: height }, { props }) as FreeNode;
    node.position = { mode: "free", x: { anchor: "start", offset: rect[0] }, y: { anchor: "start", offset: rect[1] } };
    node.size = { w: { kind: "px", v: rect[2] }, h: { kind: "px", v: rect[3] } };
    node.phone = { x: { anchor: "start", offset: phone[0] }, y: { anchor: "start", offset: phone[1] }, w: { kind: "px", v: phone[2] }, h: { kind: "px", v: phone[3] }, rotation };
    node.rotation = rotation;
    node.styles = { ...node.styles, ...styles };
    content.push(node);
    return node;
  };
  const text = (id: string, value: string, rect: Rect, options: { size?: number; color?: string; font?: string; bold?: boolean; align?: "left" | "center" | "right"; letterSpacing?: number; phone?: Rect } = {}) => {
    const size = options.size ?? 24;
    const node = add("Text", id, rect, {
      text: value, size, color: options.color ?? c.ink, font: options.font ?? template.font ?? book,
      bold: options.bold ?? false, italic: false, underline: false, align: options.align ?? "center",
      letterSpacing: options.letterSpacing ?? 0,
    }, {}, 0, options.phone);
    node.phoneProps = { size: Math.max(12, Math.round(size * 0.78)) };
    return node;
  };
  const shape = (id: string, rect: Rect, fill: string, styles: NodeStyles = {}, kind = "rectangle") => add("Shape", id, rect, { shape: kind, fill }, styles);
  const art = (id: string, file: string, rect: Rect, options: { opacity?: number; rotation?: number; flipX?: boolean; fit?: string; phone?: Rect } = {}) => add("Decoration", id, rect, {
    src: `${prefix}/source-assets/${file}`, alt: file.replaceAll("-", " "), fit: options.fit ?? "contain",
    flipX: options.flipX ?? false, motion: false, floatMotion: false,
  }, options.opacity === undefined ? {} : { opacity: options.opacity }, options.rotation ?? 0, options.phone);
  const heading = (id: string, value: string, y: number, color = c.ink) => text(id, value, [24, y, 850, 42], { size: 29, color, font: template.titleFont ?? display, bold: true, letterSpacing: 0.4 });
  const panel = (id: string, rect: Rect, fill = c.panel, radius = template.rounded ?? 18) => shape(id, rect, fill, {
    borderRadius: radius,
    ...(template.slug === "to-duyen-do-dam" || template.slug === "to-duyen-xanh" ? {} : { borderWidth: 1, borderColor: c.accent }),
  });

  // Every visible item is a native CardMaking block. These are content pages only; Claude adds cover and popup behavior.
  panel("hero-paper", [0, 0, 898, template.hero], c.paper, template.rounded ?? 0);
  if (template.backgroundAsset) art("paper-texture", template.backgroundAsset, [0, 0, 898, height], { opacity: template.slug === "minimalism-nau-dam" ? 50 : 32, fit: "cover" });
  for (const [id, rect, rotation] of template.ornaments.filter(([id]) => id.includes("hero"))) art(id, template.ornamentFile, rect, { rotation, flipX: id.includes("right") });

  if (template.slug === "song-hy-v2-do") {
    art("hero-wave", "hero-shape.svg", [-42, -320, 982, 760], { fit: "contain" });
    art("hero-happiness-emblem", "double-happiness.webp", [419, 175, 60, 56]);
  } else if (template.slug.startsWith("to-duyen")) {
    art("hero-silk-ribbon", "ribbon-decoration.webp", [-110, template.hero - 170, 1118, 260], { fit: "contain" });
  }

  const center = 449;
  text("hero-kicker", template.slug === "minimalism-nau-dam" ? "SAVE THE DATE" : template.slug.startsWith("to-duyen") ? "THÔNG TIN LỄ CƯỚI" : "TRÂN TRỌNG KÍNH MỜI", [110, 42, 678, 32], { size: 17, color: c.muted, font: book, bold: true, letterSpacing: 2.3 });
  text("family-groom", `Ông Bà\n${template.parents[0]}\n${template.parents[1]}`, [48, 93, 330, 104], { size: 16, color: c.ink, font: book, bold: false });
  text("family-bride", `Ông Bà\n${template.parents[2]}\n${template.parents[3]}`, [520, 93, 330, 104], { size: 16, color: c.ink, font: book, bold: false });
  shape("family-divider", [448, 110, 1, 76], c.accent);
  text("hero-names", `${template.couple[0]}\n&\n${template.couple[1]}`, [132, 223, 634, 194], { size: template.slug === "minimalism-nau-dam" ? 45 : 43, color: c.ink, font: template.titleFont ?? display, bold: true });
  text("hero-date", `${template.eventTime} · ${template.weekday.toLocaleUpperCase("vi-VN")} · ${template.day} THÁNG ${template.month} ${template.year}`, [125, template.hero - 135, 648, 44], { size: 19, color: c.muted, font: book });

  heading("album-heading", "ALBUM ẢNH", template.album - 72);
  if (template.slug === "to-duyen-do-dam" || template.slug === "to-duyen-xanh") {
    art("album-flower", "flower-decoration.webp", [690, template.album - 38, 330, 410], { rotation: 8, phone: [290, template.album - 25, 150, 290] });
    art("album-line", "line-decoration.webp", [730, template.album - 10, 180, 420], { rotation: 7, phone: [311, template.album - 5, 80, 320] });
  }
  add("Album", "wedding-album", [134, template.album, 630, template.slug === "minimalism-nau-dam" ? 470 : 500], {
    images: Array.from({ length: template.photoCount }, (_, index) => `${prefix}/photo-${index + 1}.webp`),
    autoplay: false, interval: 2, lightbox: true, radius: template.slug === "song-hy-v2-do" ? 8 : 12,
    dotColor: c.accent, startAt: template.startAt ?? 1, spread: 0,
  });

  if (template.slug === "song-hy-v2-do") art("party-wave", "hero-shape.svg", [-40, template.party + 450, 980, 760], { fit: "contain" });
  panel("party-panel", [90, template.party, 718, template.slug === "minimalism-nau-dam" ? 940 : 1060], c.panel, template.rounded ?? 20);
  heading("party-heading", "THÔNG TIN TIỆC CƯỚI", template.party + 36, c.paper);
  text("party-intro", "TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC:", [145, template.party + 95, 608, 40], { size: 25, color: c.paper, font: template.titleFont ?? display });
  text("party-time", template.eventTime, [314, template.party + 142, 270, 48], { size: 34, color: c.paper, font: display, bold: true });
  text("party-date", `${template.weekday.toLocaleUpperCase("vi-VN")}   │   ${template.day}   │   THÁNG ${template.month}   │   ${template.year}`, [145, template.party + 214, 608, 42], { size: 22, color: c.paper, font: book });
  text("party-lunar", "(TỨC NGÀY CƯỚI THEO ÂM LỊCH)", [145, template.party + 265, 608, 28], { size: 15, color: c.muted, font: book, letterSpacing: 1.6 });
  text("arrival-label", "ĐÓN KHÁCH", [250, template.party + 325, 175, 27], { size: 15, color: c.paper, font: book });
  text("arrival-time", template.arrival, [250, template.party + 351, 175, 34], { size: 23, color: c.paper, font: book, bold: true });
  text("banquet-label", "KHAI TIỆC", [473, template.party + 325, 175, 27], { size: 15, color: c.paper, font: book });
  text("banquet-time", template.banquet, [473, template.party + 351, 175, 34], { size: 23, color: c.paper, font: book, bold: true });
  add("Calendar", "wedding-calendar", [290, template.party + 412, 318, 322], {
    date: `${template.year}-${template.month.padStart(2, "0")}-${template.day.padStart(2, "0")}`,
    sundayFirst: false, showTitle: true, lines: false, innerFrame: false, markShape: "Tim đầy", markColor: c.accent,
    markTextColor: c.paper, color: c.ink, weekColor: c.muted, font: book, titleFont: template.titleFont ?? display,
    size: 14, titleSize: 21, titleWeight: "500", titleSpacing: 0.3, weekSize: 11, weekWeight: "400", dayWeight: "400",
    markWeight: "700", markSize: 13, eventStyle: "Liên kết", eventColor: c.paper, weekLine: true,
    eventButton: "Thêm vào lịch", eventTitle: `Đám cưới ${template.couple[0]} & ${template.couple[1]}`,
    eventTime: template.eventTime, eventPlace: template.venue,
  }, { background: c.paper, borderWidth: 0, borderRadius: 12 });
  add("Button", "rsvp-button", [315, template.party + 800, 268, 52], { label: "XÁC NHẬN THAM DỰ", href: "", action: "", payload: {}, fill: c.paper, textColor: c.ink, shape: "pill", size: 16, font: book });

  heading("venue-heading", "TIỆC CƯỚI SẼ TỔ CHỨC TẠI", template.venueY + 18);
  text("venue-name", template.venue, [90, template.venueY + 64, 718, 34], { size: 25, color: c.ink, font: display, bold: true });
  text("venue-address", template.address, [120, template.venueY + 102, 658, 58], { size: 16, color: c.muted, font: book });
  add("Map", "wedding-map", [187, template.venueY + 174, 524, 325], { name: template.venue, address: template.address, showText: false, zoom: 15, heading: "", divider: false, button: "Chỉ đường", color: c.ink, innerFrame: false, padding: 0 }, { borderWidth: 0, borderRadius: 10 });

  heading("dress-heading", "DRESS CODE", template.dress);
  add("DressCode", "dress-code", [278, template.dress + 48, 342, 152], {
    heading: "DRESS CODE", subtitle: "Trang phục dự tiệc", headingColor: c.ink, subtitleColor: c.muted,
    swatchShape: "circle", swatchSize: 42, swatchGap: 16, colors: template.slug === "song-hy-v2-do" ? ["#5a111c", "#9b4a4d", "#d2ad6b", "#f3e9db"] : template.slug === "to-duyen-xanh" ? ["#1f3a25", "#718b5a", "#ddcda7"] : [c.panel, c.accent, "#efe5d6"],
  });

  heading("schedule-heading", "LỊCH TRÌNH NGÀY CƯỚI", template.schedule);
  if (template.slug === "to-duyen-do-dam" || template.slug === "to-duyen-xanh") {
    art("schedule-flower", "flower-decoration.webp", [690, template.schedule + 10, 330, 410], { rotation: 8, phone: [290, template.schedule + 10, 150, 290] });
    art("schedule-line-art", "line-decoration.webp", [738, template.schedule + 32, 175, 420], { rotation: 7, phone: [314, template.schedule + 20, 78, 300] });
  }
  const lineTop = template.schedule + 95;
  const rowGap = template.slug === "song-hy-v2-do" ? 66 : 76;
  shape("schedule-spine", [448, lineTop + 8, 1, rowGap * Math.max(0, template.rows.length - 1)], c.accent);
  template.rows.forEach(([time, label, icon], index) => {
    const y = lineTop + index * rowGap;
    if (icon) art(`schedule-icon-${index + 1}`, icon, [194, y - 8, 46, 46], { phone: [78, y - 4, 30, 30] });
    shape(`schedule-dot-${index + 1}`, [442, y + 4, 13, 13], c.accent, { borderRadius: 20 }, "ellipse");
    text(`schedule-time-${index + 1}`, time, [260, y - 3, 160, 32], { size: 20, color: c.ink, font: book, align: "right" });
    text(`schedule-label-${index + 1}`, label, [482, y - 3, 290, 32], { size: 19, color: c.muted, font: book, align: "left" });
  });

  heading("wishes-heading", "SỔ LƯU BÚT", template.wishes);
  const wishes = newNode(registry, "Form", "guestbook-form", { w: 960, h: height }, { props: {
    ...wishPreset.props, formId: `demo-${slug}-wishes`, heading: "SỔ LƯU BÚT", intro: "Gửi vài dòng chúc mừng. Lời chúc hiện công khai trên thiệp cho mọi người cùng đọc.",
    button: "GỬI LỜI CHÚC", color: c.ink, fieldColor: c.ink, fieldBorderColor: c.accent, font: template.font ?? book,
    padding: 24, compact: true, previewSampleCount: Math.min(10, template.wishSamples),
  } }) as FreeNode;
  const formRect: Rect = [142, template.wishes + 48, 614, 460];
  wishes.position = { mode: "free", x: { anchor: "start", offset: formRect[0] }, y: { anchor: "start", offset: formRect[1] } };
  wishes.size = { w: { kind: "px", v: formRect[2] }, h: { kind: "px", v: formRect[3] } };
  const formPhone = mobileRect(formRect);
  wishes.phone = { x: { anchor: "start", offset: formPhone[0] }, y: { anchor: "start", offset: formPhone[1] }, w: { kind: "px", v: formPhone[2] }, h: { kind: "px", v: formPhone[3] }, rotation: 0 };
  wishes.styles = { ...wishes.styles, background: c.paper, borderRadius: 12, borderWidth: 1, borderColor: c.accent };
  content.push(wishes);

  if (template.ornaments.some(([id]) => id.includes("guestbook"))) {
    const flower = template.ornaments.find(([id]) => id.includes("guestbook"))!;
    art("guestbook-flower", flower[0].replace("-guestbook", "-left"), [4, template.wishes + 268, 180, 260], { rotation: -10, phone: [0, template.wishes + 275, 84, 150] });
  }
  heading("gift-heading", "HỘP QUÀ MỪNG", template.wishes + 556);
  text("gift-handoff-note", "Phần mở hộp và nội dung quà sẽ được hoàn thiện cùng trang bìa.", [130, template.wishes + 605, 638, 46], { size: 16, color: c.muted, font: book });
  text("footer-thanks", "Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!", [80, height - 66, 738, 28], { size: 14, color: c.muted, font: book });
  text("footer-brand", "♡ CardMaking", [300, height - 35, 298, 22], { size: 12, color: c.muted, font: book });

  const column = newNode(registry, "CardPanel", "invitation-column", { w: 960, h: height }) as FreeNode;
  column.position = { mode: "free", x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 0 } };
  column.size = { w: { kind: "px", v: 898 }, h: { kind: "px", v: height } };
  column.phone = { x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 0 }, w: { kind: "px", v: 375 }, h: { kind: "px", v: height }, rotation: 0 };
  column.styles = { ...column.styles, background: c.paper, borderWidth: 1, borderColor: c.accent, borderRadius: 0 };
  column.children = content;
  const blank = emptyPage();
  const data: PageData = {
    ...blank,
    root: nameLayers({ ...blank.root, styles: { background: c.page, minHeight: height, phoneMinHeight: height }, children: [column] }),
    theme: { colors: { primary: c.panel, secondary: c.muted, paper: c.paper }, fonts: { body: template.font ?? book, heading: template.titleFont ?? display } },
    meta: { title: template.title, description: `Bản dựng trang nội dung có thể chỉnh sửa theo ${template.title}.` },
  };
  return { kind: "card", version: 1, startPageId: "invitation", pages: [{ id: "invitation", name: "Thiệp mời", data, interactions: {} }] };
}

const templates: Template[] = [
  {
    slug: "song-hy-v2-do", title: "Song Hỷ V2 - Đỏ · Hồ Trung Hiếu & Đặng Thanh Hà", couple: ["Hồ Trung Hiếu", "Đặng Thanh Hà"], parents: ["Hồ Vân An", "Hồ Mỹ Linh", "Đặng Quốc Đạt", "Đặng Quỳnh Anh"],
    venue: "Sen Vang Palace", address: "Sen Vang Palace, Phú Thọ", date: "2027-01-04", eventTime: "17:30", weekday: "Thứ Hai", day: "04", month: "01", year: "2027", arrival: "16:30", banquet: "18:00",
    colors: { page: "#fff4df", paper: "#fff8e9", ink: "#65141d", muted: "#b28b63", panel: "#a81420", accent: "#d3ad67" }, height: 6519, hero: 1195, album: 1300, party: 1893, venueY: 3157, dress: 3791, schedule: 4035, wishes: 4839,
    photoCount: 9, rows: [["13:30", "Lễ gia tiên tại nhà gái"], ["15:00", "Đón dâu"], ["16:30", "Lễ gia tiên tại nhà trai"], ["17:30", "Đón khách", "ring.webp"], ["18:00", "Khai tiệc", "toast.webp"], ["18:30", "Nghi thức thành hôn", "ring.webp"], ["19:00", "Nâng ly", "toast.webp"], ["20:00", "Cắt bánh", "cake.webp"], ["21:30", "Kết thúc tiệc"]],
    ornaments: [["hero-flower-left", [8, 80, 210, 300]], ["hero-flower-right", [680, 80, 210, 300]]], ornamentFile: "flower1.webp", wishSamples: 8, rounded: 12,
  },
  {
    slug: "to-duyen-do-dam", title: "Tơ Duyên - Đỏ Đậm · Phạm Minh Hoàng & Hồ Mỹ Ngọc", couple: ["Phạm Minh Hoàng", "Hồ Mỹ Ngọc"], parents: ["Phạm Văn Tuấn", "Lê Thị Hương", "Hồ Văn Khoa", "Huỳnh Thị Kim Oanh"],
    venue: "Nhà hàng Tiệc cưới Thảo Nguyên Xanh", address: "27 Trần Phú, phường 3, TP. Đà Lạt, Lâm Đồng", date: "2026-12-19", eventTime: "18:30", weekday: "Thứ Bảy", day: "19", month: "12", year: "2026", arrival: "17:30", banquet: "18:30",
    colors: { page: "#f7eee4", paper: "#fffaf3", ink: "#5c101b", muted: "#a77e72", panel: "#5c101b", accent: "#c7a277" }, height: 6200, hero: 1055, album: 1120, party: 1721, venueY: 2947, dress: 3520, schedule: 3731, wishes: 4526,
    photoCount: 7, rows: [["17:30", "Đón khách"], ["18:30", "Khai tiệc", "icon-ring.webp"], ["18:45", "Rót rượu, cắt bánh", "icon-alcohol.webp"], ["19:00", "Phục vụ món chính", "icon-candle.webp"], ["21:00", "Kết thúc tiệc"]],
    ornaments: [["hero-flower-right", [560, 190, 340, 430], 22], ["schedule-flower-right", [660, 8, 330, 440], 20], ["guestbook-flower-left", [-22, 20, 190, 320], -10]], ornamentFile: "flower-decoration.webp", wishSamples: 9, rounded: 8, font: "'Lora', serif", titleFont: "'EB Garamond', serif",
  },
  {
    slug: "minimalism-nau-dam", title: "Minimalism - Nâu Đậm · Bùi Xuân Trường & Trịnh Diệu Linh", couple: ["Bùi Xuân Trường", "Trịnh Diệu Linh"], parents: ["Bùi Bảo Lâm", "Bùi Bích Thảo", "Trịnh Vân An", "Trịnh Mỹ Linh"],
    venue: "Uri Palace", address: "Uri Palace, Bắc Ninh", date: "2027-11-17", eventTime: "18:30", weekday: "Thứ Tư", day: "17", month: "11", year: "2027", arrival: "17:30", banquet: "18:30",
    colors: { page: "#f7f0e4", paper: "#fffaf5", ink: "#593d2c", muted: "#8a7667", panel: "#765742", accent: "#b89456" }, height: 6000, hero: 1058, album: 1160, party: 1739, venueY: 2707, dress: 3370, schedule: 3538, wishes: 4240,
    photoCount: 10, rows: [["14:30", "Đón khách"], ["16:00", "Lễ gia tiên"], ["17:30", "Khai tiệc"], ["18:30", "Nghi thức cưới"], ["19:00", "Nâng ly"], ["19:30", "Cắt bánh"], ["20:00", "Chúc mừng"], ["21:00", "Giao lưu"], ["22:30", "Kết thúc tiệc"]],
    ornaments: [["hero-flower-left", [12, 80, 220, 340], -8], ["hero-flower-right", [666, 90, 220, 340], 12], ["guestbook-flower-left", [0, 15, 180, 250], -10]],
    ornamentFile: "flower2-decoration.webp", wishSamples: 8, rounded: 12, font: "'Lora', serif", titleFont: "'EB Garamond', serif", backgroundAsset: "paper.webp",
  },
  {
    slug: "cam-thach-vang", title: "Cẩm Thạch - Vàng · Vũ Tuấn Kiệt & Lê Thu Hà", couple: ["Vũ Tuấn Kiệt", "Lê Thu Hà"], parents: ["Vũ Văn Hoàng", "Vũ Kim Phượng", "Lê Quốc Bảo", "Lê Thảo Vy"],
    venue: "Nhà hàng Queen Palace", address: "Nhà hàng Queen Palace, Hưng Yên", date: "2027-02-14", eventTime: "18:00", weekday: "Chủ Nhật", day: "14", month: "02", year: "2027", arrival: "17:00", banquet: "19:30",
    colors: { page: "#ffffff", paper: "#fffdf8", ink: "#1e1e1e", muted: "#756b58", panel: "#eee4d4", accent: "#c5a660" }, height: 6900, hero: 1325, album: 1410, party: 2120, venueY: 3480, dress: 4040, schedule: 4305, wishes: 5150,
    photoCount: 9, startAt: 8, rows: [["14:00", "Lễ gia tiên"], ["15:30", "Đón dâu"], ["17:00", "Lễ gia tiên nhà trai"], ["18:00", "Đón khách"], ["18:30", "Nghi thức thành hôn"], ["19:00", "Rót rượu, cắt bánh"], ["19:30", "Khai tiệc"], ["20:30", "Chúc mừng từng bàn"], ["22:00", "Kết thúc tiệc"]],
    ornaments: [["hero-leaf-left", [0, 160, 240, 440], -8], ["hero-leaf-right", [650, 130, 240, 450], 12], ["guestbook-leaf-left", [0, 20, 185, 290], -10]],
    ornamentFile: "leaf-1.webp", wishSamples: 8, rounded: 0, font: "'EB Garamond', serif", titleFont: "'EB Garamond', serif", backgroundAsset: "marble.webp",
  },
  {
    slug: "to-duyen-xanh", title: "Tơ Duyên - Xanh · Đặng Hoài Nam & Ngô Thanh Trúc", couple: ["Đặng Hoài Nam", "Ngô Thanh Trúc"], parents: ["Đặng Văn Thành", "Trịnh Thị Mai", "Ngô Quang Hải", "Lý Thị Kim Chi"],
    venue: "Nhà hàng Tiệc cưới Thảo Nguyên Xanh", address: "27 Trần Phú, phường 3, TP. Đà Lạt, Lâm Đồng", date: "2026-12-19", eventTime: "18:30", weekday: "Thứ Bảy", day: "19", month: "12", year: "2026", arrival: "17:30", banquet: "18:30",
    colors: { page: "#f8f4ec", paper: "#fffdf7", ink: "#5e813c", muted: "#84936e", panel: "#344b30", accent: "#c1b58b" }, height: 6258, hero: 953, album: 1010, party: 1619, venueY: 2845, dress: 3425, schedule: 3629, wishes: 4304,
    photoCount: 7, rows: [["17:30", "Đón khách"], ["18:30", "Khai tiệc", "icon-home.webp"], ["18:45", "Rót rượu, cắt bánh", "icon-cake.webp"], ["19:00", "Phục vụ món chính", "icon-music.webp"], ["21:00", "Kết thúc tiệc"]],
    ornaments: [["hero-flower-right", [620, 160, 270, 390], 8], ["schedule-flower-right", [680, 10, 250, 390], 8], ["guestbook-flower-left", [0, 20, 165, 270], -10]], ornamentFile: "flower-decoration.webp", wishSamples: 9, rounded: 10, font: "'Lora', serif", titleFont: "'EB Garamond', serif",
  },
];

export const remainingInvitationDocuments = Object.fromEntries(templates.map((template) => [template.slug, build(template)])) as Record<string, CardDocument>;
