import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AlbumView, type AlbumMode } from "@/components/blocks/album-view";
import { AlbumGridView, AlbumPolaroidView, AlbumStripView } from "@/components/blocks/album-layouts";
import { albumPictures } from "@/components/blocks/album-image";

const common = { radius: 8, lightbox: true };
const variants = [
  { name: "3D", draw: (mode: AlbumMode, images: string[]) => createElement(AlbumView, { ...common, mode, images, autoplay: true, interval: 1.5, dotColor: "#511419" }) },
  { name: "grid", draw: (mode: AlbumMode, images: string[]) => createElement(AlbumGridView, { ...common, mode, images, columns: 3, gap: 8 }) },
  { name: "strip", draw: (mode: AlbumMode, images: string[]) => createElement(AlbumStripView, { ...common, mode, images, gap: 10 }) },
  { name: "polaroid", draw: (mode: AlbumMode, images: string[]) => createElement(AlbumPolaroidView, { ...common, mode, images, columns: 2, tilt: 5, frameColor: "#ffffff" }) },
];

describe.each(variants)("empty $name album", ({ draw }) => {
  it.each(["edit", "static"] as const)("fills the actual album layout with sample artwork in %s mode", (mode) => {
    const html = renderToStaticMarkup(draw(mode, []));
    expect(html).toContain("data-album-placeholder");
    expect(html).not.toContain("Album chưa có ảnh");
    expect(html).not.toContain("dashed");
  });

  it("hides the empty editor placeholder on the published page", () => {
    expect(renderToStaticMarkup(draw("live", []))).toBe("");
  });

  it.each(["edit", "static"] as const)("replaces only one sample per photo in %s mode", (mode) => {
    const empty = renderToStaticMarkup(draw(mode, []));
    const slots = empty.match(/data-album-placeholder/g)!.length;
    for (const count of [1, 2]) {
      const images = Array.from({ length: count }, (_, index) => `https://example.com/photo-${index}.jpg`);
      const html = renderToStaticMarkup(draw(mode, images));
      expect(html.match(/data-album-placeholder/g)).toHaveLength(slots - count);
      expect(html.match(/<img /g)).toHaveLength(count);
    }
  });

  it("publishes only the real photo, without sample slots", () => {
    const html = renderToStaticMarkup(draw("live", ["https://example.com/photo.jpg"]));
    expect(html.match(/<img /g)).toHaveLength(1);
    expect(html).not.toContain("data-album-placeholder");
  });
});

it("keeps every supplied photo when there are more photos than sample slots", () => {
  const images = Array.from({ length: 9 }, (_, i) => `https://example.com/${i}.jpg`);
  expect(albumPictures(images, false, 7)).toEqual(images);
});

it("shows seven sample photos and the current photo counter in the 3D album", () => {
  const html = renderToStaticMarkup(variants[0]!.draw("edit", []));
  expect(html.match(/data-album-placeholder/g)).toHaveLength(7);
  expect(html).toContain('aria-label="Ảnh 1 trên 7"');
});
