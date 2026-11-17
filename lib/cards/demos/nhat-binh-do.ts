import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-nbd.json";
import { finishTemplate } from "./finish";
import measured from "./nhat-binh-do.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/nhat-binh-do/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b410-column", { w: 960, h: height }) as FreeNode;
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

export const nhatBinhDoContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#542e08", secondary: "#542e08", paper: "#f8f3e0" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Nhật Bình - Đỏ", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const nhatBinhDoDocument: CardDocument = finishTemplate({
  content: nhatBinhDoContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b410-118", color: "#c32a29", formId: "demo-nhat-binh-do-rsvp" },
  giftIds: ["b410-106", "b410-107", "b410-108", "b410-109", "b410-110", "b410-111", "b410-112", "b410-113"],
  giftBox: { main: "b410-109", minis: ["b410-106", "b410-107", "b410-108", "b410-110", "b410-111", "b410-112"], phoneDelta: 1833, fixes: {"b410-106": [324, 7417, 34, 36], "b410-107": [330, 7527, 26, 27], "b410-108": [535, 7532, 24, 24], "b410-109": [361, 7462, 178, 187], "b410-110": [339, 7571, 44, 44], "b410-111": [380, 7583, 26, 26], "b410-112": [473, 7580, 40, 42]} },
  sparkles: { ids: ["b410-094", "b410-095", "b410-096", "b410-097"], src: "/demo/nhat-binh-do/sparkle.svg" },
  form: { id: "b410-121", listMax: 691 },
  popup: {"height": 422, "headerH": 88, "labelY": 112, "qr": {"y": 152, "card": 160, "image": 140}, "bankY": 320, "numberY": 337, "holderY": 354, "save": {"y": 375, "w": 68, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#c32a29", "titleColor": "#ffffff", "bodyFill": "#f8f3e0", "ink": "#542e08", "saveFill": "#f4e3d1", "labelSize": 12, "lineSize": 10, "titleSize": 26, "titleH": 39, "accent": "#c32a29", "columns": [{"title": "Chú Rể - Thế Bảo", "bank": "Vietcombank", "number": "0000000000", "holder": "THE BAO", "qr": "/demo/nhat-binh-do/qr-groom.png"}, {"title": "Cô Dâu - Ngọc Ánh", "bank": "VietinBank", "number": "0000000000", "holder": "NGOC ANH", "qr": "/demo/nhat-binh-do/qr-bride.png"}]},
});
