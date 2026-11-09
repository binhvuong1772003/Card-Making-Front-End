import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { builtInRegistry, isPageData, validatePage } from "@miditor/core";
import { expect, it } from "vitest";
import { cardDefinitions } from "../blocks/definitions";
import { hoaMocXanhDemo } from "./hoa-moc-xanh";

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
