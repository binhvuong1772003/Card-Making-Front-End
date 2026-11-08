import { builtInRegistry, emptyPage, insertNode, newNode, validatePage, validateRegistry, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { albumBlock, cleanImages, MAX_ALBUM_IMAGES } from "./album";

const registry = { ...builtInRegistry, Album: albumBlock };
const IMG = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg";

function pageWith(images: unknown): PageData {
  const node = newNode(registry, "Album", "a1", { w: 680, h: 788 }) as TreeNode;
  const page = emptyPage();
  const withProps = { ...node, props: { ...node.props, images } } as TreeNode;
  return { ...page, root: insertNode(page.root, "root", withProps) };
}

describe("the Album block", () => {
  it("has a definition the registry check accepts", () => {
    expect(validateRegistry(registry)).toEqual([]);
  });

  it("keeps a page with a list of pictures valid", () => {
    expect(validatePage(registry, pageWith([IMG, IMG]))).toEqual([]);
  });

  it("is refused by the library's own registry, which is why the backend needs the same definition", () => {
    expect(validatePage(builtInRegistry, pageWith([IMG])).length).toBeGreaterThan(0);
  });
});

describe("cleanImages", () => {
  it("keeps picture addresses the library accepts and drops everything else", () => {
    expect(cleanImages([IMG, "javascript:alert(1)", 5, null, "//evil.test/a.jpg", "image.svg x"])).toEqual([IMG]);
  });

  it("gives an empty list for anything that is not a list", () => {
    expect(cleanImages("x")).toEqual([]);
    expect(cleanImages(undefined)).toEqual([]);
  });

  it("stops at the most photos an album holds", () => {
    expect(cleanImages(Array.from({ length: MAX_ALBUM_IMAGES + 5 }, () => IMG))).toHaveLength(MAX_ALBUM_IMAGES);
  });
});
