import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-vkh.json";
import { finishTemplate } from "./finish";
import measured from "./vuonkinh-hong.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/vuonkinh-hong/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "vkh-column", { w: 960, h: height }) as FreeNode;
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

export const vuonkinhHongContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#cb5d6c", secondary: "#cb5d6c", paper: "#ffffff" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Vườn Kính - Hồng", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const vuonkinhHongDocument: CardDocument = finishTemplate({
  content: vuonkinhHongContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "vkh-116", color: "#cb5d6c", formId: "demo-vuonkinh-hong-rsvp" },
  giftIds: ["vkh-102", "vkh-103", "vkh-104", "vkh-105", "vkh-106", "vkh-107", "vkh-108", "vkh-109", "vkh-110"],
  giftBox: {
    main: "vkh-106", minis: ["vkh-102", "vkh-103", "vkh-104", "vkh-105", "vkh-107", "vkh-108", "vkh-109"], phoneDelta: 683,
    fixes: { "vkh-102": [330, 5854, 34, 36], "vkh-103": [518, 5846, 38, 38], "vkh-104": [334, 5963, 26, 30], "vkh-105": [532, 5958, 24, 25], "vkh-106": [365, 5882, 170, 182], "vkh-107": [342, 6015, 44, 45], "vkh-108": [376, 6026, 26, 26], "vkh-109": [468, 6020, 40, 41] },
  },
  sparkles: { ids: ["vkh-090", "vkh-091", "vkh-092", "vkh-093"], src: "/demo/vuonkinh-hong/sparkle.svg" },
  form: { id: "vkh-119", listMax: 690 },
  popup: {
    height: 413, headerH: 79, headerFill: "#cb5d6c", titleColor: "#ffffff", bodyFill: "#fdf6f8", ink: "#cb5d6c", saveFill: "#f9eaed", centers: [152, 423.5],
    columns: [
      { title: "Cô Dâu - Ngọc Hân", bank: "Techcombank", number: "0000000000", holder: "NGOC HAN", qr: "/demo/vuonkinh-hong/qr-bride.png" },
      { title: "Chú Rể - Đức Anh", bank: "Vietcombank", number: "0000000000", holder: "DUC ANH", qr: "/demo/vuonkinh-hong/qr-groom.png" },
    ],
    titleSize: 26, titleH: 39, labelY: 103, labelSize: 12, qr: { y: 143, card: 160, image: 140 }, bankY: 311, numberY: 328, holderY: 345, lineSize: 10, save: { y: 366, w: 68, h: 23, size: 10 },
  },
});
