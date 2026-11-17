import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-bvx.json";
import { finishTemplate } from "./finish";
import measured from "./baroque-v2-xanh-dam.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/baroque-v2-xanh-dam/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b52-column", { w: 960, h: height }) as FreeNode;
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

export const baroqueV2XanhDamContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#ffdfaf", secondary: "#ffdfaf", paper: "#0a1a0b" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Baroque V2 - Xanh Đậm", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const baroqueV2XanhDamDocument: CardDocument = finishTemplate({
  content: baroqueV2XanhDamContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b52-106", color: "#2f5a31", formId: "demo-baroque-v2-xanh-dam-rsvp" },
  giftIds: ["b52-097", "b52-098", "b52-099"],
  envelopes: { front: "b52-098" },
  sparkles: { ids: ["b52-092", "b52-093", "b52-094", "b52-095"], src: "/demo/baroque-v2-xanh-dam/sparkle.svg" },
  countdown: { id: "b52-countdown", date: "2027-01-16", time: "18:00", color: "#ffefd6", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 20, phoneSize: 18, bold: true, rect: [314.8, 3908.1, 270.3, 30], phone: [65.9, 2756.3, 243.3, 27] },
  form: { id: "b52-109", listMax: 848 },
  popup: {"height": 410, "headerH": 76, "labelY": 100, "qr": {"y": 140, "card": 160, "image": 140}, "bankY": 308, "numberY": 325, "holderY": 342, "save": {"y": 363, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#ffdfaf", "titleColor": "#511419", "bodyFill": "#0a1a0b", "ink": "#ffefd6", "saveFill": "#1e2a18", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "accent": "#ffefd6", "columns": [{"title": "Chú Rể - Duy Khang", "bank": "VietinBank", "number": "0000000000", "holder": "DUY KHANG", "qr": "/demo/baroque-v2-xanh-dam/qr-groom.png"}, {"title": "Cô Dâu - Mai Trâm", "bank": "Vietcombank", "number": "0000000000", "holder": "MAI TRAM", "qr": "/demo/baroque-v2-xanh-dam/qr-bride.png"}]},
});
