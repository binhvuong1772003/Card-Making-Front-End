"use client";

import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Màn phóng to ảnh dùng chung cho mọi kiểu album: nền tối, số thứ tự, nút đóng, mũi tên và dải ảnh nhỏ. Vẽ ra `document.body` để không bị
// phép co giãn của trang công khai (transform) làm lệch vị trí `fixed`. Mọi kiểu dáng viết thẳng vì Render đặt lại kiểu.
export function Chevron({ dir, size = 16 }: { dir: "left" | "right"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d={dir === "left" ? "M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" : "M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"} />
    </svg>
  );
}


// Màn phóng to: nền tối, số thứ tự, nút đóng, mũi tên và dải ảnh nhỏ. Vẽ ra `document.body` để không bị phép co giãn của trang
// công khai (transform) làm lệch vị trí `fixed`.
export function Lightbox({ images, start, onClose }: { images: string[]; start: number; onClose: (index: number) => void }) {
  const count = images.length;
  const [index, setIndex] = useState(start);
  const step = useCallback((by: number) => setIndex((value) => (value + by + count) % count), [count]);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose(index);
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, step]);

  const round: CSSProperties = { width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: 0, padding: 0, background: "transparent", color: "#fff", cursor: "pointer" };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh"
      onClick={() => onClose(index)}
      style={{ position: "fixed", inset: 0, zIndex: 2147483000, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", height: "100dvh", width: "100vw", padding: "40px 8px 16px", boxSizing: "border-box", fontFamily: "system-ui, sans-serif" }}
    >
      <button ref={closeButton} type="button" aria-label="Đóng" onClick={() => onClose(index)} style={{ ...round, position: "absolute", top: 8, right: 8, zIndex: 10, fontSize: 20 }}>
        <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
          <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
        </svg>
      </button>
      <div style={{ position: "absolute", top: 8, left: 8, zIndex: 10, background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 14, padding: "4px 8px", borderRadius: 9999 }}>
        {index + 1} / {count}
      </div>
      <div onClick={(event) => event.stopPropagation()} style={{ position: "relative", flex: 1, minHeight: 0, width: "100%", maxWidth: 1024, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 32px", boxSizing: "border-box" }}>
        {count > 1 && (
          <button type="button" aria-label="Ảnh trước" onClick={() => step(-1)} style={{ ...round, position: "absolute", left: 0, zIndex: 10 }}>
            <Chevron dir="left" size={24} />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element -- ảnh Cloudinary người dùng tải lên */}
        <img src={images[index]} alt="" draggable={false} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", borderRadius: 12, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", userSelect: "none" }} />
        {count > 1 && (
          <button type="button" aria-label="Ảnh sau" onClick={() => step(1)} style={{ ...round, position: "absolute", right: 0, zIndex: 10 }}>
            <Chevron dir="right" size={24} />
          </button>
        )}
      </div>
      {count > 1 && (
        <div onClick={(event) => event.stopPropagation()} style={{ flexShrink: 0, display: "flex", gap: 8, overflowX: "auto", maxWidth: "100%", padding: 8, marginTop: 12, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)", borderRadius: 8 }}>
          {images.map((src, i) => (
            <button key={`${i}-${src}`} type="button" aria-label={`Xem ảnh ${i + 1}`} onClick={() => setIndex(i)} style={{ flexShrink: 0, width: i === index ? 48 : 46, height: i === index ? 48 : 46, padding: 0, border: 0, borderRadius: 6, overflow: "hidden", opacity: i === index ? 1 : 0.6, cursor: "pointer", transition: "all 150ms" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh thu nhỏ trong dải */}
              <img src={src} alt="" draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}
