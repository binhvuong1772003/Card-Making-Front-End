import { builtInRegistry, emptyPage, newNode, type FreeNode, type JsonValue, type NodeStyles, type PageData } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import { formPresets } from "../blocks/form-presets";
import { nameLayers } from "../layers";
import type { CardPage } from "../document";

// Hai popup chung của nền tảng nguồn (hộp quà mừng 576px và xác nhận tham dự 448px), mỗi mẫu chỉ đổi màu và tọa độ đã đo.
const registry = { ...builtInRegistry, ...cardDefinitions };
const K = 960 / 576;

export type GiftColumn = { title: string; bank: string; number: string; holder: string; qr: string };
export type GiftPopupSpec = {
  height: number;
  headerH: number;
  headerFill: string;
  titleColor: string;
  bodyFill: string;
  ink: string;
  saveFill: string;
  /** Tâm các cột theo bề rộng hộp 576px. */
  centers: number[];
  columns: GiftColumn[];
  labelY: number; labelSize: number;
  qr: { y: number; card: number; image: number };
  bankY: number; numberY: number; holderY: number; lineSize: number;
  save: { y: number; w: number; h: number; size: number };
  qrCardFill?: string;
};

/** Popup "Hộp quà mừng": đầu màu, tiêu đề Times đậm hoa, mỗi cột có nhãn, thẻ QR, ngân hàng, số tài khoản, chủ tài khoản và nút Lưu QR. */
export function giftDetailsPage(spec: GiftPopupSpec): CardPage {
  const n = (v: number) => Math.round(v * K);
  const list: FreeNode[] = [];
  const put = (type: string, id: string, left: number, top: number, w: number, h: number, props: Record<string, JsonValue>, styles: NodeStyles = {}) => {
    const node = newNode(registry, type, id, { w: 960, h: n(spec.height) }, { props }) as FreeNode;
    node.position = { mode: "free", x: { anchor: "start", offset: n(left) }, y: { anchor: "start", offset: n(top) } };
    node.size = { w: { kind: "px", v: n(w) }, h: { kind: "px", v: n(h) } };
    node.styles = { ...node.styles, ...styles };
    list.push(node);
  };
  const label = (id: string, value: string, left: number, top: number, w: number, h: number, size: number, color: string, font: string, bold = false, extra: Record<string, JsonValue> = {}) =>
    put("Text", id, left, top, w, h, { text: value, size: Math.round(size * K), color, font, bold, italic: false, underline: false, align: "center", ...extra });
  put("Shape", "gift-popup-header", 0, 0, 576, spec.headerH, { shape: "rectangle", fill: spec.headerFill, motionTarget: "" });
  label("gift-popup-title", "HỘP QUÀ MỪNG", 24, 24, 528, 41, 27, spec.titleColor, "'Times New Roman', serif", true, { letterSpacing: 0.54 * K, textShadow: "Nhẹ" });
  const sans = "'Gotham', system-ui, sans-serif";
  const mono = "ui-monospace, 'SF Mono', Menlo, monospace";
  spec.columns.forEach((c, i) => {
    const mid = spec.centers[i]!;
    const key = i === 0 ? "groom" : "bride";
    label(`gift-popup-${key}-label`, c.title, mid - 128, spec.labelY, 256, 20, spec.labelSize, spec.ink, sans);
    put("Shape", `gift-popup-${key}-qr-card`, mid - spec.qr.card / 2, spec.qr.y, spec.qr.card, spec.qr.card, { shape: "rectangle", fill: spec.qrCardFill ?? "#ffffff", motionTarget: "" }, { borderRadius: n(12) });
    put("Image", `gift-popup-${key}-qr`, mid - spec.qr.image / 2, spec.qr.y + (spec.qr.card - spec.qr.image) / 2, spec.qr.image, spec.qr.image, { src: c.qr, alt: `Mã QR mừng cưới ${i === 0 ? "chú rể" : "cô dâu"}`, fit: "contain" });
    label(`gift-popup-${key}-bank`, c.bank, mid - 128, spec.bankY, 256, 16, spec.lineSize, spec.ink, "system-ui, sans-serif");
    label(`gift-popup-${key}-number`, c.number, mid - 128, spec.numberY, 256, 16, spec.lineSize, spec.ink, mono);
    label(`gift-popup-${key}-holder`, c.holder, mid - 128, spec.holderY, 256, 16, spec.lineSize, spec.ink, "system-ui, sans-serif", true);
    put("Shape", `gift-popup-${key}-save`, mid - spec.save.w / 2, spec.save.y, spec.save.w, spec.save.h, { shape: "rectangle", fill: spec.saveFill, motionTarget: "" }, { borderRadius: n(spec.save.h / 2) });
    label(`gift-popup-${key}-save-label`, "↓ Lưu QR", mid - spec.save.w / 2, spec.save.y + (spec.save.h - spec.save.size - 2) / 2, spec.save.w, spec.save.size + 2, spec.save.size, spec.ink, "system-ui, sans-serif");
  });
  const page = emptyPage();
  const data: PageData = { ...page, root: nameLayers({ ...page.root, styles: { background: spec.bodyFill, minHeight: n(spec.height), phoneMinHeight: n(spec.height) }, children: list }) };
  return { id: "gift-details", name: "Hộp quà mừng", data, interactions: {}, popup: { width: 641, effect: "fade", backdropColor: "#000000", backdropOpacity: 40 } };
}

/** Popup "Xác nhận tham dự": hộp trắng 448px, bộ câu hỏi dựng sẵn; màu chữ và nút theo mẫu. */
export function rsvpPage(color: string, formId: string): CardPage {
  const attendance = formPresets.find((preset) => preset.id === "attendance")!;
  const form = newNode(registry, "Form", "rsvp-popup-form", { w: 600, h: 620 }, { props: { ...attendance.props, formId, heading: "Xác nhận tham dự", intro: "Sự hiện diện của bạn là niềm vinh hạnh cho gia đình chúng tôi. Xin xác nhận để chúng tôi chuẩn bị chu đáo nhất.", color, padding: 20 } }) as FreeNode;
  form.position = { mode: "free", x: { anchor: "start", offset: 28 }, y: { anchor: "start", offset: 86 } };
  form.size = { w: { kind: "px", v: 544 }, h: { kind: "px", v: 490 } };
  form.phone = { x: { anchor: "start", offset: 20 }, y: { anchor: "start", offset: 86 }, w: { kind: "px", v: 335 }, h: { kind: "px", v: 490 }, rotation: 0 };
  const data: PageData = { ...emptyPage(), root: { ...emptyPage().root, styles: { background: "#ffffff", minHeight: 620, phoneMinHeight: 620 }, children: [form] } };
  return { id: "rsvp", name: "Xác nhận tham dự", data, popup: { width: 448, effect: "fade", backdropColor: "#000000", backdropOpacity: 40 }, interactions: {} };
}
