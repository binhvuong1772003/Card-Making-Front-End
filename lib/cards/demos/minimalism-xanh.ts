import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-mgr.json";
import { finishTemplate } from "./finish";
import measured from "./minimalism-xanh.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/minimalism-xanh/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "mgreen-column", { w: 960, h: height }) as FreeNode;
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

export const minimalismXanhContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#ffffff", secondary: "#ffffff", paper: "#ffffff" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Minimalism - Xanh", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const minimalismXanhDocument: CardDocument = finishTemplate({
  content: minimalismXanhContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "mgreen-108", color: "#6b7b4f", formId: "demo-minimalism-xanh-rsvp" },
  giftIds: ["mgreen-101", "mgreen-102", "mgreen-103"], envelopes: { front: "mgreen-102" },
  sparkles: { ids: ["mgreen-096", "mgreen-097", "mgreen-098", "mgreen-099"], src: "/demo/minimalism-xanh/sparkle.svg" },
  countdown: { id: "mgreen-countdown", date: "2026-12-19", time: "18:00", color: "#87a172", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 18, bold: false, rect: [342, 3335, 216, 28], phone: [80, 2525, 216, 28] },
  form: { id: "mgreen-111", listMax: 931 },
  popup: {
    height: 442, headerH: 70, headerFill: "#6b7b4f", titleColor: "#ffffff", bodyFill: "#ffffff", ink: "#6b7b4f", saveFill: "#f3f4f0", centers: [288],
    columns: [{ title: "Chú Rể - Đăng Khoa", bank: "Vietcombank", number: "0000000000", holder: "DANG KHOA", qr: "/demo/minimalism-xanh/qr-groom.png" }],
    titleSize: 20, titleH: 30, labelY: 94, labelSize: 14, qr: { y: 126, card: 192, image: 172 }, bankY: 330, numberY: 348, holderY: 366, lineSize: 12, save: { y: 390, w: 84, h: 28, size: 12 },
  },
});
