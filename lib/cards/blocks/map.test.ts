import { builtInRegistry, emptyPage, insertNode, newNode, validatePage, validateRegistry, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { mapBlock, RETIRED_MAP_PROPS } from "./map";

const registry = { ...builtInRegistry, Map: mapBlock };

function pageWith(props: Record<string, unknown>): PageData {
  const node = newNode(registry, "Map", "m1", { w: 680, h: 788 }) as TreeNode;
  const page = emptyPage();
  const withProps = { ...node, props: { ...node.props, ...props } } as TreeNode;
  return { ...page, root: insertNode(page.root, "root", withProps) };
}

describe("the Map block", () => {
  it("has a definition the registry check accepts", () => {
    expect(validateRegistry(registry)).toEqual([]);
  });

  it("arrives with a thin border from the library's own Border section, not a frame of its own", () => {
    const node = newNode(registry, "Map", "m1", { w: 680, h: 788 }) as TreeNode;
    expect(node.styles).toEqual({ borderWidth: 1, borderColor: "#511419", borderRadius: 4 });
    expect(Object.keys(mapBlock.fields)).not.toContain("borderWidth");
  });

  it("keeps a page with a place valid", () => {
    expect(validatePage(registry, pageWith({ name: "White Palace", address: "Hoàng Văn Thụ", innerFrame: false }))).toEqual([]);
  });

  it("refuses numbers out of range", () => {
    expect(validatePage(registry, pageWith({ zoom: 99 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ padding: 99 })).length).toBeGreaterThan(0);
  });

  it("refuses the props it no longer has, which is why CMBE drops them from saved pages", () => {
    for (const prop of RETIRED_MAP_PROPS) {
      expect(validatePage(registry, pageWith({ [prop]: 1 })).length, prop).toBeGreaterThan(0);
    }
  });
});
