import { newNode, type TreeNode } from "@miditor/core";
import { builtInRegistry } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { cardDefinitions } from "./definitions";
import { OPEN_EFFECT_TYPES, OPEN_EFFECTS, openCss, openDurationMs, openSteps } from "./open-effect";

const registry = { ...builtInRegistry, ...cardDefinitions };
const block = (id: string, props: Record<string, unknown>, type = "Shape"): TreeNode => {
  const node = newNode(registry, type, id, { w: 960, h: 900 }) as TreeNode;
  return { ...node, props: { ...node.props, ...props } } as TreeNode;
};
const page = (...children: TreeNode[]): TreeNode => ({ ...(newNode(registry, "Container", "root", { w: 960, h: 900 }) as TreeNode), children }) as TreeNode;

describe("the open effect fields", () => {
  it.each(OPEN_EFFECT_TYPES)("%s has the three fields and starts without an effect", (type) => {
    const def = cardDefinitions[type]!;
    expect(Object.keys(def.fields)).toEqual(expect.arrayContaining(["openEffect", "openTime", "openDelay"]));
    expect(def.defaultProps.openEffect).toBe("Giữ nguyên");
  });

  it("keeps the other block types untouched", () => {
    expect(cardDefinitions.Map!.fields).not.toHaveProperty("openEffect");
    expect(cardDefinitions.Form!.fields).not.toHaveProperty("openEffect");
  });
});

describe("openSteps", () => {
  it("ignores blocks that keep still, and unknown effect names", () => {
    const root = page(block("a", { openEffect: "Giữ nguyên" }), block("b", { openEffect: "Bay lên trời" }), block("c", { openEffect: "Mờ dần" }));
    expect(openSteps(root).map((step) => step.id)).toEqual(["c"]);
  });

  it("clamps time and delay to the allowed range", () => {
    const [step] = openSteps(page(block("a", { openEffect: "Mờ dần", openTime: 99, openDelay: -5 })));
    expect(step).toMatchObject({ time: 3, delay: 0 });
  });

  it("skips ids that could break out of a CSS selector", () => {
    expect(openSteps(page(block('x"] { color: red } [a="', { openEffect: "Mờ dần" })))).toEqual([]);
  });
});

describe("openDurationMs", () => {
  it("is when the last effect ends", () => {
    const root = page(block("a", { openEffect: "Mờ dần", openTime: 0.75, openDelay: 0.75 }), block("b", { openEffect: "Phóng ra rồi mờ dần", openTime: 1.3 }));
    expect(openDurationMs(root)).toBe(1500);
  });
  it("is 0 when nothing moves", () => expect(openDurationMs(page(block("a", {})))).toBe(0));
});

describe("openCss", () => {
  it("is empty without effects", () => expect(openCss(page(block("a", {})))).toBe(""));

  it("targets each block by id, only while the page is opening", () => {
    const css = openCss(page(block("seal", { openEffect: "Thu nhỏ rồi biến mất", openTime: 0.7 }), block("xi", { openEffect: "Phóng ra rồi mờ dần", openTime: 1.3, openDelay: 0.1 })));
    expect(css).toContain('[data-card-player-page][data-opening-target] [data-miditor-id="seal"] { animation: cm-open-shrink 0.7s ease-out 0s both !important; }');
    expect(css).toContain('[data-miditor-id="xi"] { animation: cm-open-burst 1.3s cubic-bezier(.45, .1, .85, .7) 0.1s both !important; }');
  });

  it("lets the outgoing page jump to its final state, and respects reduced motion", () => {
    const css = openCss(page(block("seal", { openEffect: "Mờ dần" })));
    expect(css).toContain('[data-opening-done] [data-miditor-id="seal"] { animation: cm-open-fade 0s linear 0s both !important; }');
    expect(css).toContain("prefers-reduced-motion");
  });

  it("uses every effect name that the fields offer", () => {
    for (const effect of OPEN_EFFECTS.filter((name) => name !== "Giữ nguyên")) expect(openCss(page(block("a", { openEffect: effect })))).toContain("cm-open-");
  });
});
