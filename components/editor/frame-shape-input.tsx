"use client";

import type { CustomFieldProps } from "@miditor/editor";
import { useEffect, useState } from "react";
import { cutStyle } from "@/components/blocks/photo-frame-view";
import { frameGeometry } from "@/lib/cards/blocks/photo-frame";
import { catalogApi, type CatalogFrame } from "@/lib/cards/catalog-api";

const CSS = `
[class*="grid2"] > :has(.cm-shape-root){grid-column:1/-1}
.cm-shape{display:flex;flex-direction:column;align-items:center;gap:4px;padding:6px 2px;border-radius:10px;border:1px solid var(--miditor-border-input,#d9cdd0);background:#fff;color:var(--miditor-text,#2a2224);font:inherit;font-size:10px;line-height:1.2;cursor:pointer}
.cm-shape:hover:not(:disabled){border-color:var(--miditor-accent,#7b1e2b)}
.cm-shape[aria-pressed=true]{border:2px solid var(--miditor-accent,#7b1e2b);background:var(--miditor-soft,#f4e6e9);padding:5px 1px}
.cm-shape:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-shape:disabled{opacity:.5;cursor:default}
`;

export function FrameShapeInput({ label, value, onChange, readOnly }: CustomFieldProps) {
  const [frames, setFrames] = useState<CatalogFrame[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const current = typeof value === "object" && value !== null && "id" in value && typeof value.id === "string" ? value.id : typeof value === "string" ? value : "rectangle";

  useEffect(() => {
    const controller = new AbortController();
    catalogApi.frames(24, undefined, controller.signal).then((page) => {
      setFrames(page.nodes); setCursor(page.pageInfo.endCursor); setHasMore(page.pageInfo.hasNextPage);
    }).catch(() => { if (!controller.signal.aborted) setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const loadMore = async () => {
    if (!cursor || loading || readOnly) return;
    setLoading(true);
    try {
      const page = await catalogApi.frames(24, cursor);
      setFrames((items) => [...items, ...page.nodes]); setCursor(page.pageInfo.endCursor); setHasMore(page.pageInfo.hasNextPage); setError(false);
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  return (
    <div className="cm-shape-root" role="group" aria-label={label} style={{ display: "grid", gap: 6, minWidth: 0, width: "100%" }}>
      <style>{CSS}</style>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--miditor-muted, #6e6063)" }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {frames.map((shape) => (
          <button key={shape.id} type="button" className="cm-shape" aria-pressed={shape.id === current} disabled={Boolean(readOnly)} onClick={() => onChange({ id: shape.id, geometry: shape.geometry, maskPath: shape.maskPath ?? "" })}>
            <span aria-hidden="true" style={{ display: "block", width: 40, height: 40, background: "var(--miditor-accent, #7b1e2b)", ...cutStyle(frameGeometry(shape.id, shape.geometry, shape.maskPath ?? undefined)) }} />
            {shape.label}
          </button>
        ))}
      </div>
      {loading && <span style={{ fontSize: 11, color: "var(--miditor-muted,#6e6063)" }}>Đang tải khung…</span>}
      {error && <span role="alert" style={{ fontSize: 11, color: "var(--miditor-danger,#a21d2d)" }}>Không tải được thư viện khung.</span>}
      {hasMore && <button type="button" className="cm-shape" disabled={Boolean(readOnly) || loading} onClick={loadMore}>Xem thêm khung</button>}
    </div>
  );
}
