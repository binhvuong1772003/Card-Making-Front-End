import { describe, expect, it } from "vitest";
import { countdownParts, countdownTarget } from "./countdown";

describe("countdown", () => {
  it("reads the target in Vietnam time (UTC+7)", () => {
    expect(countdownTarget("2027-01-04", "17:30")).toBe(Date.UTC(2027, 0, 4, 10, 30));
    expect(countdownTarget("2027-01-04", "")).toBe(Date.UTC(2027, 0, 3, 17, 0));
  });

  it("rejects dates and times that are not valid", () => {
    expect(countdownTarget("04/01/2027", "17:30")).toBeUndefined();
    expect(countdownTarget("2027-01-04", "25:00")).toBeUndefined();
    expect(countdownTarget(undefined, "17:30")).toBeUndefined();
  });

  it("splits the time left into days, hours, minutes and seconds", () => {
    const target = Date.UTC(2027, 0, 4, 10, 30);
    const now = target - ((49 * 24 + 7) * 3600 + 12 * 60 + 48) * 1000;
    expect(countdownParts(target, now)).toEqual({ days: 49, hours: 7, minutes: 12, seconds: 48, done: false });
  });

  it("stops at zero once the moment has passed", () => {
    expect(countdownParts(1000, 5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });
});
