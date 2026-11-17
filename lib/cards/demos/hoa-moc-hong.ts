import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-hmh.json";
import { finishTemplate } from "./finish";
import measured from "./hoa-moc-hong.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/hoa-moc-hong/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b46-column", { w: 960, h: height }) as FreeNode;
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

export const hoaMocHongContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#9d6d63", secondary: "#ffffff", paper: "#fffaf7" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Hoa Mộc - Hồng", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const hoaMocHongDocument: CardDocument = finishTemplate({
  content: hoaMocHongContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b46-108", color: "#9d6d63", formId: "demo-hoa-moc-hong-rsvp" },
  giftIds: ["b46-095", "b46-096", "b46-097", "b46-098", "b46-099", "b46-100", "b46-101", "b46-102", "b46-103"],
  giftBox: { main: "b46-099", minis: ["b46-095", "b46-096", "b46-097", "b46-098", "b46-100", "b46-101", "b46-102"], phoneDelta: 1014, fixes: {"b46-095": [328, 6485, 34, 35], "b46-096": [519, 6484, 38, 39], "b46-097": [334, 6605, 26, 28], "b46-098": [532, 6599, 24, 26], "b46-099": [357, 6507, 181, 187], "b46-100": [342, 6652, 44, 44], "b46-101": [376, 6667, 26, 27], "b46-102": [468, 6659, 40, 42]} },
  sparkles: { ids: ["b46-083", "b46-084", "b46-085", "b46-086"], src: "/demo/hoa-moc-hong/sparkle.svg" },
  form: { id: "b46-111", listMax: 529 },
  popup: {"height": 410, "headerH": 76, "labelY": 100, "qr": {"y": 140, "card": 160, "image": 140}, "bankY": 308, "numberY": 325, "holderY": 342, "save": {"y": 363, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#9d6d63", "titleColor": "#ffffff", "bodyFill": "#fffaf7", "ink": "#9d6d63", "saveFill": "#f7eeeb", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "columns": [{"title": "Chú Rể - Hoàng Nam", "bank": "Vietcombank", "number": "0000000000", "holder": "HOANG NAM", "qr": "/demo/hoa-moc-hong/qr-groom.png"}, {"title": "Cô Dâu - Thanh Tú", "bank": "VietinBank", "number": "0000000000", "holder": "THANH TU", "qr": "/demo/hoa-moc-hong/qr-bride.png"}]},
});
