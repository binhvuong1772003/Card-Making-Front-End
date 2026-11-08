import { describe, expect, it, vi } from "vitest";
import { API_URL } from "@/lib/api/config";
import { fetchGuestbook, submitGuestbook, validateGuestbook } from "./guestbook";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("validateGuestbook", () => {
  it("accepts a name and a wish", () => {
    expect(validateGuestbook({ name: "An", message: "Chúc mừng hạnh phúc!" })).toEqual({});
  });

  it("wants both the name and the wish", () => {
    expect(validateGuestbook({ name: " ", message: "Chúc mừng" })).toEqual({ name: "Nhập tên của bạn." });
    expect(validateGuestbook({ name: "An", message: "  " })).toEqual({ message: "Nhập lời chúc." });
  });

  it("keeps the name under 60 and the wish under 500 characters", () => {
    expect(validateGuestbook({ name: "a".repeat(61), message: "x" })).toHaveProperty("name");
    expect(validateGuestbook({ name: "An", message: "a".repeat(501) })).toHaveProperty("message");
    expect(validateGuestbook({ name: "a".repeat(60), message: "a".repeat(500) })).toEqual({});
  });
});

describe("submitGuestbook", () => {
  it("posts the wish and hides the honeypot", async () => {
    const entry = { id: "e1", name: "An", message: "Chúc mừng", createdAt: "2026-11-07T10:00:00.000Z" };
    const fetchMock = vi.fn<typeof fetch>(async () => json(201, { id: "e1", status: "VISIBLE", entry }));
    await expect(
      submitGuestbook({ slug: "thiep-cuoi", blockId: "b1", name: "An", message: "Chúc mừng" }, fetchMock as unknown as typeof fetch),
    ).resolves.toEqual({ id: "e1", status: "VISIBLE", entry });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(`${API_URL}/api/v1/publications/thiep-cuoi/guestbook`);
    expect(JSON.parse(String(init?.body))).toEqual({ blockId: "b1", name: "An", message: "Chúc mừng", website: "" });
  });

  it("keeps a wish waiting for approval, with no entry to show", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(201, { id: "e1", status: "PENDING", entry: null }));
    await expect(
      submitGuestbook({ slug: "s", blockId: "b", name: "An", message: "Chúc mừng" }, fetchMock as unknown as typeof fetch),
    ).resolves.toEqual({ id: "e1", status: "PENDING", entry: null });
  });
});

describe("fetchGuestbook", () => {
  const page = {
    entries: [{ id: "e1", name: "An", message: "Chúc mừng", createdAt: "2026-11-07T10:00:00.000Z" }],
    nextCursor: "next",
    total: 6,
  };

  it("asks for the first page of visible wishes", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(200, page));
    await expect(fetchGuestbook({ slug: "thiep-cuoi", blockId: "b1", first: 5 }, fetchMock as unknown as typeof fetch)).resolves.toEqual(page);
    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(url.origin + url.pathname).toBe(`${API_URL}/api/v1/publications/thiep-cuoi/guestbook`);
    expect(url.searchParams.get("blockId")).toBe("b1");
    expect(url.searchParams.get("first")).toBe("5");
    expect(url.searchParams.has("after")).toBe(false);
  });

  it("sends the cursor when asking for more", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(200, { entries: [], nextCursor: null, total: 6 }));
    await fetchGuestbook({ slug: "s", blockId: "b", first: 3, after: "cur" }, fetchMock as unknown as typeof fetch);
    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(url.searchParams.get("after")).toBe("cur");
  });

  it("refuses a response that is not a page of wishes", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(200, { entries: "nope" }));
    await expect(fetchGuestbook({ slug: "s", blockId: "b", first: 5 }, fetchMock as unknown as typeof fetch)).rejects.toBeTruthy();
  });
});
