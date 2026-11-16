import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-vkx.json";
import { finishTemplate } from "./finish";
import measured from "./vuonkinh-xanh.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/vuonkinh-xanh/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "vkx-column", { w: 960, h: height }) as FreeNode;
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

export const vuonkinhXanhContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#47613e", secondary: "#47613e", paper: "#eef3e8" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Vườn Kính - Xanh", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const vuonkinhXanhDocument: CardDocument = finishTemplate({
  content: vuonkinhXanhContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "vkx-108", color: "#47613e", formId: "demo-vuonkinh-xanh-rsvp" },
  giftIds: ["vkx-094", "vkx-095", "vkx-096", "vkx-097", "vkx-098", "vkx-099", "vkx-100", "vkx-101", "vkx-102"],
  giftBox: {
    main: "vkx-098", minis: ["vkx-094", "vkx-095", "vkx-096", "vkx-097", "vkx-099", "vkx-100", "vkx-101"], phoneDelta: 533,
    fixes: { "vkx-094": [330, 5474, 34, 36], "vkx-095": [518, 5466, 38, 40], "vkx-096": [334, 5584, 26, 29], "vkx-097": [532, 5578, 24, 25], "vkx-098": [365, 5511, 170, 173], "vkx-099": [342, 5636, 44, 45], "vkx-100": [376, 5646, 26, 26], "vkx-101": [468, 5640, 40, 41] },
  },
  sparkles: { ids: ["vkx-082", "vkx-083", "vkx-084", "vkx-085"], src: "/demo/vuonkinh-xanh/sparkle.svg" },
  form: { id: "vkx-111", listMax: 497 },
  popup: {
    height: 413, headerH: 79, headerFill: "#47613e", titleColor: "#ffffff", bodyFill: "#fbfdf8", ink: "#47613e", saveFill: "#eaf0e9", centers: [288],
    columns: [{ title: "Chú Rể - Quang Huy", bank: "Vietcombank", number: "0000000000", holder: "QUANG HUY", qr: "/demo/vuonkinh-xanh/qr-groom.png" }],
    titleSize: 26, titleH: 39, labelY: 103, labelSize: 12, qr: { y: 143, card: 160, image: 140 }, bankY: 311, numberY: 328, holderY: 345, lineSize: 10, save: { y: 366, w: 68, h: 23, size: 10 },
  },
});
