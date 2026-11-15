import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { builtInRegistry, isPageData, validatePage } from "@miditor/core";
import { expect, it } from "vitest";
import { cardDefinitions } from "../blocks/definitions";
import { normalizeCardDocument } from "../document";
import { hoaMocXanhDemo, hoaMocXanhDemoDocument } from "./hoa-moc-xanh";

it("builds the entire reference study from valid, editable existing blocks", () => {
  expect(isPageData(hoaMocXanhDemo)).toBe(true);
  expect(validatePage({ ...builtInRegistry, ...cardDefinitions }, hoaMocXanhDemo)).toEqual([]);
  expect(hoaMocXanhDemo.root.children.every((node) => "phone" in node)).toBe(true);
});

it("ships every photo and illustration referenced by the demo", () => {
  for (const node of hoaMocXanhDemo.root.children) {
    const urls = [node.props.src, ...(Array.isArray(node.props.images) ? node.props.images : [])];
    for (const url of urls) {
      if (typeof url === "string" && url.startsWith("/demo/")) expect(existsSync(resolve(process.cwd(), "public", url.slice(1))), url).toBe(true);
    }
  }
});

it("opens the editable gift page as a popup with a clearly illustrative QR", () => {
  const demo = normalizeCardDocument(hoaMocXanhDemoDocument);
  const page = (id: string) => demo.pages.find((item) => item.id === id);
  expect(demo.startPageId).toBe("cover");
  expect(demo.pages.map((item) => item.id)).toEqual(["cover", "invitation", "gift-details", "rsvp"]);
  expect(page("cover")?.interactions["open-label"]).toMatchObject({ type: "go-to-page", targetPageId: "invitation" });
  expect(page("invitation")?.interactions["wedding-gift"]?.type).toBe("open-popup");
  expect(page("gift-details")?.popup).toMatchObject({ width: 641, effect: "fade" });
  expect(validatePage({ ...builtInRegistry, ...cardDefinitions }, page("gift-details")!.data)).toEqual([]);
  expect(existsSync(resolve(process.cwd(), "public/demo/hoa-moc-xanh/qr-groom.png"))).toBe(true);
});
