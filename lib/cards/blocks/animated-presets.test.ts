import { builtInRegistry, newNode, validatePage, emptyPage, insertNode, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { cardDefinitions } from "./definitions";
import { ANIMATED_GROUPS, animatedPresets, matchPresets } from "./animated-presets";

const registry = { ...builtInRegistry, ...cardDefinitions };

describe("the animated presets", () => {
  it("fill every group, with unique ids", () => {
    for (const group of ANIMATED_GROUPS) expect(animatedPresets.some((preset) => preset.group === group)).toBe(true);
    expect(new Set(animatedPresets.map((preset) => preset.id)).size).toBe(animatedPresets.length);
  });

  it.each(animatedPresets)("$id: a block added with its settings is a valid page", (preset) => {
    const base = newNode(registry, preset.type, "b1", { w: 960, h: 900 }, { props: preset.props }) as TreeNode;
    const page = emptyPage();
    const filled: PageData = { ...page, root: insertNode(page.root, "root", base) };
    expect(validatePage(registry, filled)).toEqual([]);
  });

  it("put the particles in Nền động, the Hỷ in Song Hỷ and the gift in Quà mừng", () => {
    const groupOf = (id: string) => animatedPresets.find((preset) => preset.id === id)?.group;
    expect(groupOf("particles-heart")).toBe("Nền động");
    expect(groupOf("xi-burst")).toBe("Song Hỷ");
    expect(groupOf("gift-box")).toBe("Quà mừng");
  });

  it("give the Hỷ an effect for the opening of the card", () => {
    expect(animatedPresets.find((preset) => preset.id === "xi-burst")!.props.openEffect).toBe("Phóng ra rồi mờ dần");
    expect(animatedPresets.find((preset) => preset.id === "xi-seal")!.props.openEffect).toBe("Thu nhỏ rồi biến mất");
  });
});

describe("matchPresets", () => {
  it("returns everything for an empty search", () => expect(matchPresets("  ")).toHaveLength(animatedPresets.length));
  it("ignores accents and case", () => {
    expect(matchPresets("TIM").map((preset) => preset.id)).toContain("particles-heart");
    expect(matchPresets("qua").map((preset) => preset.id)).toContain("gift-box");
    expect(matchPresets("hy").map((preset) => preset.group)).toContain("Song Hỷ");
  });
  it("finds nothing for a word that matches nothing", () => expect(matchPresets("xyz123")).toEqual([]));
});
