"use client";

import type { HostToolPanelProps } from "@miditor/editor";
import { DecorationView } from "@/components/blocks/decoration-view";
import { GradientView } from "@/components/blocks/gradient-view";
import { readGradient } from "@/lib/cards/blocks/gradient";
import { ParticlesView } from "@/components/blocks/particles-view";
import { ANIMATED_GROUPS, matchPresets, type AnimatedPreset } from "@/lib/cards/blocks/animated-presets";
import { PARTICLE_SHAPES } from "@/lib/cards/blocks/particles";
import { BURST_PALETTE_NAMES, BURST_PALETTES, readBurstConfig } from "@/lib/cards/blocks/burst";

// Các nhóm mẫu động của tab Trang trí (Nền động, Song Hỷ, Quà mừng). Ô xem trước chạy thật bằng chính khối đó.
const CSS = `
.cm-anim-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:start}
.cm-anim-card{display:grid;gap:5px;min-width:0;padding:3px;border:1px solid transparent;border-radius:9px}
.cm-anim-add{display:block;width:100%;border:0;border-radius:7px;background:transparent;padding:0;text-align:left;cursor:pointer;user-select:none;-webkit-user-select:none}
.cm-anim-add:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:2px}
.cm-anim-add:hover .cm-anim-thumb{box-shadow:inset 0 0 0 1px var(--miditor-border,#ece3e5),0 0 0 2px color-mix(in srgb,var(--miditor-accent,#7b1e2b) 30%,transparent)}
.cm-anim-thumb{position:relative;display:grid;place-items:center;width:100%;aspect-ratio:1;overflow:hidden;border-radius:7px;box-shadow:inset 0 0 0 1px var(--miditor-border,#ece3e5)}
.cm-anim-name{font-size:11px;font-weight:500;line-height:1.25}
.cm-anim-hint{font-size:10px;line-height:1.25;color:var(--miditor-muted,#6e6063)}
`;

// Ô xem trước của Pháo: mười chữ nổ ra từ tâm rồi lặp lại, thu nhỏ cho vừa ô.
const BURST_PREVIEW_CSS = `
@keyframes cm-burst-preview { 0% { opacity: 0; transform: translate(-50%, -50%) scale(0); } 15% { opacity: 1; transform: translate(-50%, -50%) scale(1.3); } 70%, 100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(.6) rotate(var(--rot)); } }
@media (prefers-reduced-motion: reduce) { [data-burst-preview] > span { animation: none !important; opacity: .7; } }`;
function BurstArtwork({ preset }: { preset: AnimatedPreset }) {
  const config = readBurstConfig(preset.props);
  const colors = BURST_PALETTES[config.palette];
  return <div data-burst-preview="" style={{ position: "absolute", inset: 0 }}>
    <style>{BURST_PREVIEW_CSS}</style>
    {Array.from({ length: 10 }, (_, index) => {
      const angle = (index / 10) * Math.PI * 2 + 0.3;
      const distance = 30 + (index % 3) * 9;
      return <span key={index} style={{ position: "absolute", left: "50%", top: "50%", fontSize: 11 + (index % 4) * 3, lineHeight: 1, color: colors[index % colors.length], textShadow: `0 0 6px ${colors[index % colors.length]}`, opacity: 0,
        "--dx": `${(Math.cos(angle) * distance).toFixed(1)}px`, "--dy": `${(Math.sin(angle) * distance).toFixed(1)}px`, "--rot": `${(index * 47) % 180 - 90}deg`,
        animation: `cm-burst-preview 1.8s cubic-bezier(.25, .46, .45, .94) ${(index * 0.06).toFixed(2)}s infinite` } as React.CSSProperties}>{config.char}</span>;
    })}
  </div>;
}

// Hình ô xem trước: hạt trôi vẽ trong khung vuông; hình tĩnh và hộp quà vẽ bằng chính khối Trang trí.
function Artwork({ preset }: { preset: AnimatedPreset }) {
  if (preset.type === "Burst") return <BurstArtwork preset={preset} />;
  if (preset.type === "Gradient") return <div style={{ position: "absolute", inset: 0 }}><GradientView config={readGradient(preset.props)} /></div>;
  if (preset.type === "Particles") {
    const p = preset.props;
    return <ParticlesView
      shape={PARTICLE_SHAPES.includes(p.shape as never) ? p.shape as (typeof PARTICLE_SHAPES)[number] : "Vuông"}
      color={String(p.color)} count={Number(p.count)} size={Number(p.size)} speed={Number(p.speed)} opacity={Number(p.opacity)} drift={Number(p.drift)} editing={false}
      char={typeof p.char === "string" ? p.char : undefined} palette={BURST_PALETTE_NAMES.includes(p.palette as never) ? p.palette as (typeof BURST_PALETTE_NAMES)[number] : undefined}
    />;
  }
  const p = preset.props;
  return <div style={{ width: p.motion ? "78%" : "64%", aspectRatio: `${preset.size.w} / ${preset.size.h}` }}>
    <DecorationView src={String(p.src)} alt="" fit="contain" motion={p.motion === true} />
  </div>;
}

function PresetCard({ preset, editor, drag }: { preset: AnimatedPreset } & Pick<HostToolPanelProps, "editor" | "drag">) {
  const overrides = { size: preset.size, props: preset.props };
  const add = () => editor.addBlock(preset.type, overrides);
  return (
    <div className="cm-anim-card">
      <button type="button" className="cm-anim-add" aria-label={`Thêm ${preset.name}`} onPointerDown={(event) => {
        const source = event.currentTarget.querySelector<HTMLElement>("[data-drag-artwork]");
        if (source) drag.press(event, preset.type, preset.name, { source, preview: <div style={{ width: "100%", height: "100%", background: preset.stage }}><Artwork preset={preset} /></div>, overrides });
      }} onClick={() => { if (!drag.wasDragged()) add(); }}>
        <div data-drag-artwork className="cm-anim-thumb" style={{ background: preset.stage }}><Artwork preset={preset} /></div>
      </button>
      <span className="cm-anim-name">{preset.name}</span>
      <span className="cm-anim-hint">{preset.hint}</span>
    </div>
  );
}

export function AnimatedDecorations({ editor, drag, search }: Pick<HostToolPanelProps, "editor" | "drag"> & { search: string }) {
  const matches = matchPresets(search);
  return <>
    <style>{CSS}</style>
    {ANIMATED_GROUPS.map((group) => {
      const presets = matches.filter((preset) => preset.group === group);
      if (presets.length === 0) return null;
      return <section key={group} className="cm-deco-section" aria-label={group}>
        <div className="cm-deco-head"><h3>{group}</h3></div>
        <div className="cm-anim-grid">{presets.map((preset) => <PresetCard key={preset.id} preset={preset} editor={editor} drag={drag} />)}</div>
      </section>;
    })}
  </>;
}
