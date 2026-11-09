"use client";

import type { CustomFieldProps } from "@miditor/editor";
import { cutStyle } from "@/components/blocks/photo-frame-view";
import { FRAME_SHAPE_LABELS, FRAME_SHAPE_ORDER, FRAME_SHAPES, frameGeometry, type FrameShape } from "@/lib/cards/blocks/photo-frame";

// Lưới chọn hình dạng cho khối Khung ảnh (kiểu `frame-shape`): mỗi hình là một ô nhỏ vẽ bằng đúng cách cắt của khối, hình đang chọn tô đỏ đô.
// Lưu tên hình ("arch", "heart"...). Miditor xếp ô của bảng thành lưới hai cột và chưa cho ô "custom" chiếm cả hàng, nên dòng CSS đầu ép nó
// chiếm cả hàng (nên sửa ở Miditor rồi bỏ), cùng dạng với `date-input.tsx`.
const CSS = `
[class*="grid2"] > :has(.cm-shape-root){grid-column:1/-1}
.cm-shape{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 2px;border-radius:10px;border:1px solid var(--miditor-border-input,#d9cdd0);background:#fff;color:var(--miditor-text,#2a2224);font:inherit;font-size:10px;line-height:1.2;cursor:pointer}
.cm-shape:hover:not(:disabled){border-color:var(--miditor-accent,#7b1e2b)}
.cm-shape[aria-pressed=true]{border:2px solid var(--miditor-accent,#7b1e2b);background:var(--miditor-soft,#f4e6e9);padding:5px 1px}
.cm-shape:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-shape:disabled{opacity:.5;cursor:default}
`;

const isShape = (value: unknown): value is FrameShape => (FRAME_SHAPES as readonly unknown[]).includes(value);

export function FrameShapeInput({ label, value, onChange, readOnly }: CustomFieldProps) {
  const current = isShape(value) ? value : "rectangle";
  return (
    <div className="cm-shape-root" role="group" aria-label={label} style={{ display: "grid", gap: 6, minWidth: 0, width: "100%" }}>
      <style>{CSS}</style>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--miditor-muted, #6e6063)" }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {FRAME_SHAPE_ORDER.map((shape) => (
          <button key={shape} type="button" className="cm-shape" aria-pressed={shape === current} disabled={Boolean(readOnly)} onClick={() => onChange(shape)}>
            <span aria-hidden="true" style={{ display: "block", width: 40, height: 40, background: "var(--miditor-accent, #7b1e2b)", ...cutStyle(frameGeometry(shape)) }} />
            {FRAME_SHAPE_LABELS[shape]}
          </button>
        ))}
      </div>
    </div>
  );
}
