import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { cutStyle, PhotoFrameView, type PhotoFrameViewProps } from "@/components/blocks/photo-frame-view";
import { frameGeometry } from "./photo-frame";

const base: PhotoFrameViewProps = { src: "https://res.cloudinary.com/demo/image/upload/sample.jpg", alt: "Cô dâu chú rể", shape: "arch", zoom: 100, posX: 50, posY: 50, frameWidth: 0, frameColor: "#511419", editing: false };
const html = (props: Partial<PhotoFrameViewProps> = {}) => renderToStaticMarkup(createElement(PhotoFrameView, { ...base, ...props }));

describe("the Photo frame view", () => {
  it("draws the picture with its description, cropped where the owner chose and zoomed from that point", () => {
    const out = html({ zoom: 150, posX: 20, posY: 80 });
    expect(out).toContain('alt="Cô dâu chú rể"');
    expect(out).toContain("object-position:20% 80%");
    expect(out).toContain("transform:scale(1.5)");
    expect(out).toContain("transform-origin:20% 80%");
  });

  it("cuts both layers with the shape, so the ring follows it", () => {
    const out = html({ shape: "arch", frameWidth: 6, frameColor: "#7b1e2b" });
    const arch = "border-radius:50% 50% 0 0 / 100% 100% 0 0";
    expect(out.split(arch).length - 1).toBe(2);
    expect(out).toContain("background:#7b1e2b");
    expect(out).toContain("inset:6px");
  });

  it("has no ring colour when there is no ring", () => {
    expect(html({ frameWidth: 0 })).toContain("background:transparent");
  });

  it("cuts the heart with a mask, prefixed for older browsers", () => {
    const out = html({ shape: "heart" });
    expect(out).toContain("mask-image:url(");
    expect(out).toContain("-webkit-mask-image:url(");
  });

  it("shows nothing without a picture on a real page, and a prompt in the editor", () => {
    expect(html({ src: "" })).toBe("");
    expect(html({ src: "", editing: true })).toContain("Chọn ảnh ở bảng bên phải");
  });

  it("writes every key of the shape's cut, so changing the shape never leaves one behind", () => {
    const style = cutStyle(frameGeometry("scallop"));
    for (const key of ["borderRadius", "clipPath", "maskImage", "maskSize", "maskRepeat", "maskPosition", "WebkitMaskImage"]) expect(style, key).toHaveProperty(key);
  });
});
