import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-spx.json";
import { finishTemplate } from "./finish";
import measured from "./song-phung-xanh.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/song-phung-xanh/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b47-column", { w: 960, h: height }) as FreeNode;
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

export const songPhungXanhContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#19472d", secondary: "#19472d", paper: "#fff0e7" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Song Phụng - Xanh", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const songPhungXanhDocument: CardDocument = finishTemplate({
  content: songPhungXanhContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b47-104", color: "#19472d", formId: "demo-song-phung-xanh-rsvp" },
  giftIds: ["b47-090", "b47-091", "b47-092", "b47-093", "b47-094", "b47-095", "b47-096", "b47-097", "b47-098"],
  giftBox: { main: "b47-094", minis: ["b47-090", "b47-091", "b47-092", "b47-093", "b47-095", "b47-096", "b47-097"], phoneDelta: 1029, fixes: {"b47-090": [324, 5750, 34, 36], "b47-091": [522, 5748, 38, 38], "b47-092": [331, 5865, 26, 26], "b47-093": [533, 5872, 24, 26], "b47-094": [361, 5781, 178, 198], "b47-095": [340, 5910, 44, 46], "b47-096": [379, 5924, 26, 26], "b47-097": [472, 5918, 40, 40]} },
  sparkles: { ids: ["b47-078", "b47-079", "b47-080", "b47-081"], src: "/demo/song-phung-xanh/sparkle.svg" },
  form: { id: "b47-107", listMax: 359 },
  popup: {"height": 410, "headerH": 76, "labelY": 100, "qr": {"y": 140, "card": 160, "image": 140}, "bankY": 308, "numberY": 325, "holderY": 342, "save": {"y": 363, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#19472d", "titleColor": "#ffffff", "bodyFill": "#fff0e7", "ink": "#19472d", "saveFill": "#ece2d8", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "columns": [{"title": "Cô Dâu - Ngọc Ánh", "bank": "Vietcombank", "number": "0000000000", "holder": "NGOC ANH", "qr": "/demo/song-phung-xanh/qr-bride.png"}, {"title": "Chú Rể - Thế Bảo", "bank": "VietinBank", "number": "0000000000", "holder": "THE BAO", "qr": "/demo/song-phung-xanh/qr-groom.png"}]},
});
