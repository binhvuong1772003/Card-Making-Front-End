"use client";

import { useEditor } from "@miditor/editor";
import { PhosphorIcon } from "./phosphor-icons";

// Thanh thu phóng nổi ở đáy vùng soạn thiệp (bản vẽ F). Thu phóng là lệnh của Miditor (`setZoom`, `fit`).
const STEP = 1.2;
const iconButton = {
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  borderRadius: 99,
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
} as const;

export function ZoomPill() {
  const editor = useEditor();
  const zoom = useEditor((view) => view.zoom);
  return (
    <div
      role="group"
      aria-label="Thu phóng"
      style={{
        position: "absolute",
        left: "50%",
        bottom: 16,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "4px 6px",
        background: "var(--miditor-chrome)",
        border: "1px solid var(--miditor-border)",
        borderRadius: 99,
        color: "var(--miditor-text)",
        boxShadow: "0 1px 2px rgba(42,34,36,0.06), 0 10px 28px rgba(42,34,36,0.08)",
        zIndex: 5,
      }}
    >
      <button type="button" aria-label="Thu nhỏ" onClick={() => editor.setZoom(zoom / STEP)} style={iconButton}>
        <PhosphorIcon name="minus" size={18} />
      </button>
      <span style={{ minWidth: 44, textAlign: "center", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{Math.round(zoom * 100)}%</span>
      <button type="button" aria-label="Phóng to" onClick={() => editor.setZoom(zoom * STEP)} style={iconButton}>
        <PhosphorIcon name="plusIcon" size={18} />
      </button>
      <span aria-hidden="true" style={{ width: 1, height: 18, background: "var(--miditor-border)", margin: "0 4px" }} />
      <button
        type="button"
        onClick={() => editor.fit()}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", border: 0, borderRadius: 99, background: "transparent", color: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
      >
        <PhosphorIcon name="fit" size={18} />
        Vừa khung
      </button>
    </div>
  );
}
