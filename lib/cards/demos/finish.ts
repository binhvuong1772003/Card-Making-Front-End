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
};

/** Dòng "N ngày G giờ P phút S giây" của khối Đếm ngược, đặt dưới tiêu đề "Cùng đếm ngược". */
export function addCountdown(column: TreeNode, size: { w: number; h: number }, spec: CountdownSpec): void {
  const node = newNode(registry, "Countdown", spec.id, size, { props: { date: spec.date, time: spec.time, color: spec.color, font: spec.font, size: spec.size ?? 27, bold: true, align: spec.align, layerName: "Đếm ngược" } }) as FreeNode;
  node.position = { mode: "free", x: { anchor: "start", offset: spec.rect[0] }, y: { anchor: "start", offset: spec.rect[1] } };
  node.size = { w: px(spec.rect[2]), h: px(spec.rect[3]) };
  node.phone = { x: { anchor: "start", offset: spec.phone[0] }, y: { anchor: "start", offset: spec.phone[1] }, w: px(spec.phone[2]), h: px(spec.phone[3]), rotation: 0 };
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
