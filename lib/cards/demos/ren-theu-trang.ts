import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-rtt.json";
import { finishTemplate } from "./finish";
import measured from "./ren-theu-trang.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/ren-theu-trang/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b31-column", { w: 960, h: height }) as FreeNode;
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

export const renTheuTrangContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#000000", secondary: "#000000", paper: "#0d0b0b" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Ren Thêu - Trắng", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const renTheuTrangDocument: CardDocument = finishTemplate({
  content: renTheuTrangContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b31-133", color: "#1a1a1a", formId: "demo-ren-theu-trang-rsvp" },
  giftIds: ["b31-120", "b31-121", "b31-122", "b31-123", "b31-124", "b31-125", "b31-126", "b31-127", "b31-128"],
  giftBox: { main: "b31-124", minis: ["b31-120", "b31-121", "b31-122", "b31-123", "b31-125", "b31-126", "b31-127"], phoneDelta: 2378, fixes: {"b31-120": [352, 7995, 28, 29], "b31-121": [505, 7988, 31, 34], "b31-122": [356, 8084, 21, 21], "b31-123": [517, 8079, 20, 20], "b31-124": [381, 8011, 139, 138], "b31-125": [362, 8127, 36, 38], "b31-126": [390, 8135, 21, 22], "b31-127": [464, 8130, 33, 34]} },
  sparkles: { ids: ["b31-108", "b31-109", "b31-110", "b31-111"], src: "/demo/ren-theu-trang/sparkle.svg" },
  countdown: { id: "b31-countdown", date: "2027-06-12", time: "18:00", color: "#8f7964", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 22, rect: [300, 4311, 297, 33], phone: [38, 2461, 299, 33] },
  form: { id: "b31-136", listMax: 734 },
  popup: {
    height: 451, headerH: 79, headerFill: "#000000", titleColor: "#ffffff", bodyFill: "#ffffff", ink: "#000000", saveFill: "#ebebeb", centers: [288],
    columns: [
      { title: "Chú Rể - Anh Tuấn", bank: "Vietcombank", number: "0000000000", holder: "ANH TUAN", qr: "/demo/ren-theu-trang/qr-groom.png" },
    ],
    titleSize: 26, titleH: 39, labelY: 103, labelSize: 12, qr: { y: 134, card: 192, image: 168 }, bankY: 334, numberY: 351, holderY: 368, lineSize: 10, save: { y: 394, w: 68, h: 23, size: 10 },
  },
});
