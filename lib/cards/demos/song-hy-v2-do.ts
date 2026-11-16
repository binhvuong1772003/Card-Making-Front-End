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

// Sổ lưu bút: dùng khối Form của CardMaking (danh sách lời chúc thật, tối đa 10); bản xem thử hiện 8 lời mẫu của riêng CardMaking.
const wishForm = column.children.find(child => child.id === "shv2-122") as FreeNode | undefined;
if (wishForm) wishForm.props = { ...wishForm.props, previewSampleCount: 8, listMax: 700 };

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
  "shv2-124": { hoverEffect: "Lắc", hoverGroup: "qua", hoverTime: 1.25 },
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
