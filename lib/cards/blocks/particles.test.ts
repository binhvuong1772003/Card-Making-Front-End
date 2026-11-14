import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ParticlesView, type ParticlesViewProps } from "@/components/blocks/particles-view";
import { cardDefinitions } from "./definitions";
import { PARTICLE_LIMITS, PARTICLE_SHAPES, particleSpecs, particlesBlock } from "./particles";

const base: ParticlesViewProps = { shape: "Vuông", color: "#e8f0e4", count: 5, size: 8, speed: 100, opacity: 50, drift: 20, editing: false };
const html = (props: Partial<ParticlesViewProps> = {}) => renderToStaticMarkup(createElement(ParticlesView, { ...base, ...props }));

describe("particleSpecs", () => {
  it("gives the same particles every time, so the server and the browser draw the same page", () => {
    expect(particleSpecs(12)).toEqual(particleSpecs(12));
  });

  it("keeps the first particles where they were when more are added", () => {
    expect(particleSpecs(20).slice(0, 8)).toEqual(particleSpecs(8));
  });

  it("keeps every number within the ranges measured on the reference page", () => {
    for (const p of particleSpecs(PARTICLE_LIMITS.count.max)) {
      expect(p.left).toBeGreaterThanOrEqual(0);
      expect(p.left).toBeLessThanOrEqual(100);
      expect(p.duration).toBeGreaterThanOrEqual(18);
      expect(p.duration).toBeLessThanOrEqual(26);
      expect(p.delay).toBeLessThanOrEqual(0);
      expect(p.delay).toBeGreaterThanOrEqual(-p.duration);
      expect(Math.abs(p.sway)).toBeLessThanOrEqual(1);
      expect(Math.abs(p.turn)).toBeLessThanOrEqual(1);
    }
  });

  it("picks a palette colour index for every particle", () => {
    for (const p of particleSpecs(40)) expect([0, 1, 2, 3]).toContain(p.pick);
  });

  it("clamps the count", () => {
    expect(particleSpecs(0)).toHaveLength(PARTICLE_LIMITS.count.min);
    expect(particleSpecs(999)).toHaveLength(PARTICLE_LIMITS.count.max);
  });
});

describe("the Particles block", () => {
  it("is registered, hidden from the Miditor library and starts on a valid shape", () => {
    expect(cardDefinitions.Particles).toBeDefined();
    expect(cardDefinitions.Particles!.hidden).toBe(true);
    expect(PARTICLE_SHAPES).toContain(particlesBlock.defaultProps.shape);
  });

  it("draws one span per particle and never takes clicks from the blocks under it", () => {
    const out = html({ count: 7 });
    expect(out.split('data-cm-particle=""').length - 1).toBe(7);
    expect(out).toContain("pointer-events:none");
  });

  it("slows the loop down when the speed is low", () => {
    const fast = html({ speed: 200, count: 1 }).match(/cm-particles-rise ([\d.]+)s/)![1]!;
    const slow = html({ speed: 50, count: 1 }).match(/cm-particles-rise ([\d.]+)s/)![1]!;
    expect(Number(slow)).toBeGreaterThan(Number(fast) * 3);
  });

  it("cuts each shape and shows the editor outline only while editing", () => {
    expect(html({ shape: "Tròn" })).toContain("border-radius:50%");
    expect(html({ shape: "Sao" })).toContain("clip-path:polygon(");
    expect(html({ shape: "Tim" })).toContain("mask-image");
    expect(html({ editing: false })).not.toContain("dashed");
    expect(html({ editing: true })).toContain("dashed");
  });

  it("draws the glyph shape as text, one colour per particle from the palette", () => {
    const out = html({ shape: "Chữ", char: "囍", palette: "Đỏ vàng", count: 12 });
    expect(out.split(">囍</span>").length - 1).toBe(12);
    expect(out).toContain("text-shadow");
    expect(out).toContain("#ff6b6b");
    expect(html({ shape: "Chữ", char: "囍" })).toContain("color:#e8f0e4");
  });

  it("stops moving when the visitor asked for less motion", () => {
    expect(html()).toContain("prefers-reduced-motion");
  });
});
