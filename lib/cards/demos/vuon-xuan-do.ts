import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-vxd.json";
import { finishTemplate } from "./finish";
import measured from "./vuon-xuan-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/vuon-xuan-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b44-column", { w: 960, h: height }) as FreeNode;
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

export const vuonXuanDoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#d25f65", secondary: "#d25f65", paper: "#ffffff" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Vườn Xuân - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const vuonXuanDoDocument: CardDocument = finishTemplate({
  content: vuonXuanDoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b44-091", color: "#d25f65", formId: "demo-vuon-xuan-do-rsvp" },
  giftIds: ["b44-083", "b44-084", "b44-085"],
  envelopes: { front: "b44-084" },
  sparkles: { ids: ["b44-078", "b44-079", "b44-080", "b44-081"], src: "/demo/vuon-xuan-do/sparkle.svg" },
  form: { id: "b44-094", listMax: 915 },
  popup: {"height": 413, "headerH": 79, "labelY": 103, "qr": {"y": 143, "card": 160, "image": 140}, "bankY": 311, "numberY": 328, "holderY": 345, "save": {"y": 366, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#d25f65", "titleColor": "#ffffff", "bodyFill": "#ffffff", "ink": "#b54b51", "saveFill": "#fbf2f2", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "accent": "#d25f65", "columns": [{"title": "Cô Dâu - Ngọc Linh", "bank": "BIDV", "number": "0000000000", "holder": "NGOC LINH", "qr": "/demo/vuon-xuan-do/qr-bride.png"}, {"title": "Chú Rể - Hoài Nam", "bank": "Vietcombank", "number": "0000000000", "holder": "HOAI NAM", "qr": "/demo/vuon-xuan-do/qr-groom.png"}]},
});
