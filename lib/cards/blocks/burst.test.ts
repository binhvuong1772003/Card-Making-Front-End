import { describe, expect, it } from "vitest";
import { BURST_LIMITS, BURST_PALETTES, burstParticles, readBurstConfig } from "./burst";

const config = readBurstConfig({});

describe("readBurstConfig", () => {
  it("defaults to the reference page: 32 glyphs 囍, 420px, 0.5s, green", () => {
    expect(config).toEqual({ char: "囍", count: 32, spread: 420, delay: 0.5, palette: "Xanh lá" });
  });
  it("clamps numbers, keeps two characters at most and falls back on unknown palettes", () => {
    expect(readBurstConfig({ count: 999, spread: 1, delay: -4, char: "♥✦★", palette: "Cầu vồng" })).toEqual({ char: "♥✦", count: BURST_LIMITS.count.max, spread: BURST_LIMITS.spread.min, delay: 0, palette: "Xanh lá" });
    expect(readBurstConfig({ char: "" }).char).toBe("囍");
  });
});

describe("burstParticles", () => {
  const particles = burstParticles(config, 12345);
  it("gives the same particles for the same seed and different ones for another", () => {
    expect(burstParticles(config, 12345)).toEqual(particles);
    expect(burstParticles(config, 54321)).not.toEqual(particles);
  });
  it("makes the configured count", () => expect(particles).toHaveLength(32));
  it("keeps every number inside the ranges measured on the reference page", () => {
    for (const p of burstParticles({ ...config, count: 60 }, 7)) {
      const distance = Math.hypot(p.dx, p.dy);
      expect(distance).toBeGreaterThanOrEqual(120 - 0.001);
      expect(distance).toBeLessThanOrEqual(420 + 0.001);
      expect(Math.abs(p.rotStart)).toBeLessThanOrEqual(15);
      expect(Math.abs(p.rotEnd)).toBeLessThanOrEqual(180);
      expect(p.size).toBeGreaterThanOrEqual(10);
      expect(p.size).toBeLessThanOrEqual(26);
      expect(p.delay).toBeGreaterThanOrEqual(0);
      expect(p.delay).toBeLessThanOrEqual(0.15);
      expect(BURST_PALETTES["Xanh lá"]).toContain(p.color);
    }
  });
  it("sends them in every direction, not into one corner", () => {
    const angles = burstParticles({ ...config, count: 60 }, 3).map((p) => Math.atan2(p.dy, p.dx));
    expect(Math.min(...angles)).toBeLessThan(-2);
    expect(Math.max(...angles)).toBeGreaterThan(2);
  });
  it("uses the chosen palette", () => {
    const red = burstParticles({ ...config, palette: "Đỏ vàng" }, 1);
    expect(red.every((p) => (BURST_PALETTES["Đỏ vàng"] as readonly string[]).includes(p.color))).toBe(true);
  });
});
