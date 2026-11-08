import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api/errors";
import { formErrorMessage, formFieldErrors } from "./api";

const error = (status: number, code: string, details?: unknown) =>
  new ApiError(status, code as ApiError["code"], code, details);

describe("formErrorMessage", () => {
  it("tells the guest to check the network when the request never left", () => {
    expect(formErrorMessage(new ApiError(0, "NETWORK", "offline"))).toBe("Chưa gửi được, kiểm tra mạng rồi thử lại.");
  });

  it("asks the guest to slow down when the server rate limits", () => {
    expect(formErrorMessage(error(429, "RATE_LIMITED"))).toBe("Bạn gửi hơi nhanh, thử lại sau ít phút.");
  });

  it("says the card is full or the form is closed, by the reason the server gives", () => {
    expect(formErrorMessage(error(409, "CONFLICT", { reason: "FULL" }))).toBe("Thiệp này đã nhận đủ phản hồi.");
    expect(formErrorMessage(error(409, "CONFLICT", { reason: "CLOSED" }))).toBe("Đã hết hạn xác nhận.");
    expect(formErrorMessage(error(409, "CONFLICT"))).toBe("Chưa gửi được, thử lại sau.");
  });

  it("says the card is gone when the page is not published", () => {
    expect(formErrorMessage(error(404, "NOT_FOUND"))).toBe("Không tìm thấy thiệp này.");
  });

  it("keeps a general sentence for bad input or an unknown failure", () => {
    expect(formErrorMessage(error(400, "VALIDATION"))).toBe("Thông tin chưa đúng, bạn kiểm tra lại.");
    expect(formErrorMessage(new Error("boom"))).toBe("Chưa gửi được, thử lại sau.");
  });
});

describe("formFieldErrors", () => {
  it("puts a server validation error beside the field it names", () => {
    const err = error(400, "VALIDATION", [
      { path: "name", message: "Too small" },
      { path: "attending", message: "Invalid enum value" },
    ]);
    expect(formFieldErrors(err)).toEqual({ name: "Tên chưa đúng.", attending: "Chọn một câu trả lời." });
  });

  it("leaves out paths it does not know and errors that are not validation errors", () => {
    expect(formFieldErrors(error(400, "VALIDATION", [{ path: "blockId", message: "x" }]))).toEqual({});
    expect(formFieldErrors(error(429, "RATE_LIMITED"))).toEqual({});
    expect(formFieldErrors(new Error("boom"))).toEqual({});
  });
});
