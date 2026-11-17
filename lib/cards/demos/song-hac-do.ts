import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-shd.json";
import { finishTemplate } from "./finish";
import measured from "./song-hac-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/song-hac-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b33-column", { w: 960, h: height }) as FreeNode;
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

export const songHacDoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#920002", secondary: "#920002", paper: "#920002" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Song Hạc - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const songHacDoDocument: CardDocument = finishTemplate({
  content: songHacDoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b33-110", color: "#920002", formId: "demo-song-hac-do-rsvp" },
  giftIds: ["b33-102", "b33-103", "b33-104"],
  envelopes: { front: "b33-103" },
  sparkles: { ids: ["b33-097", "b33-098", "b33-099", "b33-100"], src: "/demo/song-hac-do/sparkle.svg" },
  countdown: { id: "b33-countdown", date: "2027-04-10", time: "18:30", color: "#001232", font: "Baskerville, 'Times New Roman', serif", align: "center", phoneSize: 20, rect: [260, 3460, 378, 41], phone: [47, 2601, 280, 30] },
  form: { id: "b33-113", listMax: 884 },
  popup: {
    height: 408, headerH: 74, headerFill: "#ffe8a4", titleColor: "#5a0000", bodyFill: "#5a0000", ink: "#ffe8a4", accent: "#ffe8a4", saveFill: "#681310", centers: [152, 424],
    columns: [
      { title: "Chú Rể - Quang Duy", bank: "Vietcombank", number: "0000000000", holder: "QUANG DUY", qr: "/demo/song-hac-do/qr-groom.png" },
      { title: "Cô Dâu - Hà Linh", bank: "MB Bank", number: "0000000000", holder: "HA LINH", qr: "/demo/song-hac-do/qr-bride.png" },
    ],
    titleSize: 26, titleH: 39, labelY: 98, labelSize: 12, qr: { y: 138, card: 160, image: 140 }, bankY: 306, numberY: 323, holderY: 340, lineSize: 10, save: { y: 361, w: 68, h: 23, size: 10 },
  },
});
