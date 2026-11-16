import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import { giftDetailsPage as giftPopup, rsvpPage as rsvpPopup } from "./gift-popups";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-shv2.json";
import measured from "./song-hy-v2-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/song-hy-v2-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "shv2-column", { w: 960, h: height }) as FreeNode;
column.position = { mode: "free", x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 0 } };
column.size = { w: { kind: "px", v: width! }, h: { kind: "px", v: height! } };
column.phone = { x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 0 }, w: { kind: "px", v: phoneWidth! }, h: { kind: "px", v: phoneHeight! }, rotation: 0 };
column.styles = { background: "#8c0000", borderWidth: 0, borderRadius: 0 };
column.props.layerName = "Cột thiệp – cắt artwork ở mép";
column.children = measured.nodes.map(item => {
  const props = item.props as unknown as Record<string, JsonValue>;
  const node = newNode(registry, item.type, item.id, { w: width!, h: height! }, {
    props: { ...(item.type === "Form" ? wishes : {}), ...props, ...(registry[item.type]?.fields.layerName ? { layerName: item.name } : {}) },
  }) as FreeNode;
  const [x, y, w, h] = item.rect;
  const [px, py, pw, ph] = item.phone;
  node.position = { mode: "free", x: { anchor: "start", offset: x! }, y: { anchor: "start", offset: y! } };
  node.size = { w: { kind: "px", v: w! }, h: { kind: "px", v: h! } };
  node.phone = { x: { anchor: "start", offset: px! }, y: { anchor: "start", offset: py! }, w: { kind: "px", v: pw! }, h: { kind: "px", v: ph! }, rotation: item.rotation };
  node.rotation = item.rotation;
  // Keep source phone values in measured.json, but never store unsupported
  // per-device fields in a saveable document. Missing controls are in handoff.
  const phoneProps = item.phoneProps as Record<string, JsonValue>;
  node.phoneProps = Object.fromEntries(Object.entries(phoneProps).filter(([key]) => registry[item.type]?.fields[key]?.perDevice === true));
  node.styles = item.styles as NodeStyles;
  return node;
});

// Đếm ngược: dòng "N ngày G giờ P phút S giây" dưới tiêu đề (gốc: Baskerville 27px đậm #2f0000, rộng 351, cách tiêu đề 49px). Mốc 04/01/2027 17:30.
{
  const heading = column.children.find(child => child.id === "shv2-062") as FreeNode;
  const countdown = newNode(registry, "Countdown", "shv2-countdown", { w: width!, h: height! }, { props: { date: "2027-01-04", time: "17:30", color: "#2f0000", font: "Baskerville, 'Times New Roman', serif", size: 27, bold: true, align: "center", layerName: "Đếm ngược" } }) as FreeNode;
  countdown.position = { mode: "free", x: { anchor: "start", offset: 274.5 }, y: { anchor: "start", offset: 3389 } };
  countdown.size = { w: { kind: "px", v: 351 }, h: { kind: "px", v: 41 } };
  countdown.phone = { x: { anchor: "start", offset: 20 }, y: { anchor: "start", offset: (heading.phone!.y as { offset: number }).offset + 49 }, w: { kind: "px", v: 335 }, h: { kind: "px", v: 41 }, rotation: 0 };
  column.children.push(countdown);
}

