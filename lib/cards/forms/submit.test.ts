import { describe, expect, it, vi } from "vitest";
import { API_URL } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import type { Field } from "./fields";
import { fetchEntries, serverFieldErrors, submitForm } from "./submit";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const name: Field = { id: "name", type: "text", label: "Họ và tên", required: true };

describe("submitForm", () => {
  it("posts the answers under the block and hides the honeypot", async () => {
    const entry = { id: "r1", name: "An", text: "Chúc mừng", createdAt: "2026-11-07T10:00:00.000Z" };
    const fetchMock = vi.fn<typeof fetch>(async () => json(201, { id: "r1", status: "VISIBLE", entry }));
    await expect(
      submitForm({ slug: "thiep-cuoi", blockId: "b1", answers: { name: "An" } }, fetchMock as unknown as typeof fetch),
    ).resolves.toEqual({ id: "r1", status: "VISIBLE", entry });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe(`${API_URL}/api/v1/publications/thiep-cuoi/forms`);
    expect(init?.method).toBe("POST");
    // `website` luôn có mặt và luôn rỗng: máy điền mới điền vào ô ẩn này.
    expect(JSON.parse(String(init?.body))).toEqual({ blockId: "b1", answers: { name: "An" }, website: "" });
  });

  it("sends what the caller typed in the honeypot", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(201, { id: "x", status: "VISIBLE", entry: null }));
    await submitForm({ slug: "s", blockId: "b", answers: {}, website: "spam" }, fetchMock as unknown as typeof fetch);
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1]?.body)).website).toBe("spam");
  });

  it("keeps a wish waiting for approval, with no entry to show", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(201, { id: "r1", status: "PENDING", entry: null }));
    await expect(submitForm({ slug: "s", blockId: "b", answers: {} }, fetchMock as unknown as typeof fetch)).resolves.toEqual({ id: "r1", status: "PENDING", entry: null });
  });

  it("refuses an answer that is not the one the server promised to give", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(201, { id: "r1", status: "MAYBE", entry: null }));
    await expect(submitForm({ slug: "s", blockId: "b", answers: {} }, fetchMock as unknown as typeof fetch)).rejects.toBeTruthy();
  });
});

describe("fetchEntries", () => {
  const page = { entries: [{ id: "r1", name: "An", text: "Chúc mừng", createdAt: "2026-11-07T10:00:00.000Z" }], nextCursor: "next", total: 6 };

  it("asks for the first page of visible answers", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(200, page));
    await expect(fetchEntries({ slug: "thiep-cuoi", blockId: "b1", first: 5 }, fetchMock as unknown as typeof fetch)).resolves.toEqual(page);
    const url = new URL(String(fetchMock.mock.calls[0]![0]));
    expect(url.origin + url.pathname).toBe(`${API_URL}/api/v1/publications/thiep-cuoi/forms/entries`);
    expect(url.searchParams.get("blockId")).toBe("b1");
    expect(url.searchParams.get("first")).toBe("5");
    expect(url.searchParams.has("after")).toBe(false);
  });

  it("sends the cursor when asking for more", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(200, { entries: [], nextCursor: null, total: 6 }));
    await fetchEntries({ slug: "s", blockId: "b", first: 3, after: "cur" }, fetchMock as unknown as typeof fetch);
    expect(new URL(String(fetchMock.mock.calls[0]![0])).searchParams.get("after")).toBe("cur");
  });

  it("refuses a response that is not a page of answers", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json(200, { entries: "nope" }));
    await expect(fetchEntries({ slug: "s", blockId: "b", first: 5 }, fetchMock as unknown as typeof fetch)).rejects.toBeTruthy();
  });
});

describe("serverFieldErrors", () => {
  it("puts a Vietnamese note under the question the server refused, never the server's English", () => {
    const err = new ApiError(400, "VALIDATION", "Invalid answer", [
      { path: "name", message: "This question is required" },
      { path: "gone", message: "Invalid option" },
    ]);
    expect(serverFieldErrors(err, [name])).toEqual({ name: "Chưa đúng, bạn kiểm tra lại." });
  });

  it("says nothing for an error that is not about one question", () => {
    expect(serverFieldErrors(new ApiError(429, "RATE_LIMITED", "Too fast"), [name])).toEqual({});
  });
});
