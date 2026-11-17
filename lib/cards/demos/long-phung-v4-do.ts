import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-lp4.json";
import { finishTemplate } from "./finish";
import measured from "./long-phung-v4-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/long-phung-v4-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b54-column", { w: 960, h: height }) as FreeNode;
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

export const longPhungV4DoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#ffd390", secondary: "#ffd390", paper: "#8c0000" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Long Phụng V4 - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const longPhungV4DoDocument: CardDocument = finishTemplate({
  content: longPhungV4DoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b54-109", color: "#8c0000", formId: "demo-long-phung-v4-do-rsvp" },
  giftIds: ["b54-100", "b54-101", "b54-102"],
  envelopes: { front: "b54-101" },
  sparkles: { ids: ["b54-095", "b54-096", "b54-097", "b54-098"], src: "/demo/long-phung-v4-do/sparkle.svg" },
  countdown: { id: "b54-countdown", date: "2027-03-13", time: "18:00", color: "#ffe8c4", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 26, phoneSize: 20, bold: true, rect: [273, 3287, 351, 39], phone: [47, 2387, 280, 30] },
  form: { id: "b54-112", listMax: 1019 },
  popup: {"height": 413, "headerH": 79, "labelY": 103, "qr": {"y": 143, "card": 160, "image": 140}, "bankY": 311, "numberY": 328, "holderY": 345, "save": {"y": 366, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#ffd390", "titleColor": "#ffffff", "bodyFill": "#5a0000", "ink": "#ffd390", "saveFill": "#681b0a", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "accent": "#ffd390", "columns": [{"title": "Chú Rể - Quốc Bảo", "bank": "Vietcombank", "number": "0000000000", "holder": "QUOC BAO", "qr": "/demo/long-phung-v4-do/qr-groom.png"}, {"title": "Cô Dâu - Khánh Vy", "bank": "VietinBank", "number": "0000000000", "holder": "KHANH VY", "qr": "/demo/long-phung-v4-do/qr-bride.png"}]},
});
