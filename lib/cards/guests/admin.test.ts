import { describe, expect, it } from "vitest";
import { guestLink, guestsCsv, MAX_PER_REQUEST, openedLabel, parseGuestLines } from "./admin";

describe("parseGuestLines", () => {
  it("reads one guest per line with an optional greeting and invite", () => {
    const result = parseGuestLines("Anh Nam\n\nChị Lan | Mừng chị đến\r\nBác Hai | Chào bác | Mời bác dự tiệc\n");
    expect(result.guests).toEqual([{ name: "Anh Nam" }, { name: "Chị Lan", greeting: "Mừng chị đến" }, { name: "Bác Hai", greeting: "Chào bác", inviteMessage: "Mời bác dự tiệc" }]);
    expect(result.skipped).toBe(0);
  });

  it("skips lines without a name or with a name that is too long", () => {
    const result = parseGuestLines(`| chỉ có lời chào\n${"a".repeat(81)}\nHợp lệ`);
    expect(result.guests).toEqual([{ name: "Hợp lệ" }]);
    expect(result.skipped).toBe(2);
  });

  it("keeps the first 200 guests and counts the rest", () => {
    const result = parseGuestLines(Array.from({ length: MAX_PER_REQUEST + 5 }, (_, i) => `Khách ${i}`).join("\n"));
    expect(result.guests).toHaveLength(MAX_PER_REQUEST);
    expect(result.overflow).toBe(5);
  });
});

describe("guestLink", () => {
  it("builds the personal link of a guest", () => {
    expect(guestLink("https://cardmaking.test/", "thiep-hai", "ABCD2345")).toBe("https://cardmaking.test/thiep/thiep-hai?g=ABCD2345");
  });
});

describe("guestsCsv", () => {
  it("writes name and link, quoting commas and neutralising spreadsheet formulas", () => {
    const csv = guestsCsv([{ name: "Anh, Nam", code: "ABCD2345", greeting: null }, { name: "=SUM(A1)", code: "WXYZ6789", greeting: 'Chào "bác"' }], (code) => `https://x.test/thiep/s?g=${code}`);
    expect(csv.startsWith("﻿Tên,Link,Lời chào\r\n")).toBe(true);
    expect(csv).toContain('"Anh, Nam",https://x.test/thiep/s?g=ABCD2345,');
    expect(csv).toContain("'=SUM(A1)");
    expect(csv).toContain('"Chào ""bác"""');
  });
});

describe("openedLabel", () => {
  it("says a guest has not opened the link, or how many times", () => {
    expect(openedLabel({ openCount: 0, lastOpenedAt: null })).toBe("Chưa mở");
    expect(openedLabel({ openCount: 3, lastOpenedAt: "2026-11-16T03:00:00.000Z" })).toMatch(/^3 lần, lần cuối /);
  });
});
