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
export const DECORATION_IDLE_EFFECTS = ["Không", "Đập", "Thở nhẹ", "Ánh sáng quét", "Chớp sáng"] as const;
export type DecorationIdleEffect = (typeof DECORATION_IDLE_EFFECTS)[number];

// Hiệu ứng khi rê chuột (số đo từ hộp quà của trang mẫu): "Nảy lên" (hộp nhảy lên nghiêng 3 độ rồi lắng xuống, 0,7s), "Bay lên rồi hiện lại" (vật nhỏ bay lên mờ dần rồi hiện lại, lặp), "Pháo giấy" (8 mảnh giấy bắn lên từ mép trên khung, lặp).
// Các khối cùng "Nhóm rê chuột" phản ứng cùng lúc khi rê vào bất kỳ khối nào trong nhóm.
export const DECORATION_HOVER_EFFECTS = ["Không", "Nảy lên", "Bay lên rồi hiện lại", "Pháo giấy"] as const;
export type DecorationHoverEffect = (typeof DECORATION_HOVER_EFFECTS)[number];
/** Tên nhóm chỉ giữ chữ thường, số và gạch nối để dùng an toàn trong bộ chọn CSS. */
export function hoverGroupId(value: unknown): string {
  return typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30) : "";
}

export const decorationBlock: ComponentDef = {
  label: "Trang trí",
  category: "Trang trí",
  icon: "img",
  keywords: ["trang trí", "hoa", "lá", "chi tiết"],
  size: { w: 180, h: 180 },
  lockRatio: true,
  hidden: true,
  canContain: false,
  defaultProps: { src: "", alt: "", fit: "contain", flipX: false, motion: false, motionStyle: "Hộp quà", floatMotion: false, idleEffect: "Không", idleDelay: 0, shineRadius: 24, hoverEffect: "Không", hoverGroup: "", hoverTime: 1.6, hoverDelay: 0, hoverRise: 55, hoverSway: 14, motionTarget: "", tint: false, tintColor: "#e8f0e4" },
  fields: {
    src: { type: "custom", kind: "fixed-image", label: "Hình trang trí", group: "Nội dung" },
    alt: { type: "text", label: "Mô tả", maxLength: 500, group: "Nội dung" },
    tint: { type: "boolean", label: "Tô màu đơn sắc", group: "Nội dung", help: "Dùng cho hình có nền trong suốt như biểu tượng, chữ Hỷ và ngôi sao." },
    tintColor: { type: "color", label: "Màu trang trí", group: "Nội dung" },
    fit: { type: "select", label: "Cách hiển thị", options: ["contain", "cover"], group: "Nội dung" },
    flipX: { type: "boolean", label: "Lật ngang", group: "Nội dung" },
    motion: { type: "boolean", label: "Hiệu ứng hộp quà", group: "Hiệu ứng" },
    motionStyle: { type: "select", label: "Kiểu quà", help: "Cặp bao lì xì: dùng một ảnh phong bì, vẽ hai lớp, rê chuột thì phóng to và lắc.", options: ["Hộp quà", "Bao lì xì", "Cặp bao lì xì"], group: "Hiệu ứng" },
    floatMotion: { type: "boolean", label: "Trôi nhẹ", help: "Tắt để giữ trang trí đứng yên.", group: "Hiệu ứng" },
    idleEffect: { type: "select", label: "Hiệu ứng lặp", options: DECORATION_IDLE_EFFECTS, group: "Hiệu ứng", help: "Đập: nhịp tim. Thở nhẹ: phóng to thu nhỏ chậm. Ánh sáng quét: vệt sáng chạy ngang, đặt lên nút. Chớp sáng: mờ rồi sáng lặp lại 2 giây, như ngôi sao quanh hộp quà." },
    idleDelay: { type: "number", label: "Trễ hiệu ứng lặp", min: 0, max: 5, unit: "s", group: "Hiệu ứng", help: "Dùng cho Chớp sáng: so le nhịp giữa nhiều ngôi sao." },
    shineRadius: { type: "number", label: "Bo góc vệt sáng", min: 0, max: 200, unit: "px", group: "Hiệu ứng", help: "Vệt sáng chỉ hiện trong khung này; đặt bằng nửa chiều cao nút để bo tròn." },
    hoverEffect: { type: "select", label: "Khi rê chuột", options: DECORATION_HOVER_EFFECTS, group: "Hiệu ứng", help: "Nảy lên: như hộp quà. Bay lên rồi hiện lại: dùng cho vật nhỏ quanh hộp. Pháo giấy: đặt khối ở mép trên hộp." },
    hoverGroup: { type: "text", label: "Nhóm rê chuột", maxLength: 30, group: "Hiệu ứng", help: "Các khối cùng tên (chữ thường, số, gạch nối) phản ứng cùng lúc khi rê vào một khối. Để trống thì chỉ phản ứng khi rê vào chính nó." },
    hoverTime: { type: "number", label: "Thời gian rê", min: 0.3, max: 5, unit: "s", group: "Hiệu ứng" },
    hoverDelay: { type: "number", label: "Trễ khi rê", min: 0, max: 3, unit: "s", group: "Hiệu ứng" },
    hoverRise: { type: "number", label: "Độ bay lên", min: 10, max: 200, unit: "px", group: "Hiệu ứng", help: "Dùng cho Bay lên rồi hiện lại." },
    hoverSway: { type: "number", label: "Lệch ngang", min: -60, max: 60, unit: "px", group: "Hiệu ứng", help: "Âm lệch trái, dương lệch phải." },
    motionTarget: { type: "text", label: "Mục tiêu chuyển động", maxLength: 40, hidden: true, group: "Hiệu ứng" },
  },
};
