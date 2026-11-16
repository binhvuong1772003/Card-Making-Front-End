import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-ctv.json";
import { giftDetailsPage, rsvpPage } from "./gift-popups";
import { addCountdown, applyProps, popupInteractions, sparklesToDecorations } from "./finish";
import measured from "./cam-thach-vang.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/cam-thach-vang/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "ctv-column", { w: 960, h: height }) as FreeNode;
column.position = { mode: "free", x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 0 } };
column.size = { w: { kind: "px", v: width! }, h: { kind: "px", v: height! } };
column.phone = { x: { anchor: "center", offset: 0 }, y: { anchor: "start", offset: 0 }, w: { kind: "px", v: phoneWidth! }, h: { kind: "px", v: phoneHeight! }, rotation: 0 };
column.styles = measured.columnStyles as NodeStyles;
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
  node.phone = { x: { anchor: "start", offset: px! }, y: { anchor: "start", offset: py! }, w: { kind: "px", v: pw! }, h: { kind: "px", v: ph! }, rotation: item.phoneRotation };
  node.rotation = item.rotation;
  // Keep source phone values in measured.json, but never store unsupported
  // per-device fields in a saveable document. Missing controls are in handoff.
  const phoneProps = item.phoneProps as Record<string, JsonValue>;
  node.phoneProps = Object.fromEntries(Object.entries(phoneProps).filter(([key]) => registry[item.type]?.fields[key]?.perDevice === true));
  node.styles = item.styles as NodeStyles;
  return node;
});

export const camThachVangContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#a78555", secondary: "#a78555", paper: "#fffdf8" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Cẩm Thạch – Vàng", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

// Hoàn thiện: bìa, popup, quà mừng và đếm ngược. Ảnh quà đo lại sau khi tải xong (bản đo đầu có cao 0px và y của ảnh chính là đáy).
const size = { w: width!, h: height! };
const invitation = camThachVangContentDocument.pages[0]!;
// x, y, rộng, cao (layout, chưa xoay). Điện thoại thấp hơn máy tính 1808px.
const GIFT_FIX: Record<string, [number, number, number, number]> = {
  "ctv-113": [330, 6553, 34, 34], "ctv-114": [518, 6544, 38, 40], "ctv-115": [334, 6662, 26, 27], "ctv-116": [532, 6656, 24, 25],
  "ctv-117": [365, 6589, 170, 174], "ctv-118": [342, 6715, 44, 47], "ctv-119": [376, 6724, 26, 28], "ctv-120": [468, 6718, 40, 42],
};
// Dòng cảm ơn cuối trang: gốc một dòng; phông thay thế rộng hơn nên mở rộng hộp.
const thanks = column.children.find(child => child.id === "ctv-122") as FreeNode | undefined;
if (thanks) { thanks.position = { mode: "free", x: { anchor: "start", offset: 170 }, y: thanks.position!.y }; thanks.size = { w: { kind: "px", v: 560 }, h: thanks.size!.h }; }
for (const child of column.children as FreeNode[]) {
  const fix = GIFT_FIX[child.id];
  if (!fix) continue;
  child.position = { mode: "free", x: { anchor: "start", offset: fix[0] }, y: { anchor: "start", offset: fix[1] } };
  child.size = { w: { kind: "px", v: fix[2] }, h: { kind: "px", v: fix[3] } };
  const phoneX = (child.phone!.x as { offset: number }).offset;
  child.phone = { x: { anchor: "start", offset: phoneX }, y: { anchor: "start", offset: fix[1] - 1808 }, w: { kind: "px", v: fix[2] }, h: { kind: "px", v: fix[3] }, rotation: child.phone!.rotation };
}
sparklesToDecorations(column, ["ctv-101", "ctv-102", "ctv-103", "ctv-104"], "/demo/cam-thach-vang/sparkle.svg", size);
addCountdown(column, size, { id: "ctv-countdown", date: "2027-02-14", time: "18:00", color: "#1e1e1e", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 26, rect: [287, 3274, 325, 39], phone: [37, 1965, 300, 39] });
const fly = (rise: number, sway: number, time: number, delay: number) => ({ hoverEffect: "Bay lên rồi hiện lại", hoverGroup: "qua", hoverRise: rise, hoverSway: sway, hoverTime: time, hoverDelay: delay });
applyProps(invitation.data.root, {
  "ctv-117": { hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 },
  "ctv-113": fly(55, -14, 1.6, 0), "ctv-114": fly(60, 14, 1.8, 0.15), "ctv-115": fly(65, -10, 1.4, 0.3), "ctv-116": fly(70, 12, 1.7, 0.45),
  "ctv-118": fly(80, -8, 1.9, 0.1), "ctv-119": fly(75, 10, 1.3, 0.35), "ctv-120": fly(72, 14, 1.7, 0.2),
  "ctv-129": { listMax: 589 },
});
const GIFT_IDS = ["ctv-113", "ctv-114", "ctv-115", "ctv-116", "ctv-117", "ctv-118", "ctv-119", "ctv-120", "ctv-121"];

export const camThachVangDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "cover",
  pages: [
    coverJson as unknown as CardPage,
    { ...invitation, interactions: popupInteractions("ctv-126", GIFT_IDS) },
    giftDetailsPage({
      height: 451, headerH: 79, headerFill: "#a78555", titleColor: "#ffffff", bodyFill: "#ffffff", ink: "#1e1e1e", accent: "#a78555", saveFill: "#f8f5f1", centers: [288],
      columns: [{ title: "Chú Rể - Tuấn Kiệt", bank: "Vietcombank", number: "0000000000", holder: "TUAN KIET", qr: "/demo/cam-thach-vang/qr-groom.png" }],
      titleSize: 26, titleH: 39, titleBold: false, labelY: 103, labelSize: 14, qr: { y: 135, card: 192, image: 172 }, bankY: 339, numberY: 357, holderY: 375, lineSize: 12, save: { y: 399, w: 84, h: 28, size: 12 },
    }),
    rsvpPage("#a78555", "demo-cam-thach-vang-rsvp"),
  ],
};
