import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-tdx.json";
import { giftDetailsPage, rsvpPage } from "./gift-popups";
import { addCountdown, applyProps, popupInteractions, sparklesToDecorations } from "./finish";
import measured from "./to-duyen-xanh.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/to-duyen-xanh/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "tdx-column", { w: 960, h: height }) as FreeNode;
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

export const toDuyenXanhContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#5e813c", secondary: "#5e813c", paper: "#ffffff" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Tơ Duyên – Xanh", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

// Hoàn thiện: bìa, popup, quà mừng và đếm ngược. Số đo đọc từ trang nguồn đã tải xong (xem docs/references/to-duyen-xanh/handoff.md).
const size = { w: width!, h: height! };
const invitation = toDuyenXanhContentDocument.pages[0]!;
sparklesToDecorations(column, ["tdx-093", "tdx-094", "tdx-095", "tdx-096"], "/demo/to-duyen-xanh/sparkle.svg", size);
addCountdown(column, size, { id: "tdx-countdown", date: "2026-12-19", time: "18:30", color: "#1a3500", font: "Baskerville, 'Times New Roman', serif", align: "right", rect: [394, 3360, 351, 41], phone: [38, 2365, 300, 41] });
applyProps(invitation.data.root, {
  "tdx-098": { hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 },
  "tdx-099": { hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 },
  "tdx-110": { listMax: 1116 },
});
const GIFT_IDS = ["tdx-098", "tdx-099", "tdx-100"];

export const toDuyenXanhDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "cover",
  pages: [
    coverJson as unknown as CardPage,
    { ...invitation, interactions: popupInteractions("tdx-107", GIFT_IDS) },
    giftDetailsPage({
      height: 415, headerH: 81, headerFill: "#5e813c", titleColor: "#ffffff", bodyFill: "#ffffff", ink: "#5e813c", saveFill: "#f2f5ef", centers: [151.5, 424.5],
      columns: [
        { title: "Chú Rể - Hoài Nam", bank: "Techcombank", number: "0000000000", holder: "HOAI NAM", qr: "/demo/to-duyen-xanh/qr-groom.png" },
        { title: "Cô Dâu - Thanh Trúc", bank: "Vietcombank", number: "0000000000", holder: "THANH TRUC", qr: "/demo/to-duyen-xanh/qr-bride.png" },
      ],
      labelY: 105, labelSize: 12, qr: { y: 145, card: 160, image: 140 }, bankY: 313, numberY: 330, holderY: 347, lineSize: 10, save: { y: 368, w: 68, h: 23, size: 10 },
    }),
    rsvpPage("#5e813c", "demo-to-duyen-xanh-rsvp"),
  ],
};
