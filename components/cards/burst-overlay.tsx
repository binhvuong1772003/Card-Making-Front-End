"use client";

import { useEffect, useMemo, type CSSProperties } from "react";
import { BURST_DURATION, BURST_JITTER, BURST_LEAF_PATH, burstParticles, type BurstConfig } from "@/lib/cards/blocks/burst";

// Lớp phủ pháo: cố định phủ cả màn hình, độc lập với trang nên vẫn bay tiếp khi thiệp chuyển sang trang kế.
// Keyframe `particle-burst` lấy nguyên từ trang mẫu.
const CSS = `
@keyframes cm-burst { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0) rotate(0deg); } 15% { opacity: 1; transform: translate(-50%, -50%) scale(1.3) rotate(var(--rot-start, 15deg)); } 100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(.6) rotate(var(--rot-end, 180deg)); } }`;

export function BurstOverlay({ config, seed, onDone }: { config: BurstConfig; seed: number; onDone: () => void }) {
  const particles = useMemo(() => burstParticles(config, seed), [config, seed]);
  useEffect(() => {
    const timer = window.setTimeout(onDone, (config.delay + BURST_JITTER + BURST_DURATION + 0.1) * 1000);
    return () => window.clearTimeout(timer);
  }, [config.delay, onDone]);
  return (
    <div aria-hidden="true" data-burst="" style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none", overflow: "hidden" }}>
      <style>{CSS}</style>
      {particles.map((particle, index) => <div key={index} style={{
        position: "absolute", left: "50%", top: "50%", color: particle.color, fontSize: `${particle.size.toFixed(1)}px`, fontWeight: 300, lineHeight: 1, opacity: 0,
        textShadow: `0 0 10px ${particle.color}`,
        "--dx": `${particle.dx.toFixed(1)}px`, "--dy": `${particle.dy.toFixed(1)}px`,
        "--rot-start": `${particle.rotStart.toFixed(1)}deg`, "--rot-end": `${particle.rotEnd.toFixed(1)}deg`,
        animation: `cm-burst ${BURST_DURATION}s cubic-bezier(.25, .46, .45, .94) ${(config.delay + particle.delay).toFixed(3)}s 1 normal forwards`,
      } as CSSProperties}>{config.shape === "Lá" ? <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style={{ display: "block" }}><path d={BURST_LEAF_PATH} /></svg> : config.char}</div>)}
    </div>
  );
}
