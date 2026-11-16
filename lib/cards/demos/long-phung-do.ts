import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-lpd.json";
import { finishTemplate } from "./finish";
import measured from "./long-phung-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/long-phung-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "lpd-column", { w: 960, h: height }) as FreeNode;
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

export const longPhungDoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#e9ce9e", secondary: "#e9ce9e", paper: "#680e0e" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Long Phụng - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const longPhungDoDocument: CardDocument = finishTemplate({
  content: longPhungDoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "lpd-123", color: "#e9ce9e", formId: "demo-long-phung-do-rsvp" },
  giftIds: ["lpd-108", "lpd-109", "lpd-110", "lpd-111", "lpd-112", "lpd-113", "lpd-114", "lpd-115", "lpd-116"],
  giftBox: {
    main: "lpd-112", minis: ["lpd-108", "lpd-109", "lpd-110", "lpd-111", "lpd-113", "lpd-114", "lpd-115"], phoneDelta: 1178,
    fixes: { "lpd-108": [330, 6665, 34, 33], "lpd-109": [518, 6657, 38, 39], "lpd-110": [334, 6775, 26, 28], "lpd-111": [532, 6769, 24, 25], "lpd-112": [365, 6694, 170, 181], "lpd-113": [342, 6827, 44, 45], "lpd-114": [376, 6837, 26, 27], "lpd-115": [468, 6831, 40, 41] },
  },
  sparkles: { ids: ["lpd-096", "lpd-097", "lpd-098", "lpd-099"], src: "/demo/long-phung-do/sparkle.svg" },
  form: { id: "lpd-126", listMax: 460 },
  popup: {
    height: 413, headerH: 79, headerFill: "#e9ce9e", titleColor: "#ffffff", bodyFill: "#680e0e", ink: "#e9ce9e", saveFill: "#731e1a", centers: [151.5, 424.5],
    columns: [
      { title: "Chú Rể / 新郎 - Hoài Nam", bank: "Vietcombank", number: "0000000000", holder: "HOAI NAM", qr: "/demo/long-phung-do/qr-groom.png" },
      { title: "Cô Dâu / 新娘 - Ngọc Linh", bank: "VietinBank", number: "0000000000", holder: "NGOC LINH", qr: "/demo/long-phung-do/qr-bride.png" },
    ],
    titleSize: 26, titleH: 39, titleBold: false, labelY: 103, labelSize: 12, qr: { y: 143, card: 160, image: 140 }, bankY: 311, numberY: 328, holderY: 345, lineSize: 10, save: { y: 366, w: 111, h: 23, size: 10 },
  },
});
