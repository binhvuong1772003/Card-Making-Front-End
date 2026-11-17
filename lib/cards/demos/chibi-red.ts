import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-chr.json";
import { finishTemplate } from "./finish";
import measured from "./chibi-red.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/chibi-red/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b41-column", { w: 960, h: height }) as FreeNode;
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

export const chibiRedContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#4c2d1f", secondary: "#4c2d1f", paper: "#fef0e0" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Chibi - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const chibiRedDocument: CardDocument = finishTemplate({
  content: chibiRedContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b41-138", color: "#9e2a2b", formId: "demo-chibi-red-rsvp" },
  giftIds: ["b41-123", "b41-124", "b41-125", "b41-126", "b41-127", "b41-128", "b41-129", "b41-130", "b41-131"],
  giftBox: { main: "b41-127", minis: ["b41-123", "b41-124", "b41-125", "b41-126", "b41-128", "b41-129", "b41-130"], phoneDelta: 1606, fixes: {"b41-123": [316, 6936, 34, 35], "b41-124": [525, 6950, 38, 38], "b41-125": [327, 7054, 26, 27], "b41-126": [537, 7061, 24, 25], "b41-127": [361, 7012, 178, 181], "b41-128": [339, 7110, 44, 47], "b41-129": [383, 7105, 26, 27], "b41-130": [475, 7116, 40, 41]} },
  sparkles: { ids: ["b41-111", "b41-112", "b41-113", "b41-114"], src: "/demo/chibi-red/sparkle.svg" },
  form: { id: "b41-141", listMax: 456 },
  popup: {"height": 427, "headerH": 94, "labelY": 118, "qr": {"y": 158, "card": 160, "image": 140}, "bankY": 326, "numberY": 343, "holderY": 360, "save": {"y": 381, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#4c2d1f", "titleColor": "#ffffff", "bodyFill": "#fef0e0", "ink": "#4c2d1f", "saveFill": "#f0dfd0", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "columns": [{"title": "Chú Rể / 新郎 - Thế Bảo", "bank": "Vietcombank", "number": "0000000000", "holder": "THE BAO", "qr": "/demo/chibi-red/qr-groom.png"}, {"title": "Cô Dâu / 新娘 - Ngọc Ánh", "bank": "VietinBank", "number": "0000000000", "holder": "NGOC ANH", "qr": "/demo/chibi-red/qr-bride.png"}]},
});
