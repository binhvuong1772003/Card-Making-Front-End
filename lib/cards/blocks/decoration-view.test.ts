import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DecorationView } from "@/components/blocks/decoration-view";

const html = (motion: boolean) => renderToStaticMarkup(createElement(DecorationView, { src: "https://res.cloudinary.com/demo/image/upload/gift.png", alt: "Hộp quà", fit: "contain", motion }));

describe("the gift box (Decoration with motion)", () => {
  const out = html(true);

  it("sparkles four stars, 2s each, half a second apart", () => {
    expect(out.split("cm-gift-sparkle 2s linear").length - 1).toBe(4);
    for (const delay of ["0s", "0.5s", "1s", "1.5s"]) expect(out).toContain(`cm-gift-sparkle 2s linear ${delay} infinite`);
  });

  it("breathes the shadow over 3s and pulses the hint over 2s", () => {
    expect(out).toContain("cm-gift-shadow 3s linear infinite");
    expect(out).toContain("cm-gift-hint 2s linear infinite");
    expect(out).toContain("Nhấn để mở");
  });

  it("bobs the box and stars in their own wrapper, so the shadow and the hint stay still", () => {
    const bob = out.indexOf('data-gift-bob=""');
    expect(bob).toBeGreaterThan(out.indexOf('data-gift-shadow=""'));
    expect(out.indexOf('data-gift-hint=""')).toBeGreaterThan(out.indexOf("</svg></div>"));
  });

  it("stops moving when the visitor asked for less motion", () => {
    expect(out).toContain("prefers-reduced-motion");
  });

  it("draws a plain picture without the effects when motion is off", () => {
    const plain = html(false);
    expect(plain).not.toContain("cm-gift");
    expect(plain).toContain('alt="Hộp quà"');
  });
});
