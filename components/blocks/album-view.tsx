"use client";

import { type CSSProperties, type PointerEvent, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { offsetOf, slideLook } from "@/lib/cards/blocks/album-math";
import { Chevron, Lightbox } from "./lightbox";

// Vẽ khối Album. Mọi kiểu dáng viết thẳng (inline) vì Render đặt lại kiểu của các khối bên trong.
// `mode`: "live" là trang thật (tự chạy, vuốt, phóng to); "edit" là trong editor và "static" là ảnh thu nhỏ, hai chế độ này đứng yên
// và không nhận chuột, để chọn và kéo khối trong editor không bị khối tranh mất.
export type AlbumMode = "live" | "edit" | "static";

export interface AlbumViewProps {
  images: string[];
  autoplay: boolean;
  interval: number;
  lightbox: boolean;
  radius: number;
  dotColor: string;
  mode: AlbumMode;
}

const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";
const SWIPE_PX = 40;

// Mũi tên chỉ hiện từ bề rộng 768 px (như thiệp mẫu); trên điện thoại đổi ảnh bằng vuốt và chấm.
const ARROWS_CSS = ".cm-album-arrow{display:none}@media (min-width:768px){.cm-album-arrow{display:flex}}";

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = (notify: () => void) => {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const reducedMotionNow = () => window.matchMedia(REDUCED).matches;

const arrowButton = (side: "left" | "right"): CSSProperties => ({
  position: "absolute",
  top: "50%",
  [side]: 0,
  transform: "translateY(-50%)",
  zIndex: 200,
  width: 32,
  height: 32,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border: 0,
  padding: 0,
  background: "rgba(20, 12, 14, 0.6)",
  color: "#fff",
  cursor: "pointer",
});

export function AlbumView({ images, autoplay, interval, lightbox, radius, dotColor, mode }: AlbumViewProps) {
  const count = images.length;
  const live = mode === "live";
  const [current, setCurrent] = useState(0);
  const [open, setOpen] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, reducedMotionNow, () => false);
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  const active = current < count ? current : 0; // bớt ảnh thì quay về ảnh đầu

  const go = useCallback((step: number) => setCurrent((value) => (count ? (value + step + count) % count : 0)), [count]);

  useEffect(() => {
    if (!live || !autoplay || count < 2 || open || reduced) return;
    const id = setInterval(() => go(1), Math.max(500, interval * 1000));
    return () => clearInterval(id);
  }, [live, autoplay, count, open, reduced, interval, go]);

  if (count === 0) {
    if (live) return null;
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(81,20,25,0.35)", borderRadius: 12, color: "rgba(81,20,25,0.7)", fontSize: 14, fontFamily: "system-ui, sans-serif" }}>
        Chưa có ảnh. Chọn khối rồi thêm ảnh ở bảng bên phải.
      </div>
    );
  }

  const onPointerDown = (event: PointerEvent) => {
    if (live) swipe.current = { x: event.clientX, moved: false };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || count < 2) return;
    const delta = event.clientX - start.x;
    if (Math.abs(delta) >= SWIPE_PX) {
      start.moved = true;
      swipe.current = start; // báo cho click ngay sau đó biết đây là cú vuốt
      go(delta < 0 ? 1 : -1);
      setTimeout(() => (swipe.current = null), 0);
    }
  };

  const pick = (index: number) => {
    if (swipe.current?.moved) return;
    if (index === active) {
      if (live && lightbox) setOpen(true);
    } else {
      setCurrent(index);
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", pointerEvents: live ? "auto" : "none" }}>
      <style>{ARROWS_CSS}</style>
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{ position: "relative", flex: 1, minHeight: 0, width: "100%", touchAction: "pan-y" }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%", perspective: "1000px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {images.map((src, index) => {
            const offset = offsetOf(index, active, count);
            const look = slideLook(offset);
            const middle = offset === 0;
            return (
              <div
                key={`${index}-${src}`}
                role={live ? "button" : undefined}
                tabIndex={live && look.visible ? 0 : -1}
                aria-label={live ? `Ảnh ${index + 1} trên ${count}` : undefined}
                aria-hidden={look.visible ? undefined : true}
                onClick={() => pick(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    pick(index);
                  }
                }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  height: "92%",
                  overflow: "hidden",
                  borderRadius: radius,
                  cursor: "pointer",
                  transition: `all 1.1s ${EASE}`,
                  transform: look.transform,
                  opacity: look.opacity,
                  zIndex: look.zIndex,
                  pointerEvents: look.visible ? "auto" : "none",
                  boxShadow: `${middle ? "0 0 0 2px rgba(255,255,255,0.3), " : ""}0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- ảnh Cloudinary người dùng tải lên, bề rộng theo tỉ lệ ảnh */}
                <img src={src} alt="" draggable={false} style={{ display: "block", height: "100%", width: "auto", maxWidth: "none", userSelect: "none" }} />
              </div>
            );
          })}
        </div>
        {count > 1 && (
          <>
            <button type="button" className="cm-album-arrow" aria-label="Ảnh trước" onClick={() => go(-1)} style={arrowButton("left")}>
              <Chevron dir="left" />
            </button>
            <button type="button" className="cm-album-arrow" aria-label="Ảnh sau" onClick={() => go(1)} style={arrowButton("right")}>
              <Chevron dir="right" />
            </button>
          </>
        )}
      </div>
      {count > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12, height: 8, flexShrink: 0 }}>
          {images.map((src, index) => (
            <button
              key={`${index}-${src}`}
              type="button"
              aria-label={`Đến ảnh ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => setCurrent(index)}
              style={{
                width: index === active ? 24 : 8,
                height: 8,
                padding: 0,
                border: 0,
                borderRadius: 9999,
                background: dotColor,
                opacity: index === active ? 0.7 : 0.25,
                cursor: "pointer",
                transition: `all 300ms ${EASE}`,
              }}
            />
          ))}
        </div>
      )}
      {open && <Lightbox images={images} start={active} onClose={(index) => { setCurrent(index); setOpen(false); }} />}
    </div>
  );
}
