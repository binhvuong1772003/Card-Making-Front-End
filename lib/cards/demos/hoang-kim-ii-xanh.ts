import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-hk2x.json";
import { finishTemplate } from "./finish";
import measured from "./hoang-kim-ii-xanh.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/hoang-kim-ii-xanh/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b510-column", { w: 960, h: height }) as FreeNode;
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

export const hoangKimIiXanhContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#e5e4d0", secondary: "#e5e4d0", paper: "#10261c" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Hoàng Kim II - Xanh", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const hoangKimIiXanhDocument: CardDocument = finishTemplate({
  content: hoangKimIiXanhContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b510-113", color: "#1a4030", formId: "demo-hoang-kim-ii-xanh-rsvp" },
  giftIds: ["b510-099", "b510-100", "b510-101", "b510-102", "b510-103", "b510-104", "b510-105", "b510-106", "b510-107"],
  giftBox: { main: "b510-103", minis: ["b510-099", "b510-100", "b510-101", "b510-102", "b510-104", "b510-105", "b510-106"], phoneDelta: 1043, fixes: {"b510-099": [330, 6943, 34, 36], "b510-100": [518, 6935, 38, 36], "b510-101": [334, 7053, 26, 26], "b510-102": [532, 7047, 24, 29], "b510-103": [365, 6979, 170, 174], "b510-104": [342, 7105, 44, 53], "b510-105": [376, 7115, 26, 26], "b510-106": [468, 7109, 40, 40]} },
  sparkles: { ids: ["b510-087", "b510-088", "b510-089", "b510-090"], src: "/demo/hoang-kim-ii-xanh/sparkle.svg" },
  form: { id: "b510-116", listMax: 914 },
  popup: {"height": 404, "headerH": 70, "labelY": 94, "qr": {"y": 134, "card": 160, "image": 140}, "bankY": 302, "numberY": 319, "holderY": 336, "save": {"y": 357, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#e5e4d0", "titleColor": "#10261c", "bodyFill": "#10261c", "ink": "#e5e4d0", "saveFill": "#22362b", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "columns": [{"title": "Chú Rể - Tuấn Kiệt", "bank": "Vietcombank", "number": "0000000000", "holder": "TUAN KIET", "qr": "/demo/hoang-kim-ii-xanh/qr-groom.png"}, {"title": "Cô Dâu - Minh Anh", "bank": "Techcombank", "number": "0000000000", "holder": "MINH ANH", "qr": "/demo/hoang-kim-ii-xanh/qr-bride.png"}]},
});
