import { builtInRegistry, newNode, type FreeNode, type JsonValue, type TreeNode } from "@miditor/core";
import { cardDefinitions } from "../blocks/definitions";
import type { CardPage } from "../document";

// Phần hoàn thiện chung cho các mẫu dựng từ số đo: sao chớp, dòng đếm ngược, hiệu ứng và bấm mở popup của hộp quà.
const registry = { ...builtInRegistry, ...cardDefinitions };

type Axis = { kind: "px"; v: number };
const px = (v: number): Axis => ({ kind: "px", v });

/** Đổi các Chữ "✦" của bản đo thành Decoration hình sao (chỉ Decoration có hiệu ứng nhàn rỗi), chớp lệch pha. */
export function sparklesToDecorations(column: TreeNode, ids: string[], src: string, size: { w: number; h: number }, delays = [0, 0.6, 1.2, 1.7]): void {
  column.children = column.children.map((child) => {
    const index = ids.indexOf(child.id);
    if (index < 0) return child;
    const source = child as FreeNode;
    const star = newNode(registry, "Decoration", child.id, size, { props: { src, alt: "", fit: "contain", motion: false, motionTarget: "", idleEffect: "Chớp sáng", idleDelay: delays[index % delays.length]! } }) as FreeNode;
    star.position = source.position;
    star.size = source.size;
    star.phone = source.phone;
    star.rotation = source.rotation;
    return star;
  });
}

export type CountdownSpec = {
  id: string;
  date: string;
  time: string;
  color: string;
  font: string;
  align: "left" | "center" | "right";
  /** x, y, rộng, cao trên máy tính và điện thoại, cùng hệ tọa độ với các khối đã đo. */
  rect: [number, number, number, number];
  phone: [number, number, number, number];
  size?: number;
  /** Cỡ chữ riêng trên điện thoại khi khác máy tính. */
  phoneSize?: number;
  bold?: boolean;
};

/** Dòng "N ngày G giờ P phút S giây" của khối Đếm ngược, đặt dưới tiêu đề "Cùng đếm ngược". */
export function addCountdown(column: TreeNode, size: { w: number; h: number }, spec: CountdownSpec): void {
  const node = newNode(registry, "Countdown", spec.id, size, { props: { date: spec.date, time: spec.time, color: spec.color, font: spec.font, size: spec.size ?? 27, bold: spec.bold ?? true, align: spec.align, layerName: "Đếm ngược" } }) as FreeNode;
  node.position = { mode: "free", x: { anchor: "start", offset: spec.rect[0] }, y: { anchor: "start", offset: spec.rect[1] } };
  node.size = { w: px(spec.rect[2]), h: px(spec.rect[3]) };
  node.phone = { x: { anchor: "start", offset: spec.phone[0] }, y: { anchor: "start", offset: spec.phone[1] }, w: px(spec.phone[2]), h: px(spec.phone[3]), rotation: 0 };
  if (spec.phoneSize) node.phoneProps = { size: spec.phoneSize };
  // A content draft can already contain this timer. Finishing refines that
  // timer rather than drawing it twice; measured/configured boxes can round
  // differently by up to two pixels. Keep other events and locations intact.
  column.children = column.children.filter(child => {
    if (child.type !== "Countdown") return true;
    if (child.id === spec.id) return false;
    const old = child as FreeNode;
    if (child.props.date !== spec.date || child.props.time !== spec.time || old.position.mode !== "free") return true;
    if (old.position.x.anchor !== "start" || old.position.y.anchor !== "start" || old.size.w.kind !== "px" || old.size.h.kind !== "px") return true;
    const rect = [old.position.x.offset, old.position.y.offset, old.size.w.v, old.size.h.v];
    return rect.some((value, index) => Math.abs(value - spec.rect[index]!) > 2);
  });
  column.children.push(node);
}

/** Thêm thuộc tính (hover, idle...) vào các khối theo id, ở bất kỳ độ sâu nào. */
export function applyProps(root: TreeNode, effects: Record<string, Record<string, JsonValue>>): void {
  const visit = (node: TreeNode) => {
    if (effects[node.id]) node.props = { ...node.props, ...effects[node.id]! };
    node.children.forEach(visit);
  };
  visit(root);
}

