import { describe, expect, it } from "vitest";
import { guestCodeFromSearch } from "./guest";

describe("guestCodeFromSearch", () => {
  it("reads and upper-cases the code of a guest link", () => {
    expect(guestCodeFromSearch("?g=abcd2345")).toBe("ABCD2345");
    expect(guestCodeFromSearch("?x=1&g=ABCD2345")).toBe("ABCD2345");
  });

  it("ignores missing codes and codes of the wrong shape", () => {
    expect(guestCodeFromSearch("")).toBeUndefined();
    expect(guestCodeFromSearch("?g=")).toBeUndefined();
    expect(guestCodeFromSearch("?g=short")).toBeUndefined();
    expect(guestCodeFromSearch("?g=ABCD1O0L")).toBeUndefined();
    expect(guestCodeFromSearch("?g=ABCD2345XYZ")).toBeUndefined();
  });
});
