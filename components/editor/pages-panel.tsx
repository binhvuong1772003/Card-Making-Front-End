"use client";

import { useMemo, useState } from "react";
import { Accessibility, defaultPreset, PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { ArrowDown, ArrowUp, Copy, DotsThree, Plus } from "@phosphor-icons/react";
import type { CardPage } from "@/lib/cards/document";
import { PageThumb } from "@/components/gallery/page-thumb";
import styles from "./pages-panel.module.css";

export type PagesPanelProps = {
  pages: CardPage[];
  activePageId: string;
  startPageId: string;
  readOnly?: boolean;
  onSelectPage: (pageId: string) => void;
  onRenamePage: (pageId: string, name: string) => void;
  onAddPage: () => void;
  onDuplicatePage: (pageId: string) => void;
  onMovePage: (pageId: string, direction: -1 | 1) => void;
  onSetStartPage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
};

export function PagesPanel({ pages, activePageId, startPageId, readOnly = false, onSelectPage, onRenamePage, onAddPage, onDuplicatePage, onMovePage, onSetStartPage, onDeletePage }: PagesPanelProps) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState("");
  const dnd = useMemo(() => ({ sensors: [PointerSensor.configure({ activationConstraints: [new PointerActivationConstraints.Distance({ value: 4 })] })], plugins: defaultPreset.plugins.filter((plugin) => plugin !== Accessibility) }), []);
  return <section className={styles.panel} aria-label="Các trang thiệp">
    <header className={styles.header}><div><h2>Trang</h2><span>{pages.length}/50 trang</span></div><button type="button" onClick={onAddPage} disabled={readOnly || pages.length >= 50} aria-label="Thêm trang"><Plus size={18} /></button></header>
    <DragDropProvider sensors={dnd.sensors} plugins={dnd.plugins} onDragEnd={(event) => {
      const { source } = event.operation;
      if (event.canceled || !isSortable(source)) return;
      const direction = Math.sign(source.index - source.initialIndex) as -1 | 0 | 1;
      for (let i = 0; i < Math.abs(source.index - source.initialIndex); i++) onMovePage(String(source.id), direction as -1 | 1);
    }}>
      <ol className={styles.list}>{pages.map((page, index) => <PageRow key={page.id} page={page} index={index} count={pages.length} active={activePageId === page.id} isStart={startPageId === page.id} readOnly={readOnly} renaming={renaming === page.id} name={name} setName={setName}
        onSelect={() => onSelectPage(page.id)} onBeginRename={() => { setName(page.name); setRenaming(page.id); }} onFinishRename={() => setRenaming(null)} onRename={(next) => onRenamePage(page.id, next)} onMove={(direction) => onMovePage(page.id, direction)} onDuplicate={() => onDuplicatePage(page.id)} onSetStart={() => onSetStartPage(page.id)} onDelete={() => {
          const inbound = pages.reduce((total, source) => total + Object.values(source.interactions).filter((link) => link.targetPageId === page.id).length, 0);
          if (window.confirm(`Xóa trang “${page.name}”? ${inbound} liên kết đến trang này sẽ bị gỡ.`)) onDeletePage(page.id);
        }} />)}</ol>
    </DragDropProvider>
    <button type="button" className={styles.setStart} disabled={readOnly || activePageId === startPageId} onClick={() => onSetStartPage(activePageId)}>Đặt trang đang chọn làm trang bắt đầu</button>
  </section>;
}

function PageRow({ page, index, count, active, isStart, readOnly, renaming, name, setName, onSelect, onBeginRename, onFinishRename, onRename, onMove, onDuplicate, onSetStart, onDelete }: {
  page: CardPage; index: number; count: number; active: boolean; isStart: boolean; readOnly: boolean; renaming: boolean; name: string; setName: (value: string) => void;
  onSelect: () => void; onBeginRename: () => void; onFinishRename: () => void; onRename: (value: string) => void; onMove: (direction: -1 | 1) => void; onDuplicate: () => void; onSetStart: () => void; onDelete: () => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id: page.id, index, disabled: readOnly });
  return <li ref={ref} data-dragging={isDragging || undefined} className={`${styles.item} ${active ? styles.active : ""}`}>
    <button type="button" className={styles.select} onClick={onSelect} aria-current={active ? "page" : undefined} aria-label={`Chọn trang ${index + 1}: ${page.name}`}>
      <PageThumb data={page.data as unknown as Record<string, unknown>} className={styles.thumbnail} /><span className={styles.pageNum}>{index + 1}</span>
    </button>
    {renaming ? <form className={styles.rename} onSubmit={(event) => { event.preventDefault(); const next = name.trim(); if (next) onRename(next.slice(0, 80)); onFinishRename(); }}>
      <input autoFocus maxLength={80} value={name} aria-label="Tên trang" onChange={(event) => setName(event.target.value)} onBlur={() => { const next = name.trim(); if (next && next !== page.name) onRename(next); onFinishRename(); }} onKeyDown={(event) => { if (event.key === "Escape") onFinishRename(); }} />
    </form> : readOnly ? <span className={styles.name}>{page.name}</span> : <button type="button" className={styles.name} title="Đổi tên trang" onClick={onBeginRename}>{page.name}</button>}
    {isStart && <span className={styles.start}>Bắt đầu</span>}
    <div className={styles.actions}>
      {!readOnly && <button ref={handleRef} type="button" aria-label={`Kéo để sắp xếp ${page.name}`} title="Kéo để sắp xếp" disabled={readOnly}><DotsThree size={18} /></button>}
      {!readOnly && <>
        <button type="button" aria-label={`Chuyển ${page.name} lên`} disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp size={16} /></button>
        <button type="button" aria-label={`Chuyển ${page.name} xuống`} disabled={index === count - 1} onClick={() => onMove(1)}><ArrowDown size={16} /></button>
        <button type="button" aria-label={`Nhân bản ${page.name}`} disabled={count >= 50} onClick={onDuplicate}><Copy size={16} /></button>
        <details className={styles.menu}><summary aria-label={`Thao tác ${page.name}`}><DotsThree size={18} /></summary><div className={styles.menuItems}>
          <button type="button" onClick={onSetStart}>Đặt làm trang bắt đầu</button>
          <button type="button" disabled={count >= 50} onClick={onDuplicate}>Nhân bản trang</button>
          <button type="button" disabled={count <= 1} onClick={onDelete}>Xóa trang…</button>
        </div></details>
      </>}
    </div>
  </li>;
}
