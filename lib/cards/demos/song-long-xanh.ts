import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-slx.json";
import { finishTemplate } from "./finish";
import measured from "./song-long-xanh.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/song-long-xanh/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b310-column", { w: 960, h: height }) as FreeNode;
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

export const songLongXanhContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#1f3a25", secondary: "#1f3a25", paper: "#ece8d6" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Song Long - Xanh", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const songLongXanhDocument: CardDocument = finishTemplate({
  content: songLongXanhContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b310-152", color: "#1f3a25", formId: "demo-song-long-xanh-rsvp" },
  giftIds: ["b310-134", "b310-135", "b310-136", "b310-137", "b310-138", "b310-139", "b310-140", "b310-141", "b310-142"],
  giftBox: { main: "b310-138", minis: ["b310-134", "b310-135", "b310-136", "b310-137", "b310-139", "b310-140", "b310-141"], phoneDelta: 792, fixes: {"b310-134": [330, 6591, 34, 34], "b310-135": [518, 6583, 38, 41], "b310-136": [334, 6701, 26, 26], "b310-137": [532, 6695, 24, 24], "b310-138": [365, 6626, 170, 175], "b310-139": [342, 6753, 44, 48], "b310-140": [376, 6763, 26, 27], "b310-141": [468, 6757, 40, 41]} },
  sparkles: { ids: ["b310-122", "b310-123", "b310-124", "b310-125"], src: "/demo/song-long-xanh/sparkle.svg" },
  form: { id: "b310-155", listMax: 1091 },
  popup: {
    height: 410, headerH: 76, headerFill: "#1f3a25", titleColor: "#ffffff", bodyFill: "#fffef7", ink: "#2c2416", accent: "#1f3a25", saveFill: "#efece4", centers: [152, 424],
    title: "HỘP QUÀ MỪNG / 선물 상자", saveLabel: "↓ Lưu QR / QR 저장",
    columns: [
      { title: "Chú Rể / 신랑 - Văn Nam", bank: "Vietcombank", number: "0000000000", holder: "VAN NAM", qr: "/demo/song-long-xanh/qr-groom.png" },
      { title: "Cô Dâu / 신부 - Ngọc Nhi", bank: "VietinBank", number: "0000000000", holder: "NGOC NHI", qr: "/demo/song-long-xanh/qr-bride.png" },
    ],
    titleSize: 24, titleH: 39, labelY: 100, labelSize: 12, qr: { y: 140, card: 160, image: 140 }, bankY: 308, numberY: 325, holderY: 342, lineSize: 10, save: { y: 363, w: 88, h: 23, size: 10 },
  },
});
