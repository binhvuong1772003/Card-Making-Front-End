import { builtInRegistry, emptyPage, newNode, type FreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { cardDefinitions } from "./blocks/definitions";
import { groupSections, layerLabel, nameLayers } from "./layers";

const registry = { ...builtInRegistry, ...cardDefinitions };
const SIZE = { w: 960, h: 900 };
const node = (type: string, id: string, y: number): FreeNode => {
  const value = newNode(registry, type, id, SIZE, {}) as FreeNode;
  return { ...value, position: { mode: "free", x: { anchor: "start", offset: 10 }, y: { anchor: "start", offset: y } }, size: { w: { kind: "px", v: 100 }, h: { kind: "px", v: 40 } } };
};
const pageOf = (children: FreeNode[]) => ({ ...emptyPage().root, children });

describe("layerLabel", () => {
  it("reads a block id as words", () => {
    expect(layerLabel("gift-mini-3")).toBe("Quà nhỏ 3");
    expect(layerLabel("flower-left-upper")).toBe("Hoa trái trên");
    expect(layerLabel("zzz")).toBe("Zzz");
  });
});

describe("nameLayers", () => {
  it("names blocks that are not text and keeps a name that is already there", () => {
    const named = { ...node("Decoration", "b", 0), props: { ...node("Decoration", "b", 0).props, layerName: "Của tôi" } };
    const root = nameLayers(pageOf([node("Decoration", "gift-box", 0), node("Text", "t", 50), named]));
    expect(root.children[1]!.props.layerName ?? "").toBe("");
    expect(root.children[2]!.props.layerName).toBe("Của tôi");
    expect(root.children[0]!.props.layerName).toBe("Quà box");
  });
});

describe("groupSections", () => {
  it("gathers a run of three or more blocks of one section into a named group", () => {
    const root = pageOf([node("Shape", "bg", 0), node("Shape", "hero-a", 10), node("Shape", "hero-b", 20), node("Shape", "hero-c", 30), node("Shape", "end", 900)]);
    const grouped = groupSections(root, [{ name: "Đầu trang", has: (id) => id.startsWith("hero-") }], { w: 960, h: 900 });
    expect(grouped.children.map((child) => child.type)).toEqual(["Shape", "Group", "Shape"]);
    const group = grouped.children[1]!;
    expect(group.props.name).toBe("Đầu trang");
    expect(group.children.map((child) => child.id)).toEqual(["hero-a", "hero-b", "hero-c"]);
  });
  it("leaves a short run alone", () => {
    const root = pageOf([node("Shape", "hero-a", 10), node("Shape", "hero-b", 20)]);
    expect(groupSections(root, [{ name: "x", has: (id) => id.startsWith("hero-") }], { w: 960, h: 900 })).toBe(root);
  });
});
