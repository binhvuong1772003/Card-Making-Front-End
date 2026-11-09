"use client";

import { type CSSProperties, useRef, useState } from "react";
import type { AlbumMode } from "./album-view";
import { Chevron, Lightbox } from "./lightbox";
import { AlbumImage, albumPictures } from "./album-image";

// Các kiểu album ngoài kiểu xoay 3D (`album-view.tsx`): lưới, băng ngang, ảnh dán. Cùng quy ước `mode` như khối Album: "live" là trang thật;
// "edit" (trong editor) và "static" (ảnh thu nhỏ) không nhận chuột để chọn và kéo khối được. Kiểu dáng viết thẳng vì Render đặt lại kiểu.
interface CommonProps {
  images: string[];
  radius: number;
  lightbox: boolean;
  mode: AlbumMode;
}

// Mở màn phóng to cho ảnh thứ `index` nếu được phép; trả về phần tử cần vẽ thêm.
function useViewer(images: string[], enabled: boolean) {
  const [open, setOpen] = useState<number | null>(null);
  return {
    show: (index: number) => enabled && setOpen(index),
    overlay: open !== null && open < images.length ? <Lightbox images={images} start={open} onClose={() => setOpen(null)} /> : null,
  };
}

const tile = (live: boolean, enabled: boolean): CSSProperties => ({ padding: 0, border: 0, background: "transparent", cursor: live && enabled ? "zoom-in" : "default", display: "block" });

export function AlbumGridView({ images, radius, lightbox, mode, columns, gap }: CommonProps & { columns: number; gap: number }) {
  const live = mode === "live";
  const viewer = useViewer(images, live && lightbox);
  const pictures = albumPictures(images, live, columns * 2);
  if (pictures.length === 0) return null;
  const rows = Math.ceil(pictures.length / columns);
  return (
    <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, gap, pointerEvents: live ? "auto" : "none" }}>
      {pictures.map((src, index) => (
        <button key={`${index}-${src}`} type="button" aria-label={`Xem ảnh ${index + 1}`} disabled={!live || !lightbox} onClick={() => viewer.show(index)} style={{ ...tile(live, lightbox), minWidth: 0, minHeight: 0, overflow: "hidden", borderRadius: radius }}>
          <AlbumImage src={src} index={index} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </button>
      ))}
      {viewer.overlay}
    </div>
  );
}

// Thanh cuộn của băng ngang ẩn đi; mũi tên chỉ hiện từ bề rộng 768 px (trên điện thoại vuốt ngang).
const STRIP_CSS = ".cm-strip{scrollbar-width:none}.cm-strip::-webkit-scrollbar{display:none}.cm-strip-arrow{display:none}@media (min-width:768px){.cm-strip-arrow{display:flex}}";

export function AlbumStripView({ images, radius, lightbox, mode, gap }: CommonProps & { gap: number }) {
  const live = mode === "live";
  const viewer = useViewer(images, live && lightbox);
  const scroller = useRef<HTMLDivElement>(null);
  const pictures = albumPictures(images, live, 3);
  if (pictures.length === 0) return null;
  const by = (sign: number) => scroller.current?.scrollBy({ left: sign * scroller.current.clientWidth * 0.8, behavior: "smooth" });
  const arrow = (side: "left" | "right"): CSSProperties => ({ position: "absolute", top: "50%", [side]: 4, transform: "translateY(-50%)", zIndex: 2, width: 32, height: 32, alignItems: "center", justifyContent: "center", borderRadius: "50%", border: 0, padding: 0, background: "rgba(20,12,14,0.6)", color: "#fff", cursor: "pointer" });
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", pointerEvents: live ? "auto" : "none" }}>
      <style>{STRIP_CSS}</style>
      <div ref={scroller} className="cm-strip" style={{ display: "flex", gap, width: "100%", height: "100%", overflowX: live ? "auto" : "hidden", scrollSnapType: "x mandatory", touchAction: "pan-x pan-y" }}>
        {pictures.map((src, index) => (
          <button key={`${index}-${src}`} type="button" aria-label={`Xem ảnh ${index + 1}`} disabled={!live || !lightbox} onClick={() => viewer.show(index)} style={{ ...tile(live, lightbox), flexShrink: 0, height: "100%", overflow: "hidden", borderRadius: radius, scrollSnapAlign: "center" }}>
            <AlbumImage src={src} index={index} style={{ display: "block", height: "100%", width: "auto", maxWidth: "none" }} />
          </button>
        ))}
      </div>
      {pictures.length > 1 && mode !== "static" && (
        <>
          <button type="button" className="cm-strip-arrow" aria-label="Ảnh trước" onClick={() => by(-1)} style={arrow("left")}>
            <Chevron dir="left" />
          </button>
          <button type="button" className="cm-strip-arrow" aria-label="Ảnh sau" onClick={() => by(1)} style={arrow("right")}>
            <Chevron dir="right" />
          </button>
        </>
      )}
      {viewer.overlay}
    </div>
  );
}

// Góc nghiêng của từng ảnh dán: cố định theo vị trí (không ngẫu nhiên) để máy chủ và trình duyệt vẽ giống nhau, và ảnh không nhảy khi vẽ lại.
const angleOf = (index: number, tilt: number): number => (((index * 7 + 3) % 11) - 5) * (tilt / 5);

export function AlbumPolaroidView({ images, radius, lightbox, mode, columns, tilt, frameColor }: CommonProps & { columns: number; tilt: number; frameColor: string }) {
  const live = mode === "live";
  const viewer = useViewer(images, live && lightbox);
  const pictures = albumPictures(images, live, columns * 2);
  if (pictures.length === 0) return null;
  const rows = Math.ceil(pictures.length / columns);
  return (
    <div style={{ width: "100%", height: "100%", display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, pointerEvents: live ? "auto" : "none" }}>
      {pictures.map((src, index) => (
        // Ô là một khung đo (container) để ảnh dán luôn tỉ lệ 4:5 và lọt trong ô, dù khối rộng hay cao.
        <div key={`${index}-${src}`} style={{ position: "relative", minWidth: 0, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", containerType: "size" } as CSSProperties}>
          <button
            type="button"
            aria-label={`Xem ảnh ${index + 1}`}
            disabled={!live || !lightbox}
            onClick={() => viewer.show(index)}
            style={{ ...tile(live, lightbox), boxSizing: "border-box", width: "min(88cqw, 70cqh)", aspectRatio: "4 / 5", padding: "5% 5% 15%", background: frameColor, borderRadius: radius, boxShadow: "0 8px 16px -6px rgba(42,34,36,0.45)", transform: `rotate(${angleOf(index, tilt)}deg)`, transition: "transform 0.2s ease" }}
          >
            <AlbumImage src={src} index={index} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        </div>
      ))}
      {viewer.overlay}
    </div>
  );
}
