"use client";

import { useEditor } from "@miditor/editor";
import Link from "next/link";
import type { CSSProperties } from "react";
import { toast } from "sonner";
import { PhosphorIcon } from "./phosphor-icons";
import { StatusSeal, type SealState } from "./status-seal";

// Đầu trang của CardMaking (bản vẽ F): tên hiệu, tên thiệp, con dấu | hoàn tác, làm lại, máy tính hoặc điện thoại | xem trước, xuất bản.
// Thay phần đầu trang của Miditor bằng các lệnh điều khiển của nó (`useEditor`); màu và bo góc lấy từ các biến của `appearance`.
const iconButton: CSSProperties = {
  width: 36,
  height: 36,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  borderRadius: "var(--miditor-radius)",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};
const SELECTED_TINT = "color-mix(in srgb, var(--miditor-accent) 11%, var(--miditor-chrome))";

export function CardHeader({ title, seal }: { title: string; seal: { state: SealState; label: string } }) {
  const editor = useEditor();
  const canUndo = useEditor((view) => view.canUndo);
  const canRedo = useEditor((view) => view.canRedo);
  const frame = useEditor((view) => view.frame);
  const soon = () => toast.info("Tính năng này chưa có.");

  const frameButton = (value: "desktop" | "phone", label: string, icon: "monitorIcon" | "phoneIcon") => {
    const on = frame === value;
    return (
      <button
        type="button"
        aria-pressed={on}
        onClick={() => editor.setFrame(value)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          padding: "0 16px",
          border: 0,
          background: on ? SELECTED_TINT : "transparent",
          color: on ? "var(--miditor-accent)" : "var(--miditor-text)",
          fontSize: 13,
          fontWeight: on ? 600 : 500,
          cursor: "pointer",
        }}
      >
        <PhosphorIcon name={icon} />
        {label}
      </button>
    );
  };

  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "10px 24px",
        padding: "0 20px",
        minHeight: 60,
        background: "var(--miditor-chrome)",
        borderBottom: "1px solid var(--miditor-border)",
        color: "var(--miditor-text)",
      }}
    >
      <div style={{ flex: "1 1 260px", display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
        <Link href="/" style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.01em", color: "inherit", textDecoration: "none", whiteSpace: "nowrap" }}>
          CardMaking
        </Link>
        <span style={{ fontSize: 15, fontWeight: 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
        <StatusSeal title={title} state={seal.state} label={seal.label} />
      </div>

      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button type="button" aria-label="Hoàn tác" disabled={!canUndo} onClick={() => editor.undo()} style={{ ...iconButton, opacity: canUndo ? 1 : 0.35 }}>
            <PhosphorIcon name="undoIcon" size={20} />
          </button>
          <button type="button" aria-label="Làm lại" disabled={!canRedo} onClick={() => editor.redo()} style={{ ...iconButton, opacity: canRedo ? 1 : 0.35 }}>
            <PhosphorIcon name="redoIcon" size={20} />
          </button>
        </div>
        <div
          role="group"
          aria-label="Kiểu bố cục"
          style={{ display: "inline-flex", overflow: "hidden", border: "1px solid var(--miditor-border-input)", borderRadius: "var(--miditor-radius)", background: "var(--miditor-canvas)" }}
        >
          {frameButton("desktop", "Máy tính", "monitorIcon")}
          {frameButton("phone", "Điện thoại", "phoneIcon")}
        </div>
      </div>

      <div style={{ flex: "1 1 260px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
        <button
          type="button"
          onClick={soon}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 16px", border: "1px solid var(--miditor-border-input)", borderRadius: "var(--miditor-radius)", background: "transparent", color: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          <PhosphorIcon name="eye" />
          Xem trước
        </button>
        <button
          type="button"
          onClick={soon}
          style={{ height: 36, padding: "0 20px", border: 0, borderRadius: "var(--miditor-radius)", background: "var(--miditor-accent)", color: "var(--miditor-on-accent)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Xuất bản
        </button>
      </div>
    </header>
  );
}
