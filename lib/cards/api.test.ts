import { describe, expect, it, vi } from "vitest";

// `apiFetch` gọi GraphQL thật trong test thì không được; chỉ cần trả đúng hình dạng `cardsApi.get` đọc.
const { graphql } = vi.hoisted(() => ({ graphql: vi.fn() }));
vi.mock("@/lib/api", () => ({ apiFetch: { graphql } }));

const { cardsApi } = await import("./api");

const card = (document: Record<string, unknown>) => ({ card: { id: "c1", title: "Thiệp", revision: 3, role: "OWNER", document } });
const legacy = {
  schemaVersion: 1,
  root: { id: "root", type: "Page", props: {}, styles: {}, children: [{ id: "n7", type: "Guestbook", props: {}, styles: {}, children: [] }] },
};

describe("cardsApi.get", () => {
  it("opens a card saved with the old form blocks by upgrading them to Form", async () => {
    graphql.mockResolvedValueOnce(card(legacy));
    const loaded = await cardsApi.get("c1");
    expect((loaded.document.root as { children: { type: string }[] }).children[0]?.type).toBe("Form");
  });

  it("keeps a card that has no old form blocks as it was", async () => {
    const clean = { schemaVersion: 1, root: { id: "root", type: "Page", props: {}, styles: {}, children: [] } };
    graphql.mockResolvedValueOnce(card(clean));
    const loaded = await cardsApi.get("c1");
    expect(loaded.document).toEqual(clean);
  });
});

describe("the responses page queries", () => {
  it("reads the title and role of one card without its document", async () => {
    graphql.mockResolvedValueOnce({ card: { id: "c1", title: "Thiệp", role: "EDITOR" } });
    expect(await cardsApi.header("c1")).toEqual({ id: "c1", title: "Thiệp", role: "EDITOR" });
    expect(graphql.mock.calls.at(-1)?.[1]).toEqual({ id: "c1" });
  });

  it("reads the forms of a card, with how many answers each one has", async () => {
    const form = { blockId: "b1", heading: "Xác nhận tham dự", fields: [], publicList: false, moderation: false, removed: false, total: 4, pending: 1 };
    graphql.mockResolvedValueOnce({ cardForms: [form] });
    const forms = await cardsApi.forms("c1");
    expect(forms).toEqual([form]);
    expect(graphql.mock.calls.at(-1)?.[1]).toEqual({ cardId: "c1" });
  });

  it("asks for a page of responses with the filter and cursor it is given", async () => {
    const page = { nodes: [], pageInfo: { hasNextPage: false, endCursor: null }, summary: [], counts: { visible: 0, hidden: 0, pending: 0 } };
    graphql.mockResolvedValueOnce({ formResponses: page });
    const result = await cardsApi.responses("c1", { blockId: "b1", status: "PENDING", search: "an", first: 20, after: "cur" });
    expect(result).toEqual(page);
    expect(graphql.mock.calls.at(-1)?.[1]).toEqual({ cardId: "c1", blockId: "b1", status: "PENDING", search: "an", first: 20, after: "cur" });
  });

  it("sets a status and deletes a response by id", async () => {
    graphql.mockResolvedValueOnce({ setFormResponseStatus: { id: "r1" } });
    await cardsApi.setResponseStatus("r1", "HIDDEN");
    expect(graphql.mock.calls.at(-1)?.[1]).toEqual({ id: "r1", status: "HIDDEN" });
    graphql.mockResolvedValueOnce({ deleteFormResponse: true });
    await cardsApi.deleteResponse("r1");
    expect(graphql.mock.calls.at(-1)?.[1]).toEqual({ id: "r1" });
  });
});
