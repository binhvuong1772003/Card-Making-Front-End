"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const GIFT_STARS = [{ left: "20%", top: "7%" }, { left: "77%", top: "20%" }, { left: "13%", top: "43%" }, { left: "75%", top: "76%" }];

// Số đo từ trang mẫu: lấp lánh 2s, bóng 3s (co ngang 0,9, độ mờ 0,3 <-> 0,18), gợi ý 2s. Hộp nhấp nhô 3s, lên xuống 5px, nằm ở card-player.module.css.
const GIFT_CSS = `
@keyframes cm-gift-sparkle { 0%, 100% { scale: .4; opacity: 0; } 50% { scale: 1.15; opacity: 1; } }
@keyframes cm-gift-shadow { 0%, 100% { scale: 1 1; opacity: .3; } 50% { scale: .9 1; opacity: .18; } }
@keyframes cm-gift-hint { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
@keyframes cm-decoration-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -4%; } }
@keyframes cm-heartbeat { 0%, 70%, 100% { scale: 1; } 14% { scale: 1.16; } 28% { scale: 1; } 42% { scale: 1.1; } }
@keyframes cm-heartbeat-glow { 0%, 70%, 100% { filter: drop-shadow(0 4px 12px rgb(81 20 25 / 45%)); } 14% { filter: drop-shadow(0 6px 26px rgb(81 20 25 / 70%)); } 42% { filter: drop-shadow(0 5px 20px rgb(81 20 25 / 60%)); } }
@keyframes cm-soft-pulse { 0%, 100% { scale: 1; } 50% { scale: 1.06; } }
@keyframes cm-shine-sweep { 0% { left: -100%; } 50%, 100% { left: 100%; } }
@media (prefers-reduced-motion: reduce) { [data-decoration-idle] { animation: none !important; } [data-decoration-idle] span { animation: none !important; } [data-decoration-idle="Ánh sáng quét"] span { left: 38% !important; transform: none !important; opacity: .75 !important; } [data-gift-shadow], [data-gift-hint], [data-decoration-motion] svg, [data-decoration-float] { animation: none !important; } [data-gift-hint] { opacity: 1; } }`;

