import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { LIMIT_TEXT, MAX_VERSIONS, SLUG_HELP, canAddVersion, publishErrorMessage, slugAllowed, versionTitle } from "./publish-form";

describe("publish form rules", () => {
  it("tells a full card from a taken link, both being 409", () => {
    expect(publishErrorMessage(new ApiError(409, "CONFLICT", "x", { reason: "LIMIT" }))).toBe(LIMIT_TEXT);
    expect(publishErrorMessage(new ApiError(409, "CONFLICT", "x"))).toMatch(/đã có người dùng/);
    expect(publishErrorMessage(new ApiError(400, "VALIDATION", "x"))).toBe(SLUG_HELP);
  });

  it("lets a new version leave the link empty but not a version that already has one", () => {
    expect(slugAllowed("", false)).toBe(true);
    expect(slugAllowed("", true)).toBe(false);
    expect(slugAllowed("nha-trai", true)).toBe(true);
    expect(slugAllowed("Nha Trai", false)).toBe(false);
  });

  it("stops adding at the limit", () => {
    expect(canAddVersion(MAX_VERSIONS - 1)).toBe(true);
    expect(canAddVersion(MAX_VERSIONS)).toBe(false);
  });

  it("names a version by its label, or by its place when it has none", () => {
    expect(versionTitle({ label: "Nhà trai", isMain: true }, 0)).toBe("Nhà trai");
    expect(versionTitle({ label: null, isMain: true }, 0)).toBe("Bản chính");
    expect(versionTitle({ label: null, isMain: false }, 2)).toBe("Bản 3");
  });
});
