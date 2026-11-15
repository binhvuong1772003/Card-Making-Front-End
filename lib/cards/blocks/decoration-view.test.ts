import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DecorationView } from "@/components/blocks/decoration-view";

const html = (motion: boolean) => renderToStaticMarkup(createElement(DecorationView, { src: "https://res.cloudinary.com/demo/image/upload/gift.png", alt: "Hộp quà", fit: "contain", motion }));

it("recolors the asset's alpha mask and keeps its description", () => {
  const out = renderToStaticMarkup(createElement(DecorationView, { src: "/demo/song-hy-xanh/chu-hy.webp", alt: "Chữ Song Hỷ", fit: "contain", motion: false, tintColor: "#d8efd5" }));
  expect(out).toContain('aria-label="Chữ Song Hỷ"');
  expect(out).toContain("background:#d8efd5");
  expect(out).toContain("mask-image:url(");
  expect(out).not.toContain("<img");
});

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

describe("idle effects of a Decoration", () => {
  const view = (idle: "Đập" | "Ánh sáng quét", src = "https://res.cloudinary.com/demo/image/upload/seal.png") =>
    renderToStaticMarkup(createElement(DecorationView, { src, alt: "", fit: "contain", motion: false, idle, shineRadius: 24 }));

  it("beats twice in 1.3s with a pulsing glow", () => {
    const out = view("Đập");
    expect(out).toContain("cm-heartbeat 1.3s ease-in-out infinite");
    expect(out).toContain("cm-heartbeat-glow 1.3s ease-in-out infinite");
    expect(out).toContain("14% { scale: 1.16; }");
  });

  it("sweeps a 23% wide light stripe every 3s inside the rounded box, with or without a picture", () => {
    const out = view("Ánh sáng quét", "");
    expect(out).toContain("cm-shine-sweep 3s ease-in-out infinite");
    expect(out).toContain("width:23%");
    expect(out).toContain("border-radius:24px");
    expect(out).not.toContain("<img");
  });
});

describe("hover effects of a Decoration", () => {
  const view = (hoverEffect: "Không" | "Nảy lên" | "Bay lên rồi hiện lại" | "Pháo giấy", hoverGroup = "qua") =>
    renderToStaticMarkup(createElement(DecorationView, { src: "https://res.cloudinary.com/demo/image/upload/box.png", alt: "", fit: "contain", motion: false, hoverEffect, hoverGroup }));

  it("adds nothing when the effect is off", () => {
    expect(view("Không")).not.toContain("data-cm-hg");
  });

  it("pops the box like the template, shared by group", () => {
    const out = view("Nảy lên");
    expect(out).toContain('data-cm-hg="qua"');
    expect(out).toContain("cubic-bezier(.34, 1.56, .64, 1)");
    expect(out).toContain('body:has([data-cm-hg="qua"]:hover)');
  });

  it("flies small pieces up and back", () => {
    expect(view("Bay lên rồi hiện lại")).toContain("cm-hover-fly");
  });

  it("shoots eight confetti pieces", () => {
    expect(view("Pháo giấy").match(/--cm-cx:/g)).toHaveLength(8);
  });

  it("keeps only safe characters in the group name", () => {
    expect(view("Nảy lên", 'a"]{x')).toContain('data-cm-hg="ax"');
  });
});
