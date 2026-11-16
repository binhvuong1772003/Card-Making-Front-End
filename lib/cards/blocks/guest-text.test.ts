import { describe, expect, it } from "vitest";
import { guestLine } from "./guest-text";

const props = (extra: Record<string, unknown> = {}) => ({ field: "Tên khách", prefix: "Thân mời", fallback: "Thân mời", ...extra });
const guest = { name: "Chị Lan", greeting: "Mừng chị đến", inviteMessage: "" };

describe("guestLine", () => {
  it("puts the prefix before the guest name", () => {
    expect(guestLine(props(), { mode: "live", guest })).toBe("Thân mời Chị Lan");
    expect(guestLine(props({ prefix: "" }), { mode: "live", guest })).toBe("Chị Lan");
  });

  it("shows the greeting without the prefix and falls back when the guest has none", () => {
    expect(guestLine(props({ field: "Lời chào riêng" }), { mode: "live", guest })).toBe("Mừng chị đến");
    expect(guestLine(props({ field: "Lời mời riêng", fallback: "Kính mời" }), { mode: "live", guest })).toBe("Kính mời");
  });

  it("uses the fallback on a public page opened without a guest link, and hides when it is empty", () => {
    expect(guestLine(props(), { mode: "live", slug: "x" })).toBe("Thân mời");
    expect(guestLine(props({ fallback: "" }), { mode: "live" })).toBe("");
  });

  it("shows sample text where there is no public page (editor, preview, thumbnails)", () => {
    expect(guestLine(props(), { mode: "edit" })).toBe("Thân mời Anh Nam");
    expect(guestLine(props(), undefined)).toBe("Thân mời Anh Nam");
    expect(guestLine(props({ field: "Lời mời riêng" }), { mode: "static" })).toContain("kính mời");
  });
});
