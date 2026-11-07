import { describe, expect, it } from "vitest";
import { formatEdited } from "./format";

const NOW = new Date("2026-11-07T12:00:00+07:00");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("formatEdited", () => {
  it("says just now under a minute", () => {
    expect(formatEdited(ago(20_000), NOW)).toBe("Vừa sửa");
  });
  it("counts minutes and hours", () => {
    expect(formatEdited(ago(5 * MIN), NOW)).toBe("Sửa 5 phút trước");
    expect(formatEdited(ago(2 * HOUR + 10 * MIN), NOW)).toBe("Sửa 2 giờ trước");
  });
  it("uses yesterday and days for the last week", () => {
    expect(formatEdited(ago(DAY + HOUR), NOW)).toBe("Sửa hôm qua");
    expect(formatEdited(ago(3 * DAY + HOUR), NOW)).toBe("Sửa 3 ngày trước");
  });
  it("falls back to a date after a week", () => {
    expect(formatEdited("2026-10-12T12:00:00", NOW)).toBe("Sửa 12/10");
  });
  it("never shows a future time as negative", () => {
    expect(formatEdited(ago(-5 * MIN), NOW)).toBe("Vừa sửa");
  });
});
