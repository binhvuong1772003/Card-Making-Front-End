import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import type { CardDocument, CardPage } from "../document";
import coverJson from "../../../public/demo/song-hy/cover-mnd.json";
import { giftDetailsPage, rsvpPage } from "./gift-popups";
import { addCountdown, applyProps, popupInteractions, sparklesToDecorations } from "./finish";
import measured from "./minimalism-nau-dam.measured.json";

// Working content draft, measured through the existing Chrome profile.
// Source and unresolved renderer/UI differences: docs/references/minimalism-nau-dam/.
// This document deliberately contains no cover, popup, music or bank details.
const registry = { ...builtInRegistry, ...cardDefinitions };
const wishes = formPresets.find(preset => preset.id === "wishes")!.props;
const [width, height] = measured.desktopSize;
const [phoneWidth, phoneHeight] = measured.phoneSize;
const blank = emptyPage();
const column = newNode(registry, "CardPanel", "mnd-column", { w: 960, h: height }) as FreeNode;
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

export const minimalismNauDamContentDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "invitation",
  pages: [{ id: "invitation", name: "Thiệp mời", interactions: {}, data: {
    ...blank,
    root: { ...blank.root, styles: { background: "#ffffff", minHeight: Math.ceil(height!), phoneMinHeight: Math.ceil(phoneHeight!) }, children: [column] },
    theme: { colors: { primary: "#593d2c", secondary: "#593d2c", paper: "#f7f5ee" }, fonts: { body: "Baskerville, 'Times New Roman', serif", heading: "'Times New Roman', serif" } },
    meta: { title: "Minimalism – Nâu Đậm", description: "Bản nội dung đang đối chiếu từ nguồn; chưa nghiệm thu." },
  } }],
};

// Hoàn thiện: bìa, popup, quà mừng và đếm ngược. Số đo đọc lại từ trang nguồn sau khi ảnh đã tải (bản đo đầu có ảnh quà cao 0px).
const size = { w: width!, h: height! };
const invitation = minimalismNauDamContentDocument.pages[0]!;
// Ảnh quà: x, y, rộng, cao (layout, chưa xoay). Điện thoại lệch cố định 840px so với máy tính.
const GIFT_FIX: Record<string, [number, number, number, number]> = {
  "mnd-133": [330, 6558, 34, 34], "mnd-134": [518, 6550, 38, 40], "mnd-135": [334, 6668, 26, 26], "mnd-136": [532, 6662, 24, 25],
  "mnd-137": [365, 6599, 170, 170], "mnd-138": [342, 6721, 44, 47], "mnd-139": [376, 6731, 26, 27], "mnd-140": [468, 6724, 40, 42],
};
for (const child of column.children as FreeNode[]) {
  const fix = GIFT_FIX[child.id];
  if (!fix) continue;
  child.position = { mode: "free", x: { anchor: "start", offset: fix[0] }, y: { anchor: "start", offset: fix[1] } };
  child.size = { w: { kind: "px", v: fix[2] }, h: { kind: "px", v: fix[3] } };
  const phoneX = (child.phone!.x as { offset: number }).offset;
  child.phone = { x: { anchor: "start", offset: phoneX }, y: { anchor: "start", offset: fix[1] - 840 }, w: { kind: "px", v: fix[2] }, h: { kind: "px", v: fix[3] }, rotation: child.phone!.rotation };
}
sparklesToDecorations(column, ["mnd-121", "mnd-122", "mnd-123", "mnd-124"], "/demo/minimalism-nau-dam/sparkle.svg", size);
addCountdown(column, size, { id: "mnd-countdown", date: "2027-11-17", time: "18:30", color: "#c0b2a4", font: "Baskerville, 'Times New Roman', serif", align: "center", size: 18, bold: false, rect: [342, 3216, 216, 28], phone: [80, 2516, 216, 28] });
const fly = (rise: number, sway: number, time: number, delay: number) => ({ hoverEffect: "Bay lên rồi hiện lại", hoverGroup: "qua", hoverRise: rise, hoverSway: sway, hoverTime: time, hoverDelay: delay });
applyProps(invitation.data.root, {
  "mnd-137": { hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 },
  "mnd-133": fly(55, -14, 1.6, 0), "mnd-134": fly(60, 14, 1.8, 0.15), "mnd-135": fly(65, -10, 1.4, 0.3), "mnd-136": fly(70, 12, 1.7, 0.45),
  "mnd-138": fly(80, -8, 1.9, 0.1), "mnd-139": fly(75, 10, 1.3, 0.35), "mnd-140": fly(72, 14, 1.7, 0.2),
  "mnd-149": { listMax: 636 },
});
const GIFT_IDS = ["mnd-133", "mnd-134", "mnd-135", "mnd-136", "mnd-137", "mnd-138", "mnd-139", "mnd-140", "mnd-141"];

export const minimalismNauDamDocument: CardDocument = {
  kind: "card", version: 1, startPageId: "cover",
  pages: [
    coverJson as unknown as CardPage,
    { ...invitation, interactions: popupInteractions("mnd-146", GIFT_IDS) },
    giftDetailsPage({
      height: 442, headerH: 70, headerFill: "#593d2c", titleColor: "#ffffff", bodyFill: "#f7f5ee", ink: "#593d2c", saveFill: "#eae6de", centers: [288],
      columns: [{ title: "Chú Rể - Xuân Trường", bank: "Vietcombank", number: "0000000000", holder: "XUAN TRUONG", qr: "/demo/minimalism-nau-dam/qr-groom.png" }],
      titleSize: 20, titleH: 30, labelY: 94, labelSize: 14, qr: { y: 126, card: 192, image: 172 }, bankY: 330, numberY: 348, holderY: 366, lineSize: 12, save: { y: 390, w: 84, h: 28, size: 12 },
    }),
    rsvpPage("#593d2c", "demo-minimalism-nau-dam-rsvp"),
  ],
};
