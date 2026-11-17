import type { TreeNode } from "@miditor/core";

// Giãn chữ, chiều cao dòng, độ đậm riêng và bóng chữ của khối Chữ. `Render` của Miditor vẽ khối Chữ dựng sẵn bằng chính nó (bỏ qua renderer
// của host), nên các thuộc tính này không tự có tác dụng: trình phát sinh một luật CSS theo `data-miditor-id` cho từng khối Chữ có đặt chúng.
// Số đo gốc: ngày âm lịch giãn 3,5px, tiêu đề mục 0,5-0,6px, nhãn nhỏ 1,4px.
const SAFE_ID = /^[A-Za-z0-9_-]{1,80}$/;
const num = (value: unknown, min: number, max: number): number => (typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0);

export function textStyleCss(root: TreeNode): string {
  const rules: string[] = [];
  const visit = (node: TreeNode) => {
    if (node.type === "Text" && SAFE_ID.test(node.id)) {
      const spacing = num(node.props.letterSpacing, -2, 20);
      const line = num(node.props.lineHeight, 0, 400);
      const weight = typeof node.props.fontWeight === "string" && /^[1-9]00$/.test(node.props.fontWeight) ? node.props.fontWeight : "";
      const shadow = node.props.textShadow === "Nhẹ";
      const color = typeof node.props.textShadowColor === "string" && /^#[0-9a-f]{6}$/i.test(node.props.textShadowColor) ? node.props.textShadowColor : "#000000";
      const decl = [
        spacing ? `letter-spacing: ${spacing}px` : "",
        line ? `line-height: ${line}px` : "",
        weight ? `font-weight: ${weight}` : "",
        shadow ? `text-shadow: 0 1px 3px ${color}66` : "",
      ].filter(Boolean);
      if (decl.length) rules.push(`[data-miditor-id="${node.id}"] { ${decl.map(value => `${value} !important;`).join(" ")} }`);
    }
    node.children.forEach(visit);
  };
  visit(root);
  return rules.join("\n");
}
