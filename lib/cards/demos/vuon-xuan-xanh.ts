import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-vxx.json";
import { finishTemplate } from "./finish";
import measured from "./vuon-xuan-xanh.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/vuon-xuan-xanh/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b38-column", { w: 960, h: height }) as FreeNode;
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

export const vuonXuanXanhContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#5d6a57", secondary: "#5d6a57", paper: "#ffffff" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Vườn Xuân - Xanh", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const vuonXuanXanhDocument: CardDocument = finishTemplate({
  content: vuonXuanXanhContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b38-099", color: "#5d6a57", formId: "demo-vuon-xuan-xanh-rsvp" },
  giftIds: ["b38-085", "b38-086", "b38-087", "b38-088", "b38-089", "b38-090", "b38-091", "b38-092", "b38-093"],
  giftBox: { main: "b38-089", minis: ["b38-085", "b38-086", "b38-087", "b38-088", "b38-090", "b38-091", "b38-092"], phoneDelta: 792, fixes: {"b38-085": [330, 6908, 34, 38], "b38-086": [518, 6900, 38, 46], "b38-087": [334, 7018, 26, 28], "b38-088": [532, 7012, 24, 25], "b38-089": [365, 6944, 170, 174], "b38-090": [342, 7070, 44, 44], "b38-091": [376, 7080, 26, 27], "b38-092": [468, 7074, 40, 46]} },
  sparkles: { ids: ["b38-073", "b38-074", "b38-075", "b38-076"], src: "/demo/vuon-xuan-xanh/sparkle.svg" },
  form: { id: "b38-102", listMax: 1132 },
  popup: {
    height: 413, headerH: 79, headerFill: "#5d6a57", titleColor: "#ffffff", bodyFill: "#ffffff", ink: "#5d6a57", saveFill: "#eef0ed", centers: [152, 423.5],
    columns: [
      { title: "Chú Rể - Văn An", bank: "Vietcombank", number: "0000000000", holder: "VAN AN", qr: "/demo/vuon-xuan-xanh/qr-groom.png" },
      { title: "Cô Dâu - Mỹ Ngọc", bank: "Agribank", number: "0000000000", holder: "MY NGOC", qr: "/demo/vuon-xuan-xanh/qr-bride.png" },
    ],
    titleSize: 26, titleH: 39, labelY: 103, labelSize: 12, qr: { y: 143, card: 160, image: 140 }, bankY: 311, numberY: 328, holderY: 345, lineSize: 10, save: { y: 366, w: 68, h: 23, size: 10 },
  },
});
