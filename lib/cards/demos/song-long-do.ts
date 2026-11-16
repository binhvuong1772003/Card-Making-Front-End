import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-sld.json";
import { finishTemplate } from "./finish";
import measured from "./song-long-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/song-long-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "sld-column", { w: 960, h: height }) as FreeNode;
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

export const songLongDoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#882925", secondary: "#ffffff", paper: "#ecdfd6" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Song Long - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const songLongDoDocument: CardDocument = finishTemplate({
  content: songLongDoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "sld-129", color: "#882925", formId: "demo-song-long-do-rsvp" },
  giftIds: ["sld-113", "sld-114", "sld-115", "sld-116", "sld-117", "sld-118", "sld-119", "sld-120", "sld-121"],
  giftBox: {
    main: "sld-117", minis: ["sld-113", "sld-114", "sld-115", "sld-116", "sld-118", "sld-119", "sld-120"], phoneDelta: 924,
    fixes: { "sld-113": [330, 5605, 34, 34], "sld-114": [518, 5597, 38, 39], "sld-115": [334, 5715, 26, 26], "sld-116": [532, 5708, 24, 27], "sld-117": [365, 5640, 170, 175], "sld-118": [342, 5767, 44, 44], "sld-119": [376, 5777, 26, 26], "sld-120": [468, 5770, 40, 42] },
  },
  sparkles: { ids: ["sld-101", "sld-102", "sld-103", "sld-104"], src: "/demo/song-long-do/sparkle.svg" },
  form: { id: "sld-132", listMax: 474 },
  popup: {
    height: 410, headerH: 76, headerFill: "#882925", titleColor: "#ffffff", bodyFill: "#ecdfd6", ink: "#464646", accent: "#882925", saveFill: "#ecdfd6", centers: [152, 424],
    columns: [
      { title: "Chú Rể - Hoàng Nam", bank: "Vietcombank", number: "0000000000", holder: "HOANG NAM", qr: "/demo/song-long-do/qr-groom.png" },
      { title: "Cô Dâu - Thanh Tú", bank: "TPBank", number: "0000000000", holder: "THANH TU", qr: "/demo/song-long-do/qr-bride.png" },
    ],
    titleSize: 24, titleH: 36, labelY: 100, labelSize: 12, qr: { y: 140, card: 160, image: 144 }, bankY: 308, numberY: 325, holderY: 342, lineSize: 10, save: { y: 363, w: 68, h: 23, size: 10 },
  },
});
