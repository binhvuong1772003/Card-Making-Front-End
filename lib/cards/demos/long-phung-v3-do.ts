import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-lp3d.json";
import { finishTemplate } from "./finish";
import measured from "./long-phung-v3-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/long-phung-v3-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "lp3d-column", { w: 960, h: height }) as FreeNode;
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

export const longPhungV3DoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#ffbe89", secondary: "#ffbe89", paper: "#7a0014" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Long Phụng V3 - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const longPhungV3DoDocument: CardDocument = finishTemplate({
  content: longPhungV3DoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "lp3d-112", color: "#ffbe89", formId: "demo-long-phung-v3-do-rsvp" },
  giftIds: ["lp3d-099", "lp3d-100", "lp3d-101", "lp3d-102", "lp3d-103", "lp3d-104", "lp3d-105", "lp3d-106", "lp3d-107"],
  giftBox: {
    main: "lp3d-103", minis: ["lp3d-099", "lp3d-100", "lp3d-101", "lp3d-102", "lp3d-104", "lp3d-105", "lp3d-106"], phoneDelta: 877,
    fixes: { "lp3d-099": [330, 5894, 34, 35], "lp3d-100": [518, 5886, 38, 40], "lp3d-101": [334, 6004, 26, 26], "lp3d-102": [532, 5998, 24, 25], "lp3d-103": [365, 5924, 170, 180], "lp3d-104": [342, 6056, 44, 45], "lp3d-105": [376, 6066, 26, 26], "lp3d-106": [468, 6060, 40, 43] },
  },
  sparkles: { ids: ["lp3d-087", "lp3d-088", "lp3d-089", "lp3d-090"], src: "/demo/long-phung-v3-do/sparkle.svg" },
  form: { id: "lp3d-115", listMax: 508 },
  popup: {
    height: 410, headerH: 76, headerFill: "#ffbe89", titleColor: "#ffffff", bodyFill: "#5a000e", ink: "#ffbe89", saveFill: "#681018", centers: [152, 424],
    columns: [
      { title: "Chú Rể - Tuấn Kiệt", bank: "BIDV", number: "0000000000", holder: "TUAN KIET", qr: "/demo/long-phung-v3-do/qr-groom.png" },
      { title: "Cô Dâu - Thanh Hà", bank: "Vietcombank", number: "0000000000", holder: "THANH HA", qr: "/demo/long-phung-v3-do/qr-bride.png" },
    ],
    titleSize: 24, titleH: 36, labelY: 100, labelSize: 12, qr: { y: 140, card: 160, image: 140 }, bankY: 308, numberY: 325, holderY: 342, lineSize: 10, save: { y: 363, w: 68, h: 23, size: 10 },
  },
});
