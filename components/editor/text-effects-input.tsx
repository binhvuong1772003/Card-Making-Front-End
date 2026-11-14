"use client";

import type { CustomFieldProps } from "@miditor/editor";
import { XIcon } from "@phosphor-icons/react";
import { cleanTextEffects, type CurveTextEffect } from "@/lib/cards/blocks/text-effects";

export function TextEffectsInput({ label, value, onChange, readOnly }: CustomFieldProps) {
  const effects = cleanTextEffects(value);
  const curve = effects.find((effect) => effect.type === "curve");
  const update = (next: CurveTextEffect[]) => onChange(next);

  return (
    <div role="group" aria-label={label} style={{ display: "grid", gap: 10, minWidth: 0, width: "100%" }}>
      {!curve ? (
        <button type="button" disabled={Boolean(readOnly)} onClick={() => update([...effects, { id: crypto.randomUUID(), type: "curve", amount: 50 }])}
          style={{ minHeight: 40, border: "1px solid var(--miditor-border-input,#d9cdd0)", borderRadius: 8, background: "var(--miditor-page,#fff)", color: "var(--miditor-text,#2a2224)", font: "inherit", fontWeight: 600, cursor: readOnly ? "default" : "pointer" }}>
          + Thêm hiệu ứng cong
        </button>
      ) : (
        <div style={{ display: "grid", gap: 8, padding: 10, border: "1px solid var(--miditor-border-input,#d9cdd0)", borderRadius: 10, background: "var(--miditor-page,#fff)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <strong style={{ fontSize: 13 }}>Cong</strong>
            <button type="button" aria-label="Xoá hiệu ứng cong" disabled={Boolean(readOnly)} onClick={() => update(effects.filter((effect) => effect.id !== curve.id))}
              style={{ display: "grid", placeItems: "center", border: 0, background: "transparent", color: "var(--miditor-muted,#6e6063)", cursor: "pointer", minWidth: 32, minHeight: 32 }}><XIcon size={16} aria-hidden="true" /></button>
          </div>
          <label style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 8, fontSize: 12, color: "var(--miditor-muted,#6e6063)" }}>
            Độ cong <output>{curve.amount}</output>
            <input aria-label="Độ cong chữ" type="range" min={-100} max={100} step={1} value={curve.amount} disabled={Boolean(readOnly)} onChange={(event) => update(effects.map((effect) => effect.id === curve.id ? { ...effect, amount: Number(event.target.value) } : effect))} style={{ gridColumn: "1 / -1", width: "100%", accentColor: "var(--miditor-accent,#7b1e2b)" }} />
          </label>
          <span style={{ fontSize: 11, color: "var(--miditor-muted,#6e6063)" }}>Kéo sang trái hoặc phải để đổi hướng cong.</span>
        </div>
      )}
    </div>
  );
}
