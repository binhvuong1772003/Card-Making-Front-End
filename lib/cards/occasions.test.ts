import { describe, expect, it } from "vitest";
import { occasionFromSlug, occasionSlug } from "./occasions";

describe("occasion slugs", () => {
  it("maps the three main occasions to readable paths and back", () => {
    expect(occasionSlug("WEDDING")).toBe("dam-cuoi");
    expect(occasionSlug("BIRTHDAY")).toBe("sinh-nhat");
    expect(occasionSlug("EVENT")).toBe("su-kien");
    for (const o of ["WEDDING", "BIRTHDAY", "EVENT"] as const) expect(occasionFromSlug(occasionSlug(o))).toBe(o);
  });
  it("returns undefined for anything else, including OTHER", () => {
    expect(occasionFromSlug("khac")).toBeUndefined();
    expect(occasionFromSlug("")).toBeUndefined();
    expect(occasionFromSlug("WEDDING")).toBeUndefined();
  });
});
