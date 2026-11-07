import { describe, expect, it } from "vitest";
import { isValidSlug } from "./slug";

describe("isValidSlug", () => {
  it("accepts lower-case words joined by single hyphens, 3 to 60 characters", () => {
    for (const ok of ["minh-lan", "le-cuoi-2027", "abc", "a1b", "x".repeat(60)]) expect(isValidSlug(ok), ok).toBe(true);
  });
  it("rejects what the server rejects", () => {
    for (const bad of ["", "ab", "Minh-Lan", "minh lan", "-minh", "minh-", "minh--lan", "lễ-cưới", "x".repeat(61)]) expect(isValidSlug(bad), bad).toBe(false);
  });
});
