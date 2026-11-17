import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-vxl.json";
import { finishTemplate } from "./finish";
import measured from "./vuon-xuan-lam.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/vuon-xuan-lam/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b57-column", { w: 960, h: height }) as FreeNode;
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

export const vuonXuanLamContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#486c7d", secondary: "#486c7d", paper: "#ffffff" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Vườn Xuân - Lam", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const vuonXuanLamDocument: CardDocument = finishTemplate({
  content: vuonXuanLamContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b57-120", color: "#486c7d", formId: "demo-vuon-xuan-lam-rsvp" },
  giftIds: ["b57-104", "b57-105", "b57-106", "b57-107", "b57-108", "b57-109", "b57-110", "b57-111", "b57-112"],
  giftBox: { main: "b57-108", minis: ["b57-104", "b57-105", "b57-106", "b57-107", "b57-109", "b57-110", "b57-111"], phoneDelta: 812, fixes: {"b57-104": [330, 7091, 34, 35], "b57-105": [518, 7083, 38, 41], "b57-106": [334, 7201, 26, 27], "b57-107": [532, 7195, 24, 25], "b57-108": [365, 7121, 170, 180], "b57-109": [342, 7253, 44, 45], "b57-110": [376, 7263, 26, 27], "b57-111": [468, 7257, 40, 40]} },
  sparkles: { ids: ["b57-092", "b57-093", "b57-094", "b57-095"], src: "/demo/vuon-xuan-lam/sparkle.svg" },
  form: { id: "b57-123", listMax: 842 },
  popup: {"height": 413, "headerH": 79, "labelY": 103, "qr": {"y": 143, "card": 160, "image": 140}, "bankY": 311, "numberY": 328, "holderY": 345, "save": {"y": 366, "w": 88, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#486c7d", "titleColor": "#ffffff", "bodyFill": "#ffffff", "ink": "#3a5666", "saveFill": "#f0f3f4", "labelSize": 12, "lineSize": 10, "titleSize": 24, "titleH": 39, "accent": "#486c7d", "title": "HỘP QUÀ MỪNG / 선물 상자", "saveLabel": "↓ Lưu QR / QR 저장", "columns": [{"title": "Cô Dâu / 신부 - Ngọc Linh", "bank": "BIDV", "number": "0000000000", "holder": "NGOC LINH", "qr": "/demo/vuon-xuan-lam/qr-bride.png"}, {"title": "Chú Rể / 신랑 - Hoài Nam", "bank": "Vietcombank", "number": "0000000000", "holder": "HOAI NAM", "qr": "/demo/vuon-xuan-lam/qr-groom.png"}]},
});
