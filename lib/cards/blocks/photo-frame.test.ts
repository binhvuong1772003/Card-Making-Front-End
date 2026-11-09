import { builtInRegistry, emptyPage, insertNode, newNode, validatePage, validateRegistry, shapeGeometry, type PageData, type TreeNode } from "@miditor/core";
import { describe, expect, it } from "vitest";
import { FRAME_SHAPE_LABELS, FRAME_SHAPE_ORDER, FRAME_SHAPES, frameGeometry, photoFrameDefinitions } from "./photo-frame";

const registry = { ...builtInRegistry, PhotoFrameArch: photoFrameDefinitions.PhotoFrameArch! };

function pageWith(props: Record<string, unknown>): PageData {
  const node = newNode(registry, "PhotoFrameArch", "p1", { w: 680, h: 788 }) as TreeNode;
  const page = emptyPage();
  return { ...page, root: insertNode(page.root, "root", { ...node, props: { ...node.props, ...props } } as TreeNode) };
}

describe("the Photo frame block", () => {
  it("has a definition the registry check accepts", () => {
    expect(validateRegistry(registry)).toEqual([]);
  });

  it("offers all 13 shapes as blocks in the Photo frame group", () => {
    const kinds = Object.entries(photoFrameDefinitions);
    expect(kinds).toHaveLength(13);
    expect(new Set(kinds.map(([, def]) => def.category))).toEqual(new Set(["Khung ảnh"]));
    expect(new Set(kinds.map(([, def]) => def.defaultProps.shape))).toEqual(new Set(FRAME_SHAPES));
    for (const [, def] of kinds) expect(FRAME_SHAPES).toContain(def.defaultProps.shape);
  });

  it("offers every Miditor shape except crescent, plus heart, with a name and a place in the picker", () => {
    expect(FRAME_SHAPES).toHaveLength(13);
    expect(FRAME_SHAPES).not.toContain("crescent");
    expect([...FRAME_SHAPE_ORDER].sort()).toEqual([...FRAME_SHAPES].sort());
    for (const shape of FRAME_SHAPES) expect(FRAME_SHAPE_LABELS[shape], shape).toBeTruthy();
  });

  it("keeps a page valid with a crop and a ring, and refuses numbers out of range", () => {
    expect(validatePage(registry, pageWith({ zoom: 250, posX: 20, posY: 80, frameWidth: 8, frameColor: "#ffffff" }))).toEqual([]);
    expect(validatePage(registry, pageWith({ zoom: 50 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ zoom: 400 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ posX: 101 })).length).toBeGreaterThan(0);
    expect(validatePage(registry, pageWith({ frameWidth: 25 })).length).toBeGreaterThan(0);
  });

  it("picks the picture with the card editor's own input, since Miditor draws no field of type image", () => {
    expect(photoFrameDefinitions.PhotoFrameArch!.fields.src).toMatchObject({ type: "custom", kind: "single-image", group: "Ảnh" });
    expect(photoFrameDefinitions.PhotoFrameArch!.defaultProps.src).toBe("");
  });

  it("is a rectangle block by default with no ring and no frame of its own from the library's sections", () => {
    const def = photoFrameDefinitions.PhotoFrameArch!;
    expect(def.defaultProps.frameWidth).toBe(0);
    expect(def.defaultStyles).toBeUndefined();
    expect(Object.keys(def.fields)).not.toContain("borderWidth");
  });
});

describe("how a shape cuts the frame", () => {
  it("uses Miditor's own cut for its shapes, so a shape looks the same in both places", () => {
    for (const shape of FRAME_SHAPES.filter((name) => name !== "heart")) expect(frameGeometry(shape), shape).toEqual(shapeGeometry(shape));
  });

  it("cuts the heart with a mask and keeps every key a shape writes", () => {
    const heart = frameGeometry("heart");
    expect(heart.maskImage).toMatch(/^url\("data:image\/svg\+xml,/);
    expect(Object.keys(heart).sort()).toEqual(Object.keys(shapeGeometry("rectangle")).sort());
    expect(heart.borderRadius).toBe("0");
  });

  it("draws an unknown or missing shape as a rectangle", () => {
    for (const value of [undefined, "", "rồng", 7, null]) expect(frameGeometry(value)).toEqual(shapeGeometry("rectangle"));
  });
});
