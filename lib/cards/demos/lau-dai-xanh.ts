import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-ldx.json";
import { finishTemplate } from "./finish";
import measured from "./lau-dai-xanh.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/lau-dai-xanh/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b32-column", { w: 960, h: height }) as FreeNode;
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

export const lauDaiXanhContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#3a5a2c", secondary: "#3a5a2c", paper: "#ffffff" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Lâu Đài - Xanh", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const lauDaiXanhDocument: CardDocument = finishTemplate({
  content: lauDaiXanhContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b32-126", color: "#3a5a2c", formId: "demo-lau-dai-xanh-rsvp" },
  giftIds: ["b32-112", "b32-113", "b32-114", "b32-115", "b32-116", "b32-117", "b32-118", "b32-119", "b32-120"],
  giftBox: { main: "b32-116", minis: ["b32-112", "b32-113", "b32-114", "b32-115", "b32-117", "b32-118", "b32-119"], phoneDelta: 1554, fixes: {"b32-112": [330, 7137, 34, 34], "b32-113": [518, 7129, 38, 41], "b32-114": [334, 7247, 26, 27], "b32-115": [532, 7241, 24, 24], "b32-116": [365, 7162, 170, 185], "b32-117": [342, 7299, 44, 44], "b32-118": [376, 7309, 26, 27], "b32-119": [468, 7303, 40, 41]} },
  sparkles: { ids: ["b32-100", "b32-101", "b32-102", "b32-103"], src: "/demo/lau-dai-xanh/sparkle.svg" },
  form: { id: "b32-129", listMax: 529 },
  popup: {
    height: 410, headerH: 76, headerFill: "#3a5a2c", titleColor: "#ffffff", bodyFill: "#ffffff", ink: "#3a5a2c", saveFill: "#eaeee8", centers: [152, 424],
    columns: [
      { title: "Chú Rể - Hoàng Long", bank: "Vietcombank", number: "0000000000", holder: "HOANG LONG", qr: "/demo/lau-dai-xanh/qr-groom.png" },
      { title: "Cô Dâu - Phương Linh", bank: "BIDV", number: "0000000000", holder: "PHUONG LINH", qr: "/demo/lau-dai-xanh/qr-bride.png" },
    ],
    titleSize: 26, titleH: 39, labelY: 100, labelSize: 12, qr: { y: 140, card: 160, image: 140 }, bankY: 308, numberY: 325, holderY: 342, lineSize: 10, save: { y: 363, w: 68, h: 23, size: 10 },
  },
});
