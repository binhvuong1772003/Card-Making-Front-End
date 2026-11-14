import type { CSSProperties } from "react";
import { BURST_PALETTES, type BurstPalette } from "@/lib/cards/blocks/burst";
import { particleSpecs, type ParticleShape } from "@/lib/cards/blocks/particles";

export type ParticlesViewProps = {
  shape: ParticleShape;
  color: string;
  count: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  editing: boolean;
  /** Hình "Chữ": ký tự vẽ thay cho ô màu. */
  char?: string;
  /** Bảng màu cho mỗi hạt một màu; vắng thì dùng `color`. */
  palette?: BurstPalette;
  direction?: "Bay lên" | "Rơi xuống";
};

const HEART_MASK = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/></svg>')}")`;

// Cắt hạt theo hình; Vuông không cắt gì.
export function particleCut(shape: ParticleShape): CSSProperties {
  switch (shape) {
    case "Tròn": return { borderRadius: "50%" };
    case "Cánh hoa": return { borderRadius: "70% 0 70% 0" };
    case "Thoi": return { clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" };
    case "Sao": return { clipPath: "polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)" };
    case "Tim": return { WebkitMaskImage: HEART_MASK, maskImage: HEART_MASK, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" };
    default: return {};
  }
}

// Mỗi hạt bay từ đáy khối lên quá mép trên: 100cqh là chiều cao của khung (container query), nên không cần đo bằng JS và chạy được ở máy chủ.
// Các mốc 12% / 55% / 92% và độ mờ theo trang mẫu; lệch ngang và xoay đạt cực đại ở 55% rồi về lại.
const KEYFRAMES = `
@keyframes cm-particles-rise {
  0% { transform: translate(0, 80px) rotate(0deg); opacity: 0; }
  12% { opacity: calc(var(--cm-o) * 0.82); }
  55% { transform: translate(var(--cm-dx), calc(-0.46 * (100cqh + 80px) + 80px)) rotate(var(--cm-rot)); opacity: var(--cm-o); }
  92% { opacity: calc(var(--cm-o) * 0.64); }
  100% { transform: translate(0, calc(-100cqh - 80px)); opacity: 0; }
}
@keyframes cm-particles-fall {
  0% { transform: translate(0, -80px) rotate(0deg); opacity: 0; }
  12% { opacity: calc(var(--cm-o) * 0.82); }
  55% { transform: translate(var(--cm-dx), calc(0.46 * (100cqh + 80px) - 80px)) rotate(var(--cm-rot)); opacity: var(--cm-o); }
  92% { opacity: calc(var(--cm-o) * 0.64); }
  100% { transform: translate(0, calc(100cqh + 80px)); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  [data-cm-particle] { animation: none !important; opacity: calc(var(--cm-o) * 0.6) !important; transform: translateY(calc(-1 * var(--cm-rest))) !important; }
}`;

export function ParticlesView({ shape, color, count, size, speed, opacity, drift, editing, char = "囍", palette, direction = "Bay lên" }: ParticlesViewProps) {
  const cut = particleCut(shape);
  const rate = Math.max(0.1, speed / 100);
  const colors = palette ? BURST_PALETTES[palette] : null;
  const glyph = shape === "Chữ";
  const falling = direction === "Rơi xuống";
  return (
    <div
      aria-hidden="true"
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", pointerEvents: "none", containerType: "size", outline: editing ? "1px dashed rgb(110 110 110 / 55%)" : undefined, outlineOffset: -1 }}
    >
      <style>{KEYFRAMES}</style>
      {particleSpecs(count).map((particle, index) => {
        const side = Math.max(1, Math.round(size * particle.scale));
        const tint = colors ? colors[particle.pick % colors.length]! : color;
        const style = {
          position: "absolute", left: `${particle.left.toFixed(2)}%`, ...(falling ? { top: 0 } : { bottom: 0 }), willChange: "transform, opacity",
          ...(glyph ? { color: tint, fontSize: side, lineHeight: 1, fontWeight: 300, textShadow: `0 0 10px ${tint}` } : { width: side, height: side, background: tint }),
          "--cm-o": ((opacity / 100) * 0.55 * 2 * particle.fade).toFixed(3),
          "--cm-dx": `${(particle.sway * drift).toFixed(1)}px`,
          "--cm-rot": `${(particle.turn * 8).toFixed(1)}deg`,
          "--cm-rest": `${Math.round(particle.left * 4) * (falling ? -1 : 1)}px`,
          animation: `cm-particles-${falling ? "fall" : "rise"} ${(particle.duration / rate).toFixed(2)}s ease-in-out ${(particle.delay / rate).toFixed(2)}s infinite`,
          ...cut,
        } as unknown as CSSProperties;
        return <span key={index} data-cm-particle="" style={style}>{glyph ? char : null}</span>;
      })}
      {editing ? <span style={{ position: "absolute", left: 6, top: 4, font: "600 11px/1 system-ui, sans-serif", color: "rgb(90 90 90 / 85%)", background: "rgb(255 255 255 / 70%)", padding: "2px 5px", borderRadius: 4 }}>Hạt trôi</span> : null}
    </div>
  );
}
