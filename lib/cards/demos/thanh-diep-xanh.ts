import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-tdx2.json";
import { finishTemplate } from "./finish";
import measured from "./thanh-diep-xanh.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/thanh-diep-xanh/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "b43-column", { w: 960, h: height }) as FreeNode;
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

export const thanhDiepXanhContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#ffffff", secondary: "#ffffff", paper: "#ffffff" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Thanh Diệp - Xanh", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

const size = { w: width!, h: height! };
export const thanhDiepXanhDocument: CardDocument = finishTemplate({
  content: thanhDiepXanhContentDocument, column, size, cover: coverJson as unknown as CardPage,
  rsvp: { id: "b43-135", color: "#4e6439", formId: "demo-thanh-diep-xanh-rsvp" },
  giftIds: ["b43-120", "b43-121", "b43-122", "b43-123", "b43-124", "b43-125", "b43-126", "b43-127", "b43-128"],
  giftBox: { main: "b43-124", minis: ["b43-120", "b43-121", "b43-122", "b43-123", "b43-125", "b43-126", "b43-127"], phoneDelta: 1176, fixes: {"b43-120": [324, 7794, 34, 35], "b43-121": [523, 7788, 38, 39], "b43-122": [330, 7904, 26, 28], "b43-123": [534, 7911, 24, 26], "b43-124": [361, 7835, 178, 189], "b43-125": [339, 7949, 44, 44], "b43-126": [379, 7961, 26, 26], "b43-127": [473, 7957, 40, 40]} },
  sparkles: { ids: ["b43-108", "b43-109", "b43-110", "b43-111"], src: "/demo/thanh-diep-xanh/sparkle.svg" },
  form: { id: "b43-138", listMax: 819 },
  popup: {"height": 413, "headerH": 79, "labelY": 103, "qr": {"y": 143, "card": 160, "image": 140}, "bankY": 311, "numberY": 328, "holderY": 345, "save": {"y": 366, "w": 88, "h": 23, "size": 10}, "centers": [152, 424], "headerFill": "#4e6439", "titleColor": "#ffffff", "bodyFill": "#ffffff", "ink": "#4e6439", "saveFill": "#f0f2ef", "labelSize": 12, "lineSize": 10, "titleSize": 24, "titleH": 39, "title": "HỘP QUÀ MỪNG / GIFT BOX", "saveLabel": "↓ Lưu QR / Save QR", "columns": [{"title": "Chú Rể / Groom - Văn Toàn", "bank": "Vietcombank", "number": "0000000000", "holder": "VAN TOAN", "qr": "/demo/thanh-diep-xanh/qr-groom.png"}, {"title": "Cô Dâu / Bride - Thanh Diệp", "bank": "VietinBank", "number": "0000000000", "holder": "THANH DIEP", "qr": "/demo/thanh-diep-xanh/qr-bride.png"}]},
});
