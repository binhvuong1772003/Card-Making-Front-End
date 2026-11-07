import { describe, expect, it } from "vitest";
import { fetchPublicPage } from "./public-page";

const reply = (status: number, body: unknown) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
const PAGE = { slug: "minh-lan", title: "Minh và Lan", document: { schemaVersion: 1, root: {} }, publishedAt: "2026-11-07T10:00:00.000Z" };

describe("fetchPublicPage", () => {
  it("returns the published page", async () => {
    expect(await fetchPublicPage("minh-lan", reply(200, PAGE))).toEqual(PAGE);
  });
  it("returns null when there is no such page", async () => {
    expect(await fetchPublicPage("khong-co", reply(404, { error: { code: "NOT_FOUND" } }))).toBeNull();
  });
  it("throws on a server error instead of pretending the page is missing", async () => {
    await expect(fetchPublicPage("minh-lan", reply(500, {}))).rejects.toThrow();
  });
  it("asks for the slug as a path segment, encoded", async () => {
    let url = "";
    const spy = (async (input: RequestInfo | URL) => {
      url = String(input);
      return new Response(JSON.stringify(PAGE));
    }) as unknown as typeof fetch;
    await fetchPublicPage("a/b", spy);
    expect(url).toMatch(/\/api\/v1\/publications\/a%2Fb$/);
  });
});
