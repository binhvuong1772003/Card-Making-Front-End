import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { builtInRegistry, emptyPage, insertNode, newNode, validatePage, validateRegistry, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { cardDefinitions, retiredProps } from "./definitions";
import { cardComponents, cardRenderers } from "./index";

const registry = { ...builtInRegistry, ...cardDefinitions };
const types = Object.keys(cardDefinitions);

describe("the blocks of CardMaking", () => {
  it("make a registry the library accepts", () => {
    expect(validateRegistry(registry)).toEqual([]);
  });

  it("are all drawn: every type has a renderer and every renderer a type", () => {
    expect(Object.keys(cardRenderers).sort()).toEqual([...types].sort());
    expect(cardComponents).toBe(cardDefinitions);
  });

  it.each(types)("%s: a block added with its defaults is a valid page", (type) => {
    const node = newNode(registry, type, "b1", { w: 680, h: 788 }) as TreeNode;
    const page = emptyPage();
    const filled: PageData = { ...page, root: insertNode(page.root, "root", node) };
    expect(validatePage(registry, filled)).toEqual([]);
  });

  it("have a unique name each in the library", () => {
    const labels = types.map((type) => cardDefinitions[type]!.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  // CMBE kiểm trang bằng bản sinh ra từ đây. Chạy `npm run blocks:export` nếu bài này đỏ. Bỏ qua khi không có repo CMBE bên cạnh (CI riêng).
  const generated = resolve(__dirname, "../../../../CMBE/src/modules/cards/components.json");
  const generatedRetired = resolve(__dirname, "../../../../CMBE/src/modules/cards/retired-props.json");
  it.skipIf(!existsSync(generated))("are the same as the list CMBE validates with (run npm run blocks:export)", () => {
    expect(JSON.parse(readFileSync(generated, "utf-8"))).toEqual(JSON.parse(JSON.stringify(cardDefinitions)));
  });
  it.skipIf(!existsSync(generatedRetired))("and the props they retired are the same as the ones CMBE drops (run npm run blocks:export)", () => {
    expect(JSON.parse(readFileSync(generatedRetired, "utf-8"))).toEqual(JSON.parse(JSON.stringify(retiredProps)));
  });

  it("never keep a retired prop in a definition", () => {
    for (const [type, props] of Object.entries(retiredProps)) {
      for (const prop of props) expect(Object.keys(cardDefinitions[type]!.fields), `${type}.${prop}`).not.toContain(prop);
    }
  });
});
