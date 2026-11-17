import { describe, expect, it } from "vitest";
import { emptyPage, type TreeNode } from "@miditor/core";
import { textStyleCss } from "./text-style";

const text = (id: string, props: Record<string, unknown>) => ({ id, type: "Text", props, children: [] }) as unknown as TreeNode;

describe("textStyleCss", () => {
  it("writes one rule per Text that sets spacing, line height, weight or shadow", () => {
    const root = { ...emptyPage().root, children: [text("a", { letterSpacing: 3.5 }), text("b", { fontWeight: "500", lineHeight: 28 }), text("c", {})] } as TreeNode;
    const css = textStyleCss(root);
    expect(css).toContain('[data-miditor-id="a"] { letter-spacing: 3.5px !important; }');
    expect(css).toContain('[data-miditor-id="b"] { line-height: 28px !important; font-weight: 500 !important; }');
    expect(css).not.toContain('"c"');
  });
  it("overrides the renderer inline style for every requested typography property", () => {
    const root = { ...emptyPage().root, children: [text("source-text", { letterSpacing: 0.54, lineHeight: 40.5, fontWeight: "600", textShadow: "Nhẹ" })] } as TreeNode;
    const css = textStyleCss(root);
    expect(css).toContain("letter-spacing: 0.54px !important;");
    expect(css).toContain("line-height: 40.5px !important;");
    expect(css).toContain("font-weight: 600 !important;");
    expect(css).toContain("text-shadow: 0 1px 3px #00000066 !important;");
  });
  it("ignores unsafe ids, other types and out-of-range values", () => {
    const root = { ...emptyPage().root, children: [text('x"] {', { letterSpacing: 2 }), text("d", { letterSpacing: 999 })] } as TreeNode;
    const css = textStyleCss(root);
    expect(css.split("\n")).toHaveLength(1);
    expect(css).toContain("letter-spacing: 20px");
  });
});
