import { describe, expect, it } from "vitest";
import { offsetOf, slideLook } from "./album-math";

describe("offsetOf", () => {
  it("wraps around so 7 photos span -3..3 around the current one", () => {
    expect([0, 1, 2, 3, 4, 5, 6].map((i) => offsetOf(i, 2, 7))).toEqual([-2, -1, 0, 1, 2, 3, -3]);
  });

  it("is 0 for the only photo", () => {
    expect(offsetOf(0, 0, 1)).toBe(0);
  });

  it("covers every step once for an even count", () => {
    const seen = [0, 1, 2, 3].map((i) => offsetOf(i, 0, 4)).sort((a, b) => a - b);
    expect(seen).toEqual([-2, -1, 0, 1]);
  });
});

describe("slideLook", () => {
  it("leaves the middle photo flat, on top and fully opaque", () => {
    expect(slideLook(0)).toEqual({ visible: true, opacity: 1, zIndex: 100, transform: "translate(-50%, -50%)" });
  });

  it("tilts the next photo 45 degrees, pushes it back 150 px and shrinks it to 0.85", () => {
    const look = slideLook(1);
    expect(look.transform).toBe("translate(-50%, -50%) translate3d(60%, 0, -150px) rotateY(45deg) scale(0.85)");
    expect(look.opacity).toBe(0.75);
    expect(look.zIndex).toBe(99);
  });

  it("mirrors to the left", () => {
    expect(slideLook(-2).transform).toBe("translate(-50%, -50%) translate3d(-120%, 0, -300px) rotateY(-90deg) scale(0.7)");
  });

  it("keeps scale 0.7 and fades to 0.3 at three steps", () => {
    const look = slideLook(3);
    expect(look.opacity).toBe(0.3);
    expect(look.transform).toContain("scale(0.7)");
  });

  it("keeps the eighth coverflow slide visible at the far edge", () => {
    expect(slideLook(4)).toMatchObject({ visible: true, opacity: 0.3, zIndex: 96 });
    expect(slideLook(4).transform).toContain("translate3d(240%, 0, -600px) rotateY(180deg) scale(0.7)");
  });
});