// Sổ lưu bút: gốc có 8 lời chúc xếp dưới ô nhập (thẻ 492x85, bước 96,7px; điện thoại cao hơn vì lời xuống dòng).
// Form chỉ giữ phần nhập; 8 thẻ dưới là dữ liệu mẫu bằng Shape/Text để người dùng xoá hoặc sửa, không phải danh sách thật.
const WISHES: [string, string, string][] = [
  ["Anh Ba ngoài Hà Nội", "2:00:00 24/7/2027", "Chúc hai bạn giữ được sự kiên nhẫn dành cho nhau."],
  ["Gia đình thông gia", "3:00:00 25/7/2027", "Mừng hạnh phúc trăm năm, vạn sự như ý."],
  ["Thầy cô trường cũ", "4:00:00 26/7/2027", "Nhà mới, chuyện mới, mong toàn chuyện lành."],
  ["Bạn bè đại học", "5:00:00 27/7/2027", "Chúc hai em luôn nhìn nhau như hôm nay."],
  ["Gia đình bác Hoàng", "6:00:00 28/7/2027", "Cảm ơn bữa tiệc thật chu đáo. Chúc mừng hai bạn."],
  ["Gia đình cô Lan", "7:00:00 29/7/2027", "Chúc hai bạn mỗi năm lại thương nhau hơn một chút."],
  ["Cô Bảy", "8:00:00 30/7/2027", "Mong tổ ấm của hai em luôn ngập nắng."],
  ["Chú Tư", "9:00:00 31/7/2027", "Chúc mừng hai bạn, xứng đôi vừa lứa."],
];
const wishForm = column.children.find(child => child.id === "shv2-122") as FreeNode | undefined;
if (wishForm) wishForm.props = { ...wishForm.props, previewSampleCount: 0 };
const sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const sample = (type: string, id: string, rect: number[], phone: number[], props: Record<string, JsonValue>, styles: NodeStyles = {}) => {
  const node = newNode(registry, type, id, { w: width!, h: height! }, { props: { ...props, ...(registry[type]?.fields.layerName ? { layerName: id } : {}) } }) as FreeNode;
  node.position = { mode: "free", x: { anchor: "start", offset: rect[0]! }, y: { anchor: "start", offset: rect[1]! } };
  node.size = { w: { kind: "px", v: rect[2]! }, h: { kind: "px", v: rect[3]! } };
  node.phone = { x: { anchor: "start", offset: phone[0]! }, y: { anchor: "start", offset: phone[1]! }, w: { kind: "px", v: phone[2]! }, h: { kind: "px", v: phone[3]! }, rotation: 0 };
  node.styles = { ...node.styles, ...styles };
  return node;
};
WISHES.forEach(([name, time, text], i) => {
  const y = 6227 + i * 96.7;
  const py = 4828 + i * 105.6;
  const label = (suffix: string, value: string, rect: number[], phone: number[], size: number, weight: string, color: string, align: string) =>
    sample("Text", `shv2-wish-${i + 1}-${suffix}`, rect, phone, { text: value, size, color, font: sans, align, bold: false, italic: false, underline: false, fontWeight: weight });
  column.children.push(
    sample("Shape", `shv2-wish-${i + 1}-card`, [200, y, 492, 85], [37, py, 301, 94], { shape: "rectangle", fill: "#951414", motionTarget: "" }, { borderWidth: 1, borderColor: "#b25a42", borderRadius: 12 }),
    label("name", name, [217, y + 17, 300, 20], [54, py + 14, 170, 20], 14, "600", "#ffe8a4", "left"),
    label("time", time, [535, y + 17, 140, 16], [201, py + 16, 120, 16], 12, "300", "#e6c795", "right"),
    label("text", text, [217, y + 45, 458, 23], [54, py + 42, 267, 46], 14, "300", "#ffe8a4", "left"),
  );
});

export const songHyV2DoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#920002", secondary: "#ffe8a4", paper: "#fff9e6" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Song Hỷ V2 – Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const giftDetailsPage = () => giftPopup({
  height: 453, headerH: 81, headerFill: "#ffe8a4", titleColor: "#ffffff", bodyFill: "#5a0000", ink: "#ffe8a4", saveFill: "#67130d", centers: [288],
  columns: [{ title: "Chú Rể - Trung Hiếu", bank: "Vietcombank", number: "0000000000", holder: "TRUNG HIẾU", qr: "/demo/song-hy-v2-do/qr-groom.png" }],
  labelY: 105, labelSize: 14, qr: { y: 137, card: 192, image: 172 }, bankY: 341, numberY: 359, holderY: 377, lineSize: 12, save: { y: 401, w: 84, h: 28, size: 12 },
});
const rsvpPage = () => rsvpPopup("#920002", "demo-song-hy-v2-do-rsvp");

// Quà mừng: bao trước nảy lên khi rê chuột, ba ngôi sao chớp lệch pha; bấm bao hoặc chữ "Nhấn để mở" mở popup.
const GIFT_IDS = ["shv2-123", "shv2-124", "shv2-125", "shv2-126", "shv2-127", "shv2-128", "shv2-129"];
// Bốn ngôi sao là Decoration (chỉ Decoration có hiệu ứng nhàn rỗi), mỗi sao chớp lệch pha; hình sao thay cho ký tự ✦ của bản đo.
const SPARKLES = ["shv2-125", "shv2-126", "shv2-127", "shv2-128"];
column.children = column.children.map(child => {
  const index = SPARKLES.indexOf(child.id);
  if (index < 0) return child;
  const source = child as FreeNode;
  const star = newNode(registry, "Decoration", child.id, { w: width!, h: height! }, { props: { src: "/demo/song-hy-v2-do/sparkle.svg", alt: "", fit: "contain", motion: false, motionTarget: "", idleEffect: "Chớp sáng", idleDelay: [0, 0.6, 1.2, 1.7][index]! } }) as FreeNode;
  star.position = source.position;
  star.size = source.size;
  star.phone = source.phone;
  star.rotation = source.rotation;
  return star;
});
const invitationPage = songHyV2DoContentDocument.pages[0]!;
const effects: Record<string, Record<string, JsonValue>> = {
  "shv2-124": { hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 },
  "shv2-123": { hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 },
};
const visit = (node: { id: string; props: Record<string, JsonValue>; children?: unknown[] }) => {
  if (effects[node.id]) node.props = { ...node.props, ...effects[node.id]! };
  (node.children as typeof node[] | undefined)?.forEach(visit);
};
visit(invitationPage.data.root as never);

export const songHyV2DoDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "cover",
  pages: [
    coverJson as unknown as CardPage,
    { ...invitationPage, interactions: {
      "shv2-117": { type: "open-popup", targetPageId: "rsvp", transition: "fade", durationMs: 200 },
      ...Object.fromEntries(GIFT_IDS.map((id) => [id, { type: "open-popup", targetPageId: "gift-details", transition: "fade", durationMs: 250 } as const])),
    } },
    giftDetailsPage(),
    rsvpPage(),
  ],
};
