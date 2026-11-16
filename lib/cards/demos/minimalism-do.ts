import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-mdo.json";
import { finishTemplate } from "./finish";
import measured from "./minimalism-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/minimalism-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b34-column", { w: 960, h: height }) as FreeNode;
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

export const minimalismDoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#7c151a", secondary: "#7c151a", paper: "#fffaf7" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Minimalism - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const minimalismDoDocument: CardDocument = finishTemplate({
  content: minimalismDoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b34-103", color: "#7c151a", formId: "demo-minimalism-do-rsvp" },
  giftIds: ["b34-089", "b34-090", "b34-091", "b34-092", "b34-093", "b34-094", "b34-095", "b34-096", "b34-097"],
  giftBox: { main: "b34-093", minis: ["b34-089", "b34-090", "b34-091", "b34-092", "b34-094", "b34-095", "b34-096"], phoneDelta: 1335, fixes: {"b34-089": [330, 6530, 34, 33], "b34-090": [518, 6522, 38, 38], "b34-091": [334, 6640, 26, 26], "b34-092": [532, 6634, 24, 25], "b34-093": [365, 6568, 170, 172], "b34-094": [342, 6692, 44, 46], "b34-095": [376, 6702, 26, 26], "b34-096": [468, 6696, 40, 41]} },
  sparkles: { ids: ["b34-077", "b34-078", "b34-079", "b34-080"], src: "/demo/minimalism-do/sparkle.svg" },
  form: { id: "b34-106", listMax: 383 },
  popup: {
    height: 410, headerH: 76, headerFill: "#7c151a", titleColor: "#ffffff", bodyFill: "#fffaf7", ink: "#7c151a", saveFill: "#f6e6e4", centers: [152, 424],
    columns: [
      { title: "Chú Rể - Đức Anh", bank: "Vietcombank", number: "0000000000", holder: "DUC ANH", qr: "/demo/minimalism-do/qr-groom.png" },
      { title: "Cô Dâu - Thanh Mai", bank: "VietinBank", number: "0000000000", holder: "THANH MAI", qr: "/demo/minimalism-do/qr-bride.png" },
    ],
    titleSize: 26, titleH: 39, labelY: 100, labelSize: 12, qr: { y: 140, card: 160, image: 140 }, bankY: 308, numberY: 325, holderY: 342, lineSize: 10, save: { y: 363, w: 68, h: 23, size: 10 },
  },
});
