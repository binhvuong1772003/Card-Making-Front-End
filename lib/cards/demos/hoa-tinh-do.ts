import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-htd.json";
import { finishTemplate } from "./finish";
import measured from "./hoa-tinh-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/hoa-tinh-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b56-column", { w: 960, h: height }) as FreeNode;
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

export const hoaTinhDoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#000000", secondary: "#000000", paper: "#ffffff" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Hoạ Tình - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const hoaTinhDoDocument: CardDocument = finishTemplate({
  content: hoaTinhDoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b56-114", color: "#d70c1b", formId: "demo-hoa-tinh-do-rsvp" },
  giftIds: ["b56-100", "b56-101", "b56-102", "b56-103", "b56-104", "b56-105", "b56-106", "b56-107", "b56-109", "b56-108"],
  giftBox: { main: "b56-104", minis: ["b56-100", "b56-101", "b56-102", "b56-103", "b56-105", "b56-106", "b56-107", "b56-109"], phoneDelta: 1233, fixes: {"b56-100": [330, 6551, 34, 36], "b56-101": [518, 6543, 38, 39], "b56-102": [334, 6661, 26, 27], "b56-103": [532, 6655, 24, 26], "b56-104": [365, 6590, 170, 171], "b56-105": [342, 6713, 44, 46], "b56-106": [376, 6723, 26, 27], "b56-107": [468, 6717, 40, 41], "b56-109": [388, 6888, 124, 46]} },
  sparkles: { ids: ["b56-088", "b56-089", "b56-090", "b56-091"], src: "/demo/hoa-tinh-do/sparkle.svg" },
  form: { id: "b56-117", listMax: 487 },
  popup: {"height": 422, "headerH": 88, "labelY": 112, "qr": {"y": 152, "card": 160, "image": 140}, "bankY": 320, "numberY": 337, "holderY": 354, "save": {"y": 375, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#d70c1b", "titleColor": "#ffffff", "bodyFill": "#ffffff", "ink": "#000000", "saveFill": "#fbe8e9", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "accent": "#d70c1b", "columns": [{"title": "Chú Rể - Hữu Trí", "bank": "Techcombank", "number": "0000000000", "holder": "HUU TRI", "qr": "/demo/hoa-tinh-do/qr-groom.png"}, {"title": "Cô Dâu - Thiên Ý", "bank": "Vietcombank", "number": "0000000000", "holder": "THIEN Y", "qr": "/demo/hoa-tinh-do/qr-bride.png"}]},
});
