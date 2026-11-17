import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-bll.json";
import { finishTemplate } from "./finish";
import measured from "./baroque-lam.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/baroque-lam/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b53-column", { w: 960, h: height }) as FreeNode;
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

export const baroqueLamContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#5e7e9b", secondary: "#72614b", paper: "#f9f1e6" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Baroque - Lam", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const baroqueLamDocument: CardDocument = finishTemplate({
  content: baroqueLamContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b53-127", color: "#5e7e9b", formId: "demo-baroque-lam-rsvp" },
  giftIds: ["b53-112", "b53-113", "b53-114", "b53-115", "b53-116", "b53-117", "b53-118", "b53-119", "b53-120"],
  giftBox: { main: "b53-116", minis: ["b53-112", "b53-113", "b53-114", "b53-115", "b53-117", "b53-118", "b53-119"], phoneDelta: 2068, fixes: {"b53-112": [330, 7692, 34, 36], "b53-113": [518, 7684, 38, 40], "b53-114": [334, 7802, 26, 26], "b53-115": [532, 7796, 24, 26], "b53-116": [365, 7731, 170, 171], "b53-117": [342, 7854, 44, 45], "b53-118": [376, 7864, 26, 26], "b53-119": [468, 7858, 40, 41]} },
  sparkles: { ids: ["b53-100", "b53-101", "b53-102", "b53-103"], src: "/demo/baroque-lam/sparkle.svg" },
  countdown: { id: "b53-countdown", date: "2027-07-19", time: "18:30", color: "#5e7e9b", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 18, bold: false, phoneSize: 13, rect: [333.2, 3659.6, 233.6, 28], phone: [96.6, 2110.5, 181.7, 20] },
  form: { id: "b53-130", listMax: 811 },
  popup: {"height": 451, "headerH": 79, "labelY": 103, "qr": {"y": 134, "card": 192, "image": 168}, "bankY": 334, "numberY": 351, "holderY": 368, "save": {"y": 394, "w": 68, "h": 23, "size": 10}, "centers": [288], "headerFill": "#5e7e9b", "titleColor": "#ffffff", "bodyFill": "#f9f1e6", "ink": "#72614b", "saveFill": "#ece8e0", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "accent": "#5e7e9b", "columns": [{"title": "Chú Rể - Quốc Đạt", "bank": "Vietcombank", "number": "0000000000", "holder": "QUOC DAT", "qr": "/demo/baroque-lam/qr-groom.png"}]},
});
