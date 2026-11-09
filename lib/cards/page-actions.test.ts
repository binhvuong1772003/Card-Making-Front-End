import { describe, expect, it } from "vitest";
import type { TreeNode } from "@miditor/core";
import { blankCardPage } from "./document";
import { canNavigateFrom, normalizePageNavigation } from "./page-actions";

const node = (type: string, children: TreeNode[] = []) => ({ id: type, type, props: {}, styles: {}, children, position: { mode: "flow" } }) as TreeNode;

describe("page interactions", () => {
  it.each(["Image", "Text", "Shape", "Button", "Group"])("allows %s", (type) => expect(canNavigateFrom(node(type))).toBe(true));
  it("rejects forms and groups containing native form controls", () => {
    expect(canNavigateFrom(node("Form"))).toBe(false);
    expect(canNavigateFrom(node("Group", [node("Frame", [node("Input")])]))).toBe(false);
  });
  it("rejects missing targets and normalizes effect duration", () => {
    const pages = [blankCardPage("one"), blankCardPage("two")];
    expect(normalizePageNavigation({ targetPageId: "gone" }, pages)).toBeUndefined();
    expect(normalizePageNavigation({ targetPageId: "two", transition: "bogus" as never, durationMs: 7000 }, pages)).toEqual({ type: "go-to-page", targetPageId: "two", transition: "fade", durationMs: 1200 });
    expect(normalizePageNavigation({ targetPageId: "two", transition: "none", durationMs: 400 }, pages)?.durationMs).toBe(0);
  });
});
