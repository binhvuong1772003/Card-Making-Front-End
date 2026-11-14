import { builtInRegistry, validatePage, validateRegistry, type JsonValue, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { blankCardPage, type PageNavigation } from "./document";
import { fromEditorPage, NAVIGATION_PROP, navigationComponents, toEditorPage } from "./editor-navigation";

const pageWith = (nodes: TreeNode[]) => {
  const page = blankCardPage();
  return { ...page, data: { ...page.data, root: { ...page.data.root, children: nodes } } };
};
const text = (id: string, props: Record<string, JsonValue> = {}, children: TreeNode[] = []): TreeNode => ({ id, type: "Text", props, children } as unknown as TreeNode);
const action = (targetPageId: string): PageNavigation => ({ type: "go-to-page", targetPageId, transition: "slide-left", durationMs: 500 });

describe("editor navigation codec", () => {
  it("adds a native custom field only to eligible built-in definitions and validates", () => {
    expect(validateRegistry(navigationComponents)).toEqual([]);
    expect(validateRegistry({ ...builtInRegistry, ...navigationComponents })).toEqual([]);
    expect(navigationComponents.Text?.defaultProps[NAVIGATION_PROP]).toBeNull();
    expect(navigationComponents.Text?.fields[NAVIGATION_PROP]).toMatchObject({ type: "custom", kind: "card-navigation" });
    expect(navigationComponents.Root?.fields[NAVIGATION_PROP]).toBeUndefined();
  });

  it("round trips existing interactions and ordinary page data without private props", () => {
    const first = blankCardPage("first");
    const target = blankCardPage("target");
    const page = pageWith([text("button", { text: "Go", [NAVIGATION_PROP]: "stale" })]);
    const cleanData = { ...page.data, root: { ...page.data.root, children: [text("button", { text: "Go" })] } };
    const original = { ...page, data: cleanData, interactions: { button: { ...action(target.id) } } };
    const encoded = toEditorPage(original);
    expect(encoded.root.children[0]!.props[NAVIGATION_PROP]).toEqual(original.interactions.button);
    expect(validatePage(navigationComponents, encoded)).toEqual([]);
    const decoded = fromEditorPage(encoded, [first, target]);
    expect(decoded).toEqual({ data: cleanData, interactions: original.interactions });
    expect(JSON.stringify(decoded.data)).not.toContain(NAVIGATION_PROP);
  });

  it("round trips open-popup actions without private props", () => {
    const target = blankCardPage("target");
    const page = { ...pageWith([text("gift")]), interactions: { gift: { type: "open-popup" as const, targetPageId: target.id, transition: "fade" as const, durationMs: 450 } } };
    const encoded = toEditorPage(page);
    const decoded = fromEditorPage(encoded, [page, target]);
    expect(decoded.interactions.gift?.type).toBe("open-popup");
  });

  it("sets unbound, initial, and newly added eligible nodes to explicit null", () => {
    const page = pageWith([text("unbound")]);
    const encoded = toEditorPage(page);
    expect(encoded.root.children[0]!.props[NAVIGATION_PROP]).toBeNull();
    const newlyAdded = { ...encoded, root: { ...encoded.root, children: [...encoded.root.children, text("new")] } };
    expect(fromEditorPage(newlyAdded, [page]).interactions).toEqual({});
    expect(toEditorPage({ ...page, data: newlyAdded }).root.children[1]!.props[NAVIGATION_PROP]).toBeNull();
  });

  it("decodes nested group links and strips the field from phone props recursively", () => {
    const nested = text("inside", { [NAVIGATION_PROP]: action("target"), title: "ok" }, []);
    const group = { ...text("group", { [NAVIGATION_PROP]: action("target") }, [nested]), phoneProps: { color: "red", [NAVIGATION_PROP]: action("missing") } };
    const data = { ...pageWith([group]).data, root: { ...pageWith([group]).data.root, phoneProps: { [NAVIGATION_PROP]: "private", background: "blue" } } } as PageData;
    const decoded = fromEditorPage(data, [blankCardPage("target")]);
    expect(decoded.interactions).toEqual({ group: action("target"), inside: action("target") });
    expect(decoded.data.root.phoneProps).toEqual({ background: "blue" });
    expect(decoded.data.root.children[0]!.phoneProps).toEqual({ color: "red" });
    expect(decoded.data.root.children[0]!.children[0]!.props[NAVIGATION_PROP]).toBeUndefined();
  });

  it("drops links to missing pages and links on ineligible nodes while retaining unrelated props", () => {
    const ineligible = { ...text("form", { [NAVIGATION_PROP]: action("target"), text: "keep" }), type: "Form" };
    const page = pageWith([text("missing", { [NAVIGATION_PROP]: action("gone"), text: "keep" }), ineligible]);
    const decoded = fromEditorPage(page.data, [blankCardPage("target")]);
    expect(decoded.interactions).toEqual({});
    expect(decoded.data.root.children.map(node => node.props)).toEqual([{ text: "keep" }, { text: "keep" }]);
  });
});
