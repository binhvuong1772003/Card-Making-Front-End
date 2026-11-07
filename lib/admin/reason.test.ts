import { describe, expect, it } from "vitest";
import { rejectionReason, REJECTION_REASONS } from "./reason";

describe("rejectionReason", () => {
  it("is the chosen reason alone when there is no note", () => {
    expect(rejectionReason("Có thông tin cá nhân", "")).toBe("Có thông tin cá nhân");
    expect(rejectionReason("Có thông tin cá nhân", "   ")).toBe("Có thông tin cá nhân");
  });
  it("adds the note after the reason, trimmed", () => {
    expect(rejectionReason("Có thông tin cá nhân", "  Ảnh thứ hai có số điện thoại.  ")).toBe("Có thông tin cá nhân: Ảnh thứ hai có số điện thoại.");
  });
  it("never goes over the 500 characters the server accepts", () => {
    expect(rejectionReason("Khác", "x".repeat(900)).length).toBe(500);
  });
  it("offers the four reasons from the design", () => {
    expect(REJECTION_REASONS).toEqual(["Có thông tin cá nhân", "Nội dung không phù hợp", "Ảnh vi phạm bản quyền", "Khác"]);
  });
});
