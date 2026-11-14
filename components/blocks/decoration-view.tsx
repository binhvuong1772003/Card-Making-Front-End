"use client";

import { useEffect, useRef, useState } from "react";

const GIFT_STARS = [{ left: "20%", top: "7%" }, { left: "77%", top: "20%" }, { left: "13%", top: "43%" }, { left: "75%", top: "76%" }];

// Số đo từ trang mẫu: lấp lánh 2s, bóng 3s (co ngang 0,9, độ mờ 0,3 <-> 0,18), gợi ý 2s. Hộp nhấp nhô 3s, lên xuống 5px, nằm ở card-player.module.css.
const GIFT_CSS = `
@keyframes cm-gift-sparkle { 0%, 100% { scale: .4; opacity: 0; } 50% { scale: 1.15; opacity: 1; } }
@keyframes cm-gift-shadow { 0%, 100% { scale: 1 1; opacity: .3; } 50% { scale: .9 1; opacity: .18; } }
@keyframes cm-gift-hint { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
@keyframes cm-decoration-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -4%; } }
@media (prefers-reduced-motion: reduce) { [data-gift-shadow], [data-gift-hint], [data-decoration-motion] svg, [data-decoration-float] { animation: none !important; } [data-gift-hint] { opacity: 1; } }`;

export function DecorationView({ src, alt, fit, motion, motionStyle = "box", floatMotion = false, opening = false }: { src: string; alt: string; fit: string; motion: boolean; motionStyle?: "box" | "envelope"; floatMotion?: boolean; opening?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!opening || !motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !imageRef.current?.animate) return;
    const animation = imageRef.current.animate([
      { transform: "translateY(0) scale(1) rotate(0deg)" },
      { offset: 0.3, transform: "translateY(-24px) scale(1.1) rotate(-5deg)" },
      { offset: 0.68, transform: "translateY(-5px) scale(.96) rotate(3deg)" },
      { transform: "translateY(-14px) scale(1.05) rotate(0deg)" },
    ], { duration: 560, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "forwards" });
    return () => animation.cancel();
  }, [motion, opening]);

  return <div
    ref={imageRef}
    data-decoration-motion={motion ? motionStyle === "box" ? "gift" : "envelope" : undefined}
    data-decoration-float={floatMotion ? "" : undefined}
    onPointerEnter={() => setHovered(true)}
    onPointerLeave={() => setHovered(false)}
    style={{
      position: "relative", width: "100%", height: "100%",
      transition: "transform 260ms cubic-bezier(.16, 1, .3, 1), filter 220ms ease",
      animation: floatMotion ? "cm-decoration-float 5.5s ease-in-out 0.4s infinite" : undefined,
      willChange: floatMotion ? "translate" : undefined,
      transform: motion && hovered ? "translateY(-8px) scale(1.04)" : undefined,
      filter: motion ? hovered ? "drop-shadow(0 15px 18px rgb(33 47 29 / 28%))" : "drop-shadow(0 8px 12px rgb(33 47 29 / 22%))" : undefined,
    }}
  >
    {(motion || floatMotion) && <style>{GIFT_CSS}</style>}
    {motion ? <>
      {motionStyle === "box" && <span aria-hidden="true" data-gift-shadow="" style={{ position: "absolute", left: "20%", right: "20%", bottom: "9%", height: "5%", borderRadius: "50%", background: "rgb(33 47 29)", opacity: 0.3, animation: "cm-gift-shadow 3s linear infinite" }} />}
      <div data-gift-bob="" style={{ position: "absolute", inset: 0 }}>
        {motionStyle === "box" && <img src="/demo/hoa-moc-xanh/gift-mini-orbit.webp" alt="" aria-hidden="true" draggable={false} style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 1,
        }} />}
        <img src={src} alt="" aria-hidden="true" draggable={false} style={{
          position: "absolute", left: motionStyle === "box" ? "20%" : 0, top: motionStyle === "box" ? "16%" : 0, width: motionStyle === "box" ? "60%" : "100%", height: motionStyle === "box" ? "72%" : "88%", zIndex: 2,
          objectFit: fit === "cover" ? "cover" : "contain",
        }} />
        {/* Lấp lánh: mỗi ngôi sao 2s (phóng 0,4 -> 1,15 -> 0,4, độ mờ 0 -> 1 -> 0), lệch pha nhau 0,5s. */}
        {motionStyle === "box" && GIFT_STARS.map((star, index) => <svg key={index} aria-hidden="true" viewBox="0 0 24 24" style={{ position: "absolute", left: star.left, top: star.top, width: 18, height: 18, fill: "#71814f", filter: "drop-shadow(0 1px 1px #fff8)", zIndex: 3, animation: `cm-gift-sparkle 2s linear ${index * 0.5}s infinite` }}><path d="M12 0c1.6 6.1 3.9 8.4 10 10-6.1 1.6-8.4 3.9-10 10C10.4 13.9 8.1 11.6 2 10 8.1 8.4 10.4 6.1 12 0Z" /></svg>)}
      </div>
      {/* Dòng gợi ý nhịp 2s, độ mờ 0,45 <-> 1. */}
      <span data-gift-hint="" style={{ position: "absolute", left: 0, right: 0, bottom: motionStyle === "envelope" ? "8%" : "1%", zIndex: 4, textAlign: "center", color: motionStyle === "envelope" ? "#511419" : "#354821", font: "600 13px/1.2 Georgia, serif", animation: "cm-gift-hint 2s linear infinite" }}>Nhấn để mở</span>
    </> : <img src={src} alt={alt} draggable={false} style={{ display: "block", width: "100%", height: "100%", objectFit: fit === "cover" ? "cover" : "contain" }} />}
  </div>;
}
