import { describe, expect, it } from "vitest";
import type { TreeNode } from "@miditor/core";
import { blankCardPage } from "./document";
import { canNavigateFrom, normalizePageNavigation, normalizePopupSettings } from "./page-actions";

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
  it("normalizes popup settings and limits custom widths", () => {
    expect(normalizePopupSettings({ width: 1400, effect: "zoom", backdropColor: "#123456", backdropOpacity: 35 })).toEqual({ width: 1200, effect: "zoom", backdropColor: "#123456", backdropOpacity: 35 });
    expect(normalizePopupSettings({ width: "wide" as never, effect: "bogus" as never, backdropColor: "red", backdropOpacity: 200 })).toEqual({ width: 640, effect: "fade", backdropColor: "#17251e", backdropOpacity: 80 });
  });
  it("keeps legacy page links and supports opening a page as a popup", () => {
    const pages = [blankCardPage("one"), blankCardPage("two")];
    expect(normalizePageNavigation({ type: "go-to-page", targetPageId: "two" }, pages)?.type).toBe("go-to-page");
    expect(normalizePageNavigation({ type: "open-popup", targetPageId: "two" }, pages)?.type).toBe("open-popup");
  });
});
