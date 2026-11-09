import { describe, expect, it } from "vitest";
import { emptyPage } from "@miditor/core";
import { blankCardPage, getStartPage, normalizeCardDocument } from "./document";

describe("card document", () => {
  it("wraps legacy page data without changing it", () => {
    const page = { ...emptyPage(), root: { ...emptyPage().root, id: "legacy-root" } };
    const result = normalizeCardDocument(page);
    expect(result.pages[0]).toMatchObject({ id: "page-1", data: page, interactions: {} });
  });

  it("upgrades legacy form blocks and materializes their response keys", () => {
    const page = emptyPage();
    const form = { ...page.root, id: "legacy-form", type: "Form", props: { ...page.root.props } };
    const result = normalizeCardDocument({ ...page, root: { ...page.root, children: [form] } });
    expect(result.pages[0]!.data.root.children[0]).toMatchObject({ type: "Form", id: "legacy-form", props: { formId: "legacy-form" } });
  });

  it("matches backend form-key repair for duplicate legacy form IDs", () => {
    const page = emptyPage();
    const first = { ...page.root, id: "n1", type: "Form", props: { ...page.root.props, formId: "f_abc" } };
    const second = { ...page.root, id: "n2", type: "Form", props: { ...page.root.props, formId: "f_abc" } };
    const legacy = { ...page, root: { ...page.root, children: [first, second] } };
    const normalized = normalizeCardDocument(legacy);
    expect(normalized.pages[0]!.data.root.children.map((node) => node.props.formId)).toEqual(["f_abc", "f_abc_n2"]);
  });

  it("repairs nested legacy forms in backend traversal order", () => {
    const page = emptyPage();
    const child = { ...page.root, id: "nested", type: "Form", props: { formId: "f_nested" } };
    const parent = { ...page.root, id: "parent", type: "Form", props: { formId: "f_nested" }, children: [child] };
    const legacy = { ...page, root: { ...page.root, children: [parent] } };
    const normalized = normalizeCardDocument(legacy);
    const result = normalized.pages[0]!.data.root.children[0]!;
    expect([result.props.formId, result.children[0]!.props.formId]).toEqual(["f_nested", "f_nested_nested"]);
  });

  it("rejects duplicate form IDs across pages in a card envelope", () => {
    const page = emptyPage();
    const form = { ...page.root, id: "form", type: "Form", props: { ...page.root.props, formId: "f_shared" } };
    const data = { ...page, root: { ...page.root, children: [form] } };
    const document = { kind: "card" as const, version: 1 as const, startPageId: "a", pages: [
      { id: "a", name: "A", data, interactions: {} },
      { id: "b", name: "B", data, interactions: {} },
    ] };
    expect(() => normalizeCardDocument(document)).toThrow(/biểu mẫu/i);
  });

  it("rejects malformed page trees and navigation bindings on the page root", () => {
    const malformed = { kind: "card" as const, version: 1 as const, startPageId: "a", pages: [
      { id: "a", name: "A", data: { schemaVersion: 1, root: { id: "root", type: "Page", position: { mode: "flow" }, children: "bad" } } as never, interactions: {} },
    ] };
    const page = emptyPage();
    const linkedRoot = { kind: "card" as const, version: 1 as const, startPageId: "a", pages: [
      { id: "a", name: "A", data: page, interactions: { [page.root.id]: { type: "go-to-page" as const, targetPageId: "a", transition: "fade" as const, durationMs: 450 } } },
    ] };
    expect(() => normalizeCardDocument(malformed)).toThrow(/cây/i);
    expect(() => normalizeCardDocument(linkedRoot)).toThrow(/liên kết/i);
  });

  it("creates one empty page for an empty document", () => {
    const result = normalizeCardDocument({});
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]).toMatchObject({ id: "page-1", name: "Trang 1" });
    expect(result.pages[0].data.root.styles).toMatchObject({ minHeight: 640, phoneMinHeight: 812 });
  });

  it("is stable and returns the configured start page", () => {
    const document = { kind: "card" as const, version: 1 as const, startPageId: "b", pages: [blankCardPage("a"), blankCardPage("b")] };
    expect(normalizeCardDocument(normalizeCardDocument(document))).toEqual(normalizeCardDocument(document));
    expect(getStartPage(document).id).toBe("b");
  });
});
