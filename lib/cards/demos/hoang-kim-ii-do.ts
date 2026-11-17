import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-hk2.json";
import { finishTemplate } from "./finish";
import measured from "./hoang-kim-ii-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/hoang-kim-ii-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b59-column", { w: 960, h: height }) as FreeNode;
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

export const hoangKimIiDoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#e5e4d0", secondary: "#e5e4d0", paper: "#3e0001" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Hoàng Kim II - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const hoangKimIiDoDocument: CardDocument = finishTemplate({
  content: hoangKimIiDoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b59-116", color: "#8c0000", formId: "demo-hoang-kim-ii-do-rsvp" },
  giftIds: ["b59-107", "b59-108", "b59-109"],
  envelopes: { front: "b59-108" },
  sparkles: { ids: ["b59-102", "b59-103", "b59-104", "b59-105"], src: "/demo/hoang-kim-ii-do/sparkle.svg" },
  countdown: { id: "b59-countdown", date: "2027-10-16", time: "18:00", color: "#e5e4d0", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 20, phoneSize: 16, bold: true, rect: [309.8, 3650.7, 280.3, 30], phone: [75.4, 2670.8, 224.2, 24] },
  form: { id: "b59-119", listMax: 698 },
  popup: {"height": 442, "headerH": 70, "labelY": 94, "qr": {"y": 125, "card": 192, "image": 168}, "bankY": 325, "numberY": 342, "holderY": 359, "save": {"y": 385, "w": 68, "h": 23, "size": 10}, "centers": [288], "headerFill": "#e5e4d0", "titleColor": "#3e0001", "bodyFill": "#3e0001", "ink": "#e5e4d0", "saveFill": "#4c1312", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "columns": [{"title": "Chú Rể - Duy Khang", "bank": "Vietcombank", "number": "0000000000", "holder": "DUY KHANG", "qr": "/demo/hoang-kim-ii-do/qr-groom.png"}]},
});
