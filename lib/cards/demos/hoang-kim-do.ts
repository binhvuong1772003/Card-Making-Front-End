import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-hkd.json";
import { finishTemplate } from "./finish";
import measured from "./hoang-kim-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/hoang-kim-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b37-column", { w: 960, h: height }) as FreeNode;
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

export const hoangKimDoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#e1bc7c", secondary: "#e1bc7c", paper: "#3e0001" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Hoàng Kim - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const hoangKimDoDocument: CardDocument = finishTemplate({
  content: hoangKimDoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b37-147", color: "#7a0003", formId: "demo-hoang-kim-do-rsvp" },
  giftIds: ["b37-134", "b37-135", "b37-136", "b37-137", "b37-138", "b37-139", "b37-140", "b37-141", "b37-142"],
  giftBox: { main: "b37-138", minis: ["b37-134", "b37-135", "b37-136", "b37-137", "b37-139", "b37-140", "b37-141"], phoneDelta: 1363, fixes: {"b37-134": [330, 6538, 34, 41], "b37-135": [518, 6530, 38, 39], "b37-136": [334, 6648, 26, 26], "b37-137": [532, 6642, 24, 24], "b37-138": [365, 6566, 170, 182], "b37-139": [342, 6700, 44, 46], "b37-140": [376, 6710, 26, 26], "b37-141": [468, 6704, 40, 40]} },
  sparkles: { ids: ["b37-122", "b37-123", "b37-124", "b37-125"], src: "/demo/hoang-kim-do/sparkle.svg" },
  form: { id: "b37-150", listMax: 529 },
  popup: {
    height: 410, headerH: 76, headerFill: "#e1bc7c", titleColor: "#3e0001", bodyFill: "#3e0001", ink: "#e1bc7c", accent: "#e1bc7c", saveFill: "#4b0f0b", centers: [152, 424],
    columns: [
      { title: "Chú Rể - Hoài Nam", bank: "Vietcombank", number: "0000000000", holder: "HOAI NAM", qr: "/demo/hoang-kim-do/qr-groom.png" },
      { title: "Cô Dâu - Ngọc Linh", bank: "VietinBank", number: "0000000000", holder: "NGOC LINH", qr: "/demo/hoang-kim-do/qr-bride.png" },
    ],
    titleSize: 26, titleH: 39, labelY: 100, labelSize: 12, qr: { y: 140, card: 160, image: 140 }, bankY: 308, numberY: 325, holderY: 342, lineSize: 10, save: { y: 363, w: 68, h: 23, size: 10 },
  },
});
