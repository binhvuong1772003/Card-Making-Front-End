"use client";

import type { TreeNode } from "@miditor/core";
import type { CardPage, PageNavigation, PageTransition } from "@/lib/cards/document";
import { canNavigateFrom, normalizePageNavigation } from "@/lib/cards/page-actions";
import styles from "./page-interaction-panel.module.css";

const EFFECTS: [PageTransition, string][] = [["fade", "Mờ dần"], ["slide-left", "Trượt sang trái"], ["slide-right", "Trượt sang phải"], ["slide-up", "Trượt lên"], ["zoom", "Thu phóng"], ["none", "Không hiệu ứng"]];

export type PageInteractionPanelProps = {
  pages: CardPage[];
  sourceNode: TreeNode | null;
  value?: PageNavigation;
  onChange: (interaction: PageNavigation | undefined) => void;
  onPreview?: (interaction: PageNavigation) => void;
};

export function PageInteractionPanel({ pages, sourceNode, value, onChange, onPreview }: PageInteractionPanelProps) {
  if (!sourceNode || !canNavigateFrom(sourceNode)) return <section className={styles.panel}><h3>Tương tác</h3><p>Chọn văn bản, ảnh, hình, nút hoặc nhóm không chứa biểu mẫu để thêm liên kết trang.</p></section>;
  const update = (patch: Partial<PageNavigation>) => onChange(normalizePageNavigation({ type: "go-to-page", targetPageId: value?.targetPageId ?? "", transition: value?.transition ?? "fade", durationMs: value?.durationMs ?? 450, ...patch }, pages));
  return <section className={styles.panel} aria-label="Tương tác">
    <h3>Tương tác</h3><label className={styles.label} htmlFor="page-link-target">Chuyển đến trang</label>
    <select id="page-link-target" value={value?.targetPageId ?? ""} onChange={(event) => update({ targetPageId: event.target.value })}>
      <option value="">Không liên kết</option>{pages.map((page) => <option key={page.id} value={page.id}>{page.name}</option>)}
    </select>
    {value && <>
      <label className={styles.label} htmlFor="page-link-effect">Hiệu ứng</label>
      <select id="page-link-effect" value={value.transition} onChange={(event) => update({ transition: event.target.value as PageTransition })}>{EFFECTS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
      {value.transition !== "none" && <label className={styles.label}>Thời lượng <span>{value.durationMs} ms</span><input type="range" min="100" max="1200" step="50" value={value.durationMs} onChange={(event) => update({ durationMs: Number(event.target.value) })} /></label>}
      <div className={styles.buttons}><button type="button" onClick={() => onPreview?.(value)} disabled={!onPreview}>Thử liên kết</button><button type="button" className={styles.remove} onClick={() => onChange(undefined)}>Gỡ liên kết</button></div>
      <p className={styles.note}>Liên kết chỉ chạy trong xem trước và thiệp đã xuất bản.</p>
    </>}
  </section>;
}
