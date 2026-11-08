import { describe, expect, it } from "vitest";
import { formKeyOf, newFormId } from "./form-id";

describe("form id", () => {
  it("makes ids that CMBE accepts as keys, and different each time", () => {
    const ids = new Set(Array.from({ length: 200 }, () => newFormId()));
    expect(ids.size).toBe(200);
    for (const id of ids) expect(formKeyOf(id, "n1")).toBe(id);
  });

  it("is built from the random source it is given", () => {
    expect(newFormId(() => 0)).toBe("f0000000000");
    expect(newFormId(() => 0.999999)).toBe("fzzzzzzzzzz");
  });

  it("falls back on the node id for pages from before formId, and for a bad value", () => {
    expect(formKeyOf(undefined, "n1")).toBe("n1");
    expect(formKeyOf("", "n1")).toBe("n1");
    expect(formKeyOf("a b", "n1")).toBe("n1");
    expect(formKeyOf("x".repeat(41), "n1")).toBe("n1");
    expect(formKeyOf(3, "n1")).toBe("n1");
  });
});
