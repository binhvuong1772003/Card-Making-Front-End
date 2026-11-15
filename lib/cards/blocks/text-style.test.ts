import { describe, expect, it } from "vitest";
import { emptyPage, type TreeNode } from "@miditor/core";
import { textStyleCss } from "./text-style";

const text = (id: string, props: Record<string, unknown>) => ({ id, type: "Text", props, children: [] }) as unknown as TreeNode;

describe("textStyleCss", () => {
  it("writes one rule per Text that sets spacing, line height, weight or shadow", () => {
    const root = { ...emptyPage().root, children: [text("a", { letterSpacing: 3.5 }), text("b", { fontWeight: "500", lineHeight: 28 }), text("c", {})] } as TreeNode;
    const css = textStyleCss(root);
    expect(css).toContain('[data-miditor-id="a"] { letter-spacing: 3.5px !important; }');
    expect(css).toContain('[data-miditor-id="b"] { line-height: 28px; font-weight: 500 !important; }');
    expect(css).not.toContain('"c"');
  });
  it("ignores unsafe ids, other types and out-of-range values", () => {
    const root = { ...emptyPage().root, children: [text('x"] {', { letterSpacing: 2 }), text("d", { letterSpacing: 999 })] } as TreeNode;
    const css = textStyleCss(root);
    expect(css.split("\n")).toHaveLength(1);
    expect(css).toContain("letter-spacing: 20px");
  });
});
