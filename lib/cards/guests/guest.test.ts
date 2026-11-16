import { describe, expect, it } from "vitest";
import { guestCodeFromSearch, withGuestMetadata } from "./guest";

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

describe("withGuestMetadata", () => {
  it("adds the guest and the code to the metadata of a public page", () => {
    const guest = { name: "Chị Lan", greeting: "Mừng chị", inviteMessage: null };
    expect(withGuestMetadata({ mode: "live", slug: "s" }, "ABCD2345", guest)).toEqual({ mode: "live", slug: "s", guestCode: "ABCD2345", guest });
  });

  it("leaves metadata that is not an object alone", () => {
    const guest = { name: "A", greeting: null, inviteMessage: null };
    expect(withGuestMetadata(undefined, "ABCD2345", guest)).toBeUndefined();
    expect(withGuestMetadata(["x"], "ABCD2345", guest)).toEqual(["x"]);
  });
});
