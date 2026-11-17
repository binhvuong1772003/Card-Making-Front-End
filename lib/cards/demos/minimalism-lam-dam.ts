import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-mld.json";
import { finishTemplate } from "./finish";
import measured from "./minimalism-lam-dam.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/minimalism-lam-dam/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b45-column", { w: 960, h: height }) as FreeNode;
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

export const minimalismLamDamContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#00224c", secondary: "#00224c", paper: "#f7f5ee" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Minimalism - Lam Đậm", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const minimalismLamDamDocument: CardDocument = finishTemplate({
  content: minimalismLamDamContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b45-115", color: "#00224c", formId: "demo-minimalism-lam-dam-rsvp" },
  giftIds: ["b45-106", "b45-107", "b45-108"],
  envelopes: { front: "b45-107" },
  sparkles: { ids: ["b45-101", "b45-102", "b45-103", "b45-104"], src: "/demo/minimalism-lam-dam/sparkle.svg" },
  countdown: { id: "b45-countdown", date: "2026-12-19", time: "18:30", color: "#455d79", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 18, bold: false, phoneSize: 15, rect: [346, 3195, 207, 28], phone: [37, 2432, 300, 28] },
  form: { id: "b45-118", listMax: 829 },
  popup: {"height": 404, "headerH": 70, "labelY": 94, "qr": {"y": 134, "card": 160, "image": 140}, "bankY": 302, "numberY": 319, "holderY": 336, "save": {"y": 357, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#00224c", "titleColor": "#ece4d8", "bodyFill": "#f7f5ee", "ink": "#00224c", "saveFill": "#e3e1e0", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "columns": [{"title": "Chú Rể - Tuấn Kiệt", "bank": "Vietcombank", "number": "0000000000", "holder": "TUAN KIET", "qr": "/demo/minimalism-lam-dam/qr-groom.png"}, {"title": "Cô Dâu - Minh Anh", "bank": "Techcombank", "number": "0000000000", "holder": "MINH ANH", "qr": "/demo/minimalism-lam-dam/qr-bride.png"}]},
});
