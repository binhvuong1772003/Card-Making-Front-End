import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-lp2d.json";
import { finishTemplate } from "./finish";
import measured from "./long-phung-v2-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/long-phung-v2-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "lp2d-column", { w: 960, h: height }) as FreeNode;
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

export const longPhungV2DoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#680e0e", secondary: "#680e0e", paper: "#680e0e" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Long Phụng V2 - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const longPhungV2DoDocument: CardDocument = finishTemplate({
  content: longPhungV2DoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "lp2d-098", color: "#680d0e", formId: "demo-long-phung-v2-do-rsvp" },
  giftIds: ["lp2d-090", "lp2d-091", "lp2d-092"], envelopes: { front: "lp2d-091" },
  sparkles: { ids: ["lp2d-085", "lp2d-086", "lp2d-087", "lp2d-088"], src: "/demo/long-phung-v2-do/sparkle.svg" },
  form: { id: "lp2d-101", listMax: 359 },
  // Chữ chi tiết ngân hàng của nguồn là #ffe3b1 trên nền kem nên gần như không đọc được; bản dựng dùng màu đỏ sẫm của tiêu đề.
  popup: {
    height: 410, headerH: 76, headerFill: "#680e0e", titleColor: "#ffffff", bodyFill: "#f5f0e8", ink: "#680e0e", saveFill: "#eadcd6", centers: [152, 424.5],
    columns: [
      { title: "Chú Rể - Trung Hiếu", bank: "Vietcombank", number: "0000000000", holder: "TRUNG HIEU", qr: "/demo/long-phung-v2-do/qr-groom.png" },
      { title: "Cô Dâu - Minh Nguyệt", bank: "Vietcombank", number: "0000000000", holder: "MINH NGUYET", qr: "/demo/long-phung-v2-do/qr-bride.png" },
    ],
    titleSize: 24, titleH: 36, labelY: 100, labelSize: 12, qr: { y: 140, card: 160, image: 140 }, bankY: 308, numberY: 325, holderY: 342, lineSize: 10, save: { y: 363, w: 68, h: 23, size: 10 },
  },
});
