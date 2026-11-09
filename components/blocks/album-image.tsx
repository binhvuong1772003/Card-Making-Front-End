import type { CSSProperties } from "react";
import { ThumbnailLandscape } from "./thumbnail-landscape";

/** Sample slots exist only while editing; each supplied photo replaces one slot. */
export function albumPictures(images: string[], live: boolean, slots: number): (string | undefined)[] {
  return live ? images : Array.from({ length: Math.max(images.length, slots) }, (_, index) => images[index]);
}

/** Empty slots use the same dimensions and layout as real album photos. */
export function AlbumImage({ src, index, style }: { src: string | undefined; index: number; style: CSSProperties }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- user-uploaded album photo
    return <img src={src} alt="" draggable={false} style={style} />;
  }
  return (
    <svg data-album-placeholder="" aria-hidden="true" width="240" height="320" viewBox="0 0 240 320" style={style}>
      <ThumbnailLandscape tone={index} />
    </svg>
  );
}
