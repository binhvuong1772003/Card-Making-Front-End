import type { TreeNode } from "@miditor/core";

// Trôi theo cuộn (parallax) của khối Trang trí: khối dịch thêm `kx` và `ky` phần nghìn của quãng đã cuộn (đo từ các lớp hoa của trang mẫu Hoa Mộc Xanh:
// hoa trên cùng +100‰ nên cuộn chậm hơn trang, hoa giữa -30..-70‰ nên cuộn nhanh hơn). Vị trí khối trong tài liệu là vị trí khi chưa cuộn.
// Dịch bằng thuộc tính `translate` của chính khối (nằm ngoài góc xoay) nên khối xoay vẫn dịch đúng hướng; biến `--cm-scroll` do trình phát đặt.
export const PARALLAX_LIMIT = 300;
const SAFE_ID = /^[A-Za-z0-9_-]{1,80}$/;
const clamp = (value: unknown): number => (typeof value === "number" && Number.isFinite(value) ? Math.max(-PARALLAX_LIMIT, Math.min(PARALLAX_LIMIT, value)) : 0);

export function parallaxCss(root: TreeNode): string {
  const rules: string[] = [];
  const visit = (node: TreeNode) => {
    const x = clamp(node.props.parallaxX);
    const y = clamp(node.props.parallaxY);
    if ((x !== 0 || y !== 0) && SAFE_ID.test(node.id)) {
      rules.push(`[data-miditor-id="${node.id}"] { translate: calc(var(--cm-scroll, 0) * ${(x / 1000).toFixed(4)}px) calc(var(--cm-scroll, 0) * ${(y / 1000).toFixed(4)}px) !important; will-change: translate; }`);
    }
    node.children.forEach(visit);
  };
  visit(root);
  return rules.join("\n");
}
