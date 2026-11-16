import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-adh.json";
import { finishTemplate } from "./finish";
import measured from "./anh-dao-hong.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/anh-dao-hong/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b36-column", { w: 960, h: height }) as FreeNode;
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

export const anhDaoHongContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#ae4c51", secondary: "#ae4c51", paper: "#464646" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Anh Đào - Hồng", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const anhDaoHongDocument: CardDocument = finishTemplate({
  content: anhDaoHongContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b36-101", color: "#ae4c51", formId: "demo-anh-dao-hong-rsvp" },
  giftIds: ["b36-087", "b36-088", "b36-089", "b36-090", "b36-091", "b36-092", "b36-093", "b36-094"],
  giftBox: {
    main: "b36-091", minis: ["b36-087", "b36-088", "b36-089", "b36-090", "b36-092", "b36-093", "b36-094"], phoneDelta: 1361,
    fixes: {"b36-087": [329, 7651, 34, 34], "b36-088": [517, 7643, 38, 40], "b36-089": [333, 7761, 26, 27], "b36-090": [531, 7755, 24, 26], "b36-091": [364, 7688, 170, 176], "b36-092": [341, 7813, 44, 44], "b36-093": [375, 7823, 26, 27], "b36-094": [467, 7817, 40, 41]},
  },
  sparkles: { ids: ["b36-075", "b36-076", "b36-077", "b36-078"], src: "/demo/anh-dao-hong/sparkle.svg" },
  form: { id: "b36-104", listMax: 1012 },
  popup: {
    height: 413, headerH: 79, headerFill: "#ba4a59", titleColor: "#ffffff", bodyFill: "#fff1f3", ink: "#ae4c51", accent: "#ba4a59", saveFill: "#f9e6e9", centers: [152, 424],
    columns: [
      { title: "Chú Rể - Trung Hiếu", bank: "Vietcombank", number: "0000000000", holder: "TRUNG HIEU", qr: "/demo/anh-dao-hong/qr-groom.png" },
      { title: "Cô Dâu - Như Ý", bank: "Techcombank", number: "0000000000", holder: "NHU Y", qr: "/demo/anh-dao-hong/qr-bride.png" },
    ],
    titleSize: 26, titleH: 39, labelY: 103, labelSize: 12, qr: { y: 143, card: 160, image: 140 }, bankY: 311, numberY: 328, holderY: 345, lineSize: 10, save: { y: 366, w: 68, h: 23, size: 10 },
  },
});
