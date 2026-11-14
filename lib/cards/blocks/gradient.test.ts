import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GradientView } from "@/components/blocks/gradient-view";
import { gradientCss, readGradient } from "./gradient";

describe("the gradient block", () => {
  it("defaults to the reference cover: diagonal dark red in three colours", () => {
    expect(gradientCss(readGradient({}))).toBe("linear-gradient(to right bottom, #5a0000, #400000, #2a0000)");
  });
  it("falls back on bad colours and unknown directions", () => {
    expect(readGradient({ from: "red", direction: "Xoáy" })).toMatchObject({ from: "#5a0000", direction: "Chéo xuống phải" });
  });
  it("draws a radial gradient from the centre", () => {
    expect(gradientCss(readGradient({ direction: "Toả tròn", from: "#111111", mid: "#222222", to: "#333333" }))).toBe("radial-gradient(circle at center, #111111, #222222, #333333)");
  });
  it("fills its box", () => {
    const html = renderToStaticMarkup(createElement(GradientView, { config: readGradient({}) }));
    expect(html).toContain("linear-gradient(to right bottom, #5a0000, #400000, #2a0000)");
    expect(html).toContain("width:100%");
  });
});