/** Bấm nút RSVP mở popup xác nhận; bấm bao quà hoặc chữ "Nhấn để mở" mở popup quà mừng. */
export function popupInteractions(rsvpId: string, giftIds: string[]): CardPage["interactions"] {
  return {
    [rsvpId]: { type: "open-popup", targetPageId: "rsvp", transition: "fade", durationMs: 200 },
    ...Object.fromEntries(giftIds.map((id) => [id, { type: "open-popup", targetPageId: "gift-details", transition: "fade", durationMs: 250 } as const])),
  };
}

// --- Hoàn thiện cả mẫu từ một bản cấu hình (dùng cho các mẫu sau Song Hỷ V2 / Tơ Duyên / Nâu Đậm / Cẩm Thạch) ---

import type { CardDocument } from "../document";
import { giftDetailsPage, rsvpPage, type GiftPopupSpec } from "./gift-popups";

const flyParams = [
  [55, -14, 1.6, 0], [60, 14, 1.8, 0.15], [65, -10, 1.4, 0.3], [70, 12, 1.7, 0.45], [80, -8, 1.9, 0.1], [75, 10, 1.3, 0.35], [72, 14, 1.7, 0.2], [68, -12, 1.5, 0.25],
] as const;

export type GiftBoxConfig = {
  main: string;
  minis: string[];
  /** x, y, rộng, cao thật (layout, chưa xoay) đo sau khi ảnh tải xong; bản đo đầu có ảnh quà cao 0px và y của ảnh chính là đáy hộp. */
  fixes: Record<string, [number, number, number, number]>;
  /** Điện thoại thấp hơn máy tính bấy nhiêu px. */
  phoneDelta: number;
};

export type FinishConfig = {
  content: CardDocument;
  column: TreeNode;
  size: { w: number; h: number };
  cover: CardPage;
  rsvp: { id: string; color: string; formId: string };
  popup: GiftPopupSpec;
  /** Id các khối bấm vào mở popup quà (bao, hộp, chữ "Nhấn để mở"). */
  giftIds: string[];
  sparkles?: { ids: string[]; src: string };
  countdown?: CountdownSpec;
  /** Hai bao lì xì: bao trước (id thứ hai) đung đưa khi rê chuột. */
  envelopes?: { front: string };
  giftBox?: GiftBoxConfig;
  form?: { id: string; listMax: number };
};

/** Ghép bìa, popup, hiệu ứng quà, đếm ngược, sao chớp và tương tác thành tài liệu đầy đủ từ một bản nội dung đã đo. */
export function finishTemplate(config: FinishConfig): CardDocument {
  const { content, column, size } = config;
  const invitation = content.pages[0]!;
  const effects: Record<string, Record<string, JsonValue>> = {};

  if (config.giftBox) {
    const box = config.giftBox;
    for (const child of column.children as FreeNode[]) {
      const fix = box.fixes[child.id];
      if (!fix) continue;
      child.position = { mode: "free", x: { anchor: "start", offset: fix[0] }, y: { anchor: "start", offset: fix[1] } };
      child.size = { w: px(fix[2]), h: px(fix[3]) };
      const phoneX = (child.phone!.x as { offset: number }).offset;
      child.phone = { x: { anchor: "start", offset: phoneX }, y: { anchor: "start", offset: fix[1] - box.phoneDelta }, w: px(fix[2]), h: px(fix[3]), rotation: child.phone!.rotation };
    }
    effects[box.main] = { hoverEffect: "Nảy lên", hoverGroup: "qua", hoverTime: 0.7 };
    box.minis.forEach((id, index) => {
      const [rise, sway, time, delay] = flyParams[index % flyParams.length]!;
      effects[id] = { hoverEffect: "Bay lên rồi hiện lại", hoverGroup: "qua", hoverRise: rise, hoverSway: sway, hoverTime: time, hoverDelay: delay };
    });
  }
  if (config.envelopes) effects[config.envelopes.front] = { hoverEffect: "Lắc", hoverGroup: "qua", hoverTime: 1.25 };
  if (config.form) effects[config.form.id] = { listMax: config.form.listMax };
  if (config.sparkles) sparklesToDecorations(column, config.sparkles.ids, config.sparkles.src, size);
  if (config.countdown) addCountdown(column, size, config.countdown);
  applyProps(invitation.data.root, effects);

  return {
    kind: "card", version: 1, startPageId: "cover",
    pages: [
      config.cover,
      { ...invitation, interactions: popupInteractions(config.rsvp.id, config.giftIds) },
      giftDetailsPage(config.popup),
      rsvpPage(config.rsvp.color, config.rsvp.formId),
    ],
  };
}
