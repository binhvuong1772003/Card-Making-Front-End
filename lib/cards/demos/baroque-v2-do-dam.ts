import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-bvd.json";
import { finishTemplate } from "./finish";
import measured from "./baroque-v2-do-dam.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/baroque-v2-do-dam/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b39-column", { w: 960, h: height }) as FreeNode;
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

export const baroqueV2DoDamContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#ffdfaf", secondary: "#ffdfaf", paper: "#2b0303" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Baroque V2 - Đỏ Đậm", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const baroqueV2DoDamDocument: CardDocument = finishTemplate({
  content: baroqueV2DoDamContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b39-105", color: "#8c1d28", formId: "demo-baroque-v2-do-dam-rsvp" },
  giftIds: ["b39-097", "b39-098", "b39-099"],
  envelopes: { front: "b39-098" },
  sparkles: { ids: ["b39-092", "b39-093", "b39-094", "b39-095"], src: "/demo/baroque-v2-do-dam/sparkle.svg" },
  countdown: { id: "b39-countdown", date: "2026-12-19", time: "18:00", color: "#ffefd6", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 20, phoneSize: 18, bold: true, rect: [324, 3743, 250, 30], phone: [66, 2707, 243, 27] },
  form: { id: "b39-108", listMax: 848 },
  popup: {
    height: 410, headerH: 76, headerFill: "#ffdfaf", titleColor: "#511419", bodyFill: "#2b0303", ink: "#ffefd6", accent: "#ffefd6", saveFill: "#3c1511", centers: [152, 424],
    columns: [
      { title: "Chú Rể - Gia Bảo", bank: "Vietcombank", number: "0000000000", holder: "GIA BAO", qr: "/demo/baroque-v2-do-dam/qr-groom.png" },
      { title: "Cô Dâu - Ngọc Diệp", bank: "MB Bank", number: "0000000000", holder: "NGOC DIEP", qr: "/demo/baroque-v2-do-dam/qr-bride.png" },
    ],
    titleSize: 26, titleH: 39, labelY: 100, labelSize: 12, qr: { y: 140, card: 160, image: 140 }, bankY: 308, numberY: 325, holderY: 342, lineSize: 10, save: { y: 363, w: 68, h: 23, size: 10 },
  },
});
