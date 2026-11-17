import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-hrt.json";
import { finishTemplate } from "./finish";
import measured from "./hoa-rum-trang.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/hoa-rum-trang/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b42-column", { w: 960, h: height }) as FreeNode;
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

export const hoaRumTrangContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#5c5f3e", secondary: "#5c5f3e", paper: "#f4f3ee" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Hoa Rum - Trắng", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const hoaRumTrangDocument: CardDocument = finishTemplate({
  content: hoaRumTrangContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b42-110", color: "#5c5f3e", formId: "demo-hoa-rum-trang-rsvp" },
  giftIds: ["b42-102", "b42-103", "b42-104"],
  envelopes: { front: "b42-103" },
  sparkles: { ids: ["b42-097", "b42-098", "b42-099", "b42-100"], src: "/demo/hoa-rum-trang/sparkle.svg" },
  countdown: { id: "b42-countdown", date: "2027-05-08", time: "17:30", color: "#a78555", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 24, phoneSize: 18, bold: true, rect: [281.8, 2968.5, 336.4, 36], phone: [61.4, 2152.2, 252.3, 27] },
  form: { id: "b42-113", listMax: 645 },
  popup: {"height": 452, "headerH": 79, "labelY": 103, "qr": {"y": 134, "card": 192, "image": 168}, "bankY": 334, "numberY": 351, "holderY": 368, "save": {"y": 394, "w": 68, "h": 23, "size": 10}, "centers": [288], "headerFill": "#5c5f3e", "titleColor": "#ffffff", "bodyFill": "#f4f3ee", "ink": "#5c5f3e", "saveFill": "#e8e7e0", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "columns": [{"title": "Chú Rể - Hoàng Nam", "bank": "Vietcombank", "number": "0000000000", "holder": "HOANG NAM", "qr": "/demo/hoa-rum-trang/qr-groom.png"}]},
});
