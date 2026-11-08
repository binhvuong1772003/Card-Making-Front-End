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
