import { isFreeNode, type ComponentDef, type FreeBox, type Size, type TreeNode } from "@miditor/core";

const GIFT_RATIO = 487 / 480;

function correctHeight<T extends { w: Size; h: Size }>(size: T): Omit<T, "h"> & { h: Size } {
  const width = size.w.kind === "px" ? size.w.v : 180;
  return { ...size, h: { kind: "px" as const, v: Math.round(width * GIFT_RATIO) } };
}

export function upgradeLegacyDecorations(node: TreeNode): TreeNode {
  const children = node.children.map(upgradeLegacyDecorations);
  const src = node.props.src;
  if (node.type !== "Image" || typeof src !== "string" || !src.includes("/cardmaking/decorations/")) {
    return children.every((child, index) => child === node.children[index]) ? node : { ...node, children };
  }
  const isGift = src.includes("starter-wedding-gift-box");
  const sized = isGift && isFreeNode(node) ? { ...node, size: correctHeight(node.size), phone: node.phone ? correctHeight<FreeBox>(node.phone) : undefined } : node;
  return { ...sized, type: "Decoration", props: { src, alt: typeof node.props.alt === "string" ? node.props.alt : "", fit: "contain", motion: isGift }, children };
}

// Hiệu ứng lặp của một khối trang trí: "Đập" (nhịp tim: phình hai nhịp rồi nghỉ) và "Ánh sáng quét" (vệt sáng chạy ngang như nút của trang mẫu).
export const DECORATION_IDLE_EFFECTS = ["Không", "Đập", "Ánh sáng quét"] as const;
export type DecorationIdleEffect = (typeof DECORATION_IDLE_EFFECTS)[number];

export const decorationBlock: ComponentDef = {
  label: "Trang trí",
  category: "Trang trí",
  icon: "img",
  keywords: ["trang trí", "hoa", "lá", "chi tiết"],
  size: { w: 180, h: 180 },
  lockRatio: true,
  hidden: true,
  canContain: false,
  defaultProps: { src: "", alt: "", fit: "contain", motion: false, motionStyle: "Hộp quà", floatMotion: false, idleEffect: "Không", shineRadius: 24, motionTarget: "" },
  fields: {
    src: { type: "custom", kind: "fixed-image", label: "Hình trang trí", group: "Nội dung" },
    alt: { type: "text", label: "Mô tả", maxLength: 500, group: "Nội dung" },
    fit: { type: "select", label: "Cách hiển thị", options: ["contain", "cover"], group: "Nội dung" },
    motion: { type: "boolean", label: "Hiệu ứng hộp quà", group: "Hiệu ứng" },
    motionStyle: { type: "select", label: "Kiểu quà", options: ["Hộp quà", "Bao lì xì"], group: "Hiệu ứng" },
    floatMotion: { type: "boolean", label: "Trôi nhẹ", help: "Tắt để giữ trang trí đứng yên.", group: "Hiệu ứng" },
    idleEffect: { type: "select", label: "Hiệu ứng lặp", options: DECORATION_IDLE_EFFECTS, group: "Hiệu ứng", help: "Đập: nhịp tim, hợp con dấu hoặc trái tim. Ánh sáng quét: vệt sáng chạy ngang, đặt lên nút." },
    shineRadius: { type: "number", label: "Bo góc vệt sáng", min: 0, max: 200, unit: "px", group: "Hiệu ứng", help: "Vệt sáng chỉ hiện trong khung này; đặt bằng nửa chiều cao nút để bo tròn." },
    motionTarget: { type: "text", label: "Mục tiêu chuyển động", maxLength: 40, hidden: true, group: "Hiệu ứng" },
  },
};