function DecorationBase({ src, alt, fit, motion, motionStyle = "box", floatMotion = false, opening = false, idle = "Không", shineRadius = 24, tintColor = "" }: { src: string; alt: string; fit: string; motion: boolean; motionStyle?: "box" | "envelope"; floatMotion?: boolean; opening?: boolean; idle?: "Không" | "Đập" | "Thở nhẹ" | "Ánh sáng quét"; shineRadius?: number; tintColor?: string }) {
  const [hovered, setHovered] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const artwork = (style: CSSProperties) => tintColor && /^#[0-9a-f]{6}$/i.test(tintColor)
    ? <span role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={!alt || undefined} style={{ ...style, background: tintColor, maskImage: `url(${JSON.stringify(src)})`, maskSize: fit === "cover" ? "cover" : "contain", maskRepeat: "no-repeat", maskPosition: "center" }} />
    : <img src={src} alt={alt} draggable={false} style={style} />;
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

  // Nhịp tim: hai nhịp phình (1,16 rồi 1,1) trong 1,3s rồi nghỉ, kèm quầng bóng đập theo. Vệt sáng: 32/140 bề rộng nút, chạy nửa đầu của 3s (ease-in-out, trắng 40%) rồi nghỉ (số đo từ nút Mở thiệp của trang mẫu).
  if (idle !== "Không" && !motion) return <div data-decoration-idle={idle} style={{ position: "relative", width: "100%", height: "100%", overflow: idle === "Ánh sáng quét" ? "hidden" : undefined, borderRadius: idle === "Ánh sáng quét" ? shineRadius : undefined, animation: idle === "Thở nhẹ" ? "cm-soft-pulse 2s ease-in-out infinite" : undefined, pointerEvents: "none" }}>
    <style>{GIFT_CSS}</style>
    {idle === "Đập"
      ? src ? artwork({ display: "block", width: "100%", height: "100%", objectFit: fit === "cover" ? "cover" : "contain", transformOrigin: "50% 50%", animation: "cm-heartbeat 1.3s ease-in-out infinite, cm-heartbeat-glow 1.3s ease-in-out infinite" }) : null
      : idle === "Thở nhẹ"
        ? src ? artwork({ display: "block", width: "100%", height: "100%", objectFit: fit === "cover" ? "cover" : "contain" }) : null
        : <>
        {src ? artwork({ display: "block", width: "100%", height: "100%", objectFit: fit === "cover" ? "cover" : "contain" }) : null}
        <span aria-hidden="true" style={{ position: "absolute", top: 0, height: "100%", width: "23%", left: "-100%", background: "linear-gradient(90deg, transparent, rgb(255 255 255 / 40%), transparent)", animation: "cm-shine-sweep 3s ease-in-out infinite" }} />
      </>}
  </div>;

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
        {artwork({
          position: "absolute", left: motionStyle === "box" ? "20%" : 0, top: motionStyle === "box" ? "16%" : 0, width: motionStyle === "box" ? "60%" : "100%", height: motionStyle === "box" ? "72%" : "88%", zIndex: 2,
          objectFit: fit === "cover" ? "cover" : "contain",
        })}
        {/* Lấp lánh: mỗi ngôi sao 2s (phóng 0,4 -> 1,15 -> 0,4, độ mờ 0 -> 1 -> 0), lệch pha nhau 0,5s. */}
        {motionStyle === "box" && GIFT_STARS.map((star, index) => <svg key={index} aria-hidden="true" viewBox="0 0 24 24" style={{ position: "absolute", left: star.left, top: star.top, width: 18, height: 18, fill: "#71814f", filter: "drop-shadow(0 1px 1px #fff8)", zIndex: 3, animation: `cm-gift-sparkle 2s linear ${index * 0.5}s infinite` }}><path d="M12 0c1.6 6.1 3.9 8.4 10 10-6.1 1.6-8.4 3.9-10 10C10.4 13.9 8.1 11.6 2 10 8.1 8.4 10.4 6.1 12 0Z" /></svg>)}
      </div>
      {/* Dòng gợi ý nhịp 2s, độ mờ 0,45 <-> 1. */}
      <span data-gift-hint="" style={{ position: "absolute", left: 0, right: 0, bottom: motionStyle === "envelope" ? "8%" : "1%", zIndex: 4, textAlign: "center", color: motionStyle === "envelope" ? "#511419" : "#354821", font: "600 13px/1.2 Georgia, serif", animation: "cm-gift-hint 2s linear infinite" }}>Nhấn để mở</span>
    </> : artwork({ display: "block", width: "100%", height: "100%", objectFit: fit === "cover" ? "cover" : "contain" })}
  </div>;
}


// Rê chuột: mốc theo trang mẫu. Nảy lên = igbBoxPop (0,7s, cubic-bezier(.34,1.56,.64,1), giữ trạng thái cuối, gốc xoay ở đáy); Bay lên = igbDecorFlyUp (55% lên nửa đường, 80% lên hết và mờ, 81% về chỗ cũ, 100% hiện lại); Pháo giấy = igbConfettiFly 1 trong 8 mảnh.
const CONFETTI = [
  { w: 11, h: 5.5, color: "#ec4899", round: 2, dx: -55, dy: -130, rot: 540, time: 1, delay: 0.05 },
  { w: 10, h: 10, color: "#7cb882", round: 5, dx: 46, dy: -150, rot: -460, time: 1.1, delay: 0.12 },
  { w: 11, h: 5.5, color: "#22c55e", round: 2, dx: -12, dy: -160, rot: 620, time: 0.95, delay: 0.2 },
  { w: 9, h: 9, color: "#3b82f6", round: 4.5, dx: 28, dy: -115, rot: -340, time: 1.15, delay: 0.3 },
  { w: 12, h: 6, color: "#a855f7", round: 2, dx: -34, dy: -105, rot: 320, time: 1.05, delay: 0.35 },
  { w: 10, h: 10, color: "#facc15", round: 5, dx: 58, dy: -88, rot: -240, time: 1.2, delay: 0.4 },
  { w: 10, h: 5, color: "#1f3a25", round: 2, dx: 8, dy: -170, rot: 420, time: 0.9, delay: 0.5 },
  { w: 9, h: 9, color: "#f97316", round: 4.5, dx: -46, dy: -128, rot: -380, time: 1.1, delay: 0.55 },
] as const;

