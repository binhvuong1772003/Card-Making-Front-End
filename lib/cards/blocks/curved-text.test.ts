import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { cardDefinitions } from "./definitions";
import { CurvedText } from "./text-effects";
import { CURVE_LIMITS, curvedTextBlock } from "./curved-text";

describe("the Curved text block", () => {
  it("is available in the editor library and starts curved upwards", () => {
    expect(cardDefinitions.CurvedText).toBeDefined();
    expect(cardDefinitions.CurvedText!.hidden).toBe(false);
    expect(curvedTextBlock.defaultProps.amount).toBeGreaterThan(0);
  });

  it("fits a circular arc to its box without changing the legacy free curve", () => {
    const html = renderToStaticMarkup(createElement(CurvedText, { value: "LOVE NEVER FAILS", amount: 90, size: 18, bold: false, italic: false, underline: false, circular: true, radius: 105, letterSpacing: 0.22 }));
    expect(html).toContain('viewBox="0 0 286 143"');
    expect(html).toContain(" A 150.15 150.15 ");
    expect(html).toContain('letter-spacing="0.22em"');
    expect(html).not.toContain(" Q ");
  });

  it("limits the bend and the size", () => {
    expect(cardDefinitions.CurvedText!.fields.amount).toMatchObject({ min: CURVE_LIMITS.amount.min, max: CURVE_LIMITS.amount.max });
    expect(cardDefinitions.CurvedText!.fields.size).toMatchObject({ min: CURVE_LIMITS.size.min, max: CURVE_LIMITS.size.max });
  });

  it("draws the words along a path, with the apex above the ends when the amount is positive", () => {
    const html = renderToStaticMarkup(createElement(CurvedText, { value: "LOVE NEVER FAILS", amount: 90, size: 18, bold: false, italic: false, underline: false }));
    expect(html).toContain("<textPath");
    expect(html).toContain("LOVE NEVER FAILS");
    const control = Number(html.match(/Q [\d.]+ (-?[\d.]+) /)![1]);
    const baseline = Number(html.match(/M 0 ([\d.]+) Q/)![1]);
    expect(control).toBeLessThan(baseline);
  });
});
