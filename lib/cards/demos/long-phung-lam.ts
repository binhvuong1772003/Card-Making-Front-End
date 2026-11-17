import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-lpl.json";
import { finishTemplate } from "./finish";
import measured from "./long-phung-lam.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/long-phung-lam/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b55-column", { w: 960, h: height }) as FreeNode;
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

export const longPhungLamContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#e9ce9e", secondary: "#e9ce9e", paper: "#0a202f" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Long Phụng - Lam", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const longPhungLamDocument: CardDocument = finishTemplate({
  content: longPhungLamContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b55-099", color: "#0a202f", formId: "demo-long-phung-lam-rsvp" },
  giftIds: ["b55-086", "b55-087", "b55-088", "b55-089", "b55-090", "b55-091", "b55-092", "b55-093", "b55-094"],
  giftBox: { main: "b55-090", minis: ["b55-086", "b55-087", "b55-088", "b55-089", "b55-091", "b55-092", "b55-093"], phoneDelta: 1167, fixes: {"b55-086": [330, 6210, 34, 34], "b55-087": [518, 6202, 38, 40], "b55-088": [334, 6320, 26, 27], "b55-089": [532, 6314, 24, 24], "b55-090": [365, 6239, 170, 181], "b55-091": [342, 6372, 44, 44], "b55-092": [376, 6382, 26, 26], "b55-093": [468, 6376, 40, 49]} },
  sparkles: { ids: ["b55-074", "b55-075", "b55-076", "b55-077"], src: "/demo/long-phung-lam/sparkle.svg" },
  form: { id: "b55-102", listMax: 460 },
  popup: {"height": 413, "headerH": 79, "labelY": 103, "qr": {"y": 143, "card": 160, "image": 140}, "bankY": 311, "numberY": 328, "holderY": 345, "save": {"y": 366, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#e9ce9e", "titleColor": "#ffffff", "bodyFill": "#0a202f", "ink": "#e9ce9e", "saveFill": "#1c2e38", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "accent": "#e9ce9e", "columns": [{"title": "Chú Rể - Hoài Nam", "bank": "Vietcombank", "number": "0000000000", "holder": "HOAI NAM", "qr": "/demo/long-phung-lam/qr-groom.png"}, {"title": "Cô Dâu - Ngọc Linh", "bank": "BIDV", "number": "0000000000", "holder": "NGOC LINH", "qr": "/demo/long-phung-lam/qr-bride.png"}]},
});