const HOVER_CSS = `
@keyframes cm-hover-pop { 0% { transform: translateY(0) scale(1) rotate(0deg); } 45% { transform: translateY(-14px) scale(1.08) rotate(-3deg); } 100% { transform: translateY(-8px) scale(1.05) rotate(0deg); } }
@keyframes cm-hover-fly { 0% { translate: 0 0; opacity: 1; } 55% { translate: calc(var(--cm-hs) * .43) calc(var(--cm-hr) * -.51); opacity: 1; } 80% { translate: var(--cm-hs) calc(var(--cm-hr) * -1); opacity: 0; } 81% { translate: 0 0; opacity: 0; } 100% { translate: 0 0; opacity: 1; } }
@keyframes cm-hover-confetti { 0% { transform: translate(0, 0) rotate(0deg); opacity: 0; } 15% { opacity: 1; } 100% { transform: translate(var(--cm-cx), var(--cm-cy)) rotate(var(--cm-cr)); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { [data-cm-hv] , [data-cm-hv] * { animation: none !important; } }`;

export function DecorationView({ hoverEffect = "Không", hoverGroup = "", hoverTime = 1.6, hoverDelay = 0, hoverRise = 55, hoverSway = 14, ...base }: Parameters<typeof DecorationBase>[0] & { hoverEffect?: "Không" | "Nảy lên" | "Bay lên rồi hiện lại" | "Pháo giấy"; hoverGroup?: string; hoverTime?: number; hoverDelay?: number; hoverRise?: number; hoverSway?: number }) {
  if (hoverEffect === "Không") return <DecorationBase {...base} />;
  const group = hoverGroup.replace(/[^a-z0-9-]/g, "");
  const trigger = `body:has([data-cm-hg="${group}"]:hover) [data-cm-hg="${group}"][data-cm-hv="${hoverEffect === "Nảy lên" ? "pop" : hoverEffect === "Pháo giấy" ? "confetti" : "fly"}"]`;
  const animation = hoverEffect === "Nảy lên"
    ? `cm-hover-pop ${hoverTime.toFixed(2)}s cubic-bezier(.34, 1.56, .64, 1) ${hoverDelay.toFixed(2)}s 1 normal forwards`
    : `cm-hover-fly ${hoverTime.toFixed(2)}s ease-in-out ${hoverDelay.toFixed(2)}s infinite`;
  return (
    <div
      data-cm-hg={group}
      data-cm-hv={hoverEffect === "Nảy lên" ? "pop" : hoverEffect === "Pháo giấy" ? "confetti" : "fly"}
      style={{ position: "relative", width: "100%", height: "100%", transformOrigin: "50% 100%", ["--cm-hr" as string]: `${hoverRise}px`, ["--cm-hs" as string]: `${hoverSway}px`, willChange: "transform, translate, opacity" }}
    >
      <style>{`${HOVER_CSS}\n${hoverEffect === "Pháo giấy" ? `${trigger} > span { animation: var(--cm-ca); }` : `${trigger} { animation: ${animation}; }`}`}</style>
      {hoverEffect === "Pháo giấy"
        ? CONFETTI.map((piece, index) => <span key={index} aria-hidden="true" style={{ position: "absolute", left: "50%", top: 0, width: piece.w, height: piece.h, marginLeft: -piece.w / 2, marginTop: -piece.h / 2, background: piece.color, borderRadius: piece.round, opacity: 0, pointerEvents: "none", ["--cm-cx" as string]: `${piece.dx}px`, ["--cm-cy" as string]: `${piece.dy}px`, ["--cm-cr" as string]: `${piece.rot}deg`, ["--cm-ca" as string]: `cm-hover-confetti ${piece.time}s ease-out ${piece.delay}s infinite` }} />)
        : <DecorationBase {...base} />}
    </div>
  );
}
