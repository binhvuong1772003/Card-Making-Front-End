"use client";

import { Accessibility, defaultPreset, PointerActivationConstraints, PointerSensor } from "@dnd-kit/dom";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import type { CustomFieldProps } from "@miditor/editor";
import { useMemo, useRef, useState } from "react";
import { uploadImage } from "@/lib/assets/upload-image";
import { cleanImages, MAX_ALBUM_IMAGES } from "@/lib/cards/blocks/album";

// Ô nhập danh sách ảnh cho khối Album ở bảng thuộc tính: thêm nhiều ảnh một lúc, kéo thả để đổi thứ tự (dnd-kit, cùng thư viện với
// bảng Lớp của Miditor), xoá. Mỗi ảnh tải lên Cloudinary như nút Tải ảnh của Miditor (cùng `uploadImage`), danh sách lưu là mảng
// địa chỉ. Màu và bo góc lấy từ biến của Miditor để khớp bảng.
// Kéo chỉ bằng chuột; người dùng bàn phím đổi chỗ bằng hai nút ‹ ›, chỉ hiện khi có focus. Phím mũi tên không dùng cho dnd-kit vì
// editor dùng chúng để dịch khối đang chọn.
const CSS = `
/* Miditor xếp các ô của bảng thành lưới hai cột và chỉ cho một hàng đầy đủ với vài kiểu ô (chữ, màu, danh sách...), chưa có kiểu "custom";
   không có dòng này danh sách ảnh chỉ chiếm nửa bề rộng. Nên sửa ở Miditor (ô custom chiếm cả hàng) rồi bỏ dòng này. */
[class*="grid2"] > :has(.cm-il-root){grid-column:1/-1}
.cm-il-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.cm-il-item{position:relative;min-width:0;aspect-ratio:3/4;border-radius:6px;overflow:hidden;background:var(--miditor-soft,#f4e6e9);box-shadow:inset 0 0 0 1px var(--miditor-border,#ece3e5);user-select:none;-webkit-user-select:none}
.cm-il-item[data-sortable]{cursor:grab}
.cm-il-item[data-dragging]{cursor:grabbing;z-index:5;box-shadow:0 8px 20px rgba(42,34,36,.3),0 0 0 2px var(--miditor-accent,#7b1e2b)}
.cm-il-item img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
.cm-il-item::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(42,34,36,.08);pointer-events:none}
.cm-il-badge{position:absolute;top:4px;left:4px;min-width:16px;height:16px;padding:0 4px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(255,255,255,.94);color:var(--miditor-text,#2a2224);font-size:10px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;box-shadow:0 1px 2px rgba(42,34,36,.18);pointer-events:none}
.cm-il-remove,.cm-il-move{opacity:0;transition:opacity .15s ease}
.cm-il-item:hover .cm-il-remove,.cm-il-item:focus-within .cm-il-remove,.cm-il-item:focus-within .cm-il-move{opacity:1}
.cm-il-item[data-dragging] .cm-il-remove{opacity:0}
@media (hover:none){.cm-il-remove{opacity:1}}
.cm-il-btn{width:18px;height:18px;padding:0;border:0;border-radius:9px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.95);color:var(--miditor-text,#2a2224);cursor:pointer;box-shadow:0 1px 3px rgba(42,34,36,.28);transition:background-color .15s ease,color .15s ease}
.cm-il-btn:hover:not(:disabled){background:#fff}
.cm-il-btn.cm-il-remove:hover{color:var(--miditor-danger,#b3261e)}
.cm-il-btn:disabled{opacity:.4;cursor:default}
.cm-il-btn:focus-visible,.cm-il-add:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-il-add{width:100%;height:36px;border-radius:var(--miditor-radius,8px);border:1px solid var(--miditor-border-input,#d9cdd0);background:#fff;color:var(--miditor-text,#2a2224);font:inherit;font-size:14px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:background-color .15s ease,border-color .15s ease}
.cm-il-add:hover:not(:disabled){background:var(--miditor-soft,#f4e6e9);border-color:var(--miditor-accent,#7b1e2b);color:var(--miditor-accent,#7b1e2b)}
.cm-il-add:disabled{cursor:default;color:var(--miditor-muted,#6e6063);background:var(--miditor-workspace,#f6f1f2)}
.cm-il-wait{animation:cm-il-pulse 1.2s ease-in-out infinite}
@keyframes cm-il-pulse{50%{opacity:.55}}
@media (prefers-reduced-motion:reduce){.cm-il-wait{animation:none}.cm-il-remove,.cm-il-move,.cm-il-btn,.cm-il-add{transition:none}}
`;

function Icon({ d, size = 12 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Đường vẽ Phosphor (MIT), cùng bộ icon với phần còn lại của editor.
const PLUS = "M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z";
const CLOSE = "M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z";
const LEFT = "M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z";
const RIGHT = "M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z";

// Đưa phần tử ở `from` tới vị trí `to`, giữ nguyên các phần tử còn lại.
function reorder<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return [...list];
  const next = [...list];
  next.splice(to, 0, next.splice(from, 1)[0]!);
  return next;
}

// Mã của từng ảnh cho dnd-kit: địa chỉ cộng số lần đã gặp, vì cùng một ảnh có thể xuất hiện hai lần. Đổi chỗ không làm mã đổi theo vị trí.
function idsOf(images: readonly string[]): string[] {
  const seen = new Map<string, number>();
  return images.map((src) => {
    const n = (seen.get(src) ?? 0) + 1;
    seen.set(src, n);
    return `${src}#${n}`;
  });
}

interface ThumbProps {
  id: string;
  src: string;
  index: number;
  last: boolean;
  readOnly: boolean;
  onRemove: () => void;
  onMove: (by: number) => void;
}

function Thumb({ id, src, index, last, readOnly, onRemove, onMove }: ThumbProps) {
  const { ref, isDragging } = useSortable({ id, index, disabled: readOnly });
  return (
    <li ref={ref} className="cm-il-item" data-sortable={readOnly ? undefined : ""} data-dragging={isDragging || undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ảnh Cloudinary người dùng tải lên */}
      <img src={src} alt={`Ảnh ${index + 1}`} draggable={false} />
      <span className="cm-il-badge" aria-hidden="true">
        {index + 1}
      </span>
      {!readOnly && (
        <>
          <button type="button" className="cm-il-btn cm-il-remove" aria-label={`Xoá ảnh ${index + 1}`} title="Xoá ảnh" onClick={onRemove} style={{ position: "absolute", top: 4, right: 4 }}>
            <Icon d={CLOSE} size={10} />
          </button>
          <div className="cm-il-move" style={{ position: "absolute", left: 4, right: 4, bottom: 4, display: "flex", justifyContent: "space-between" }}>
            <button type="button" className="cm-il-btn" aria-label={`Dời ảnh ${index + 1} lên trước`} title="Dời lên trước" disabled={index === 0} onClick={() => onMove(-1)}>
              <Icon d={LEFT} size={10} />
            </button>
            <button type="button" className="cm-il-btn" aria-label={`Dời ảnh ${index + 1} ra sau`} title="Dời ra sau" disabled={last} onClick={() => onMove(1)}>
              <Icon d={RIGHT} size={10} />
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export function ImageListInput({ label, value, onChange, readOnly }: CustomFieldProps) {
  const images = cleanImages(value);
  const ids = idsOf(images);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const picker = useRef<HTMLInputElement>(null);
  const full = images.length >= MAX_ALBUM_IMAGES;

  // Chỉ kéo bằng chuột, và phải kéo quá vài px mới tính là kéo để bấm nút trên ảnh không bị nuốt. Bỏ bộ đọc màn hình của dnd-kit:
  // nó hướng dẫn "nhấn Space để nhấc" mà ở đây không có bàn phím cho việc kéo.
  const dnd = useMemo(
    () => ({
      sensors: [PointerSensor.configure({ activationConstraints: [new PointerActivationConstraints.Distance({ value: 4 })] })],
      plugins: defaultPreset.plugins.filter((plugin) => plugin !== Accessibility),
    }),
    [],
  );

  const set = (next: string[]) => onChange(next);
  const move = (from: number, to: number) => set(reorder(images, from, to));

  const add = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    const room = MAX_ALBUM_IMAGES - images.length;
    const chosen = [...files].slice(0, room);
    if (files.length > room) setError(`Album chứa tối đa ${MAX_ALBUM_IMAGES} ảnh.`);
    setBusy(chosen.length);
    const uploaded = await Promise.all(
      chosen.map(async (file) => {
        try {
          return await uploadImage(file);
        } catch (failure) {
          setError(`Tải lên không thành công: ${failure instanceof Error ? failure.message : "lỗi không rõ"}`);
          return null;
        } finally {
          setBusy((n) => n - 1);
        }
      }),
    );
    const ok = uploaded.filter((url): url is string => url !== null);
    if (ok.length > 0) set([...images, ...ok]);
  };

  return (
    <div className="cm-il-root" style={{ display: "grid", gap: 8, minWidth: 0, width: "100%" }}>
      <style>{CSS}</style>
      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--miditor-muted, #6e6063)", fontVariantNumeric: "tabular-nums" }}>
        {label} ({images.length}/{MAX_ALBUM_IMAGES})
        {images.length > 1 && !readOnly && <span style={{ fontWeight: 400 }}> · kéo để đổi thứ tự</span>}
      </span>
      {(images.length > 0 || busy > 0) && (
        <DragDropProvider
          sensors={dnd.sensors}
          plugins={dnd.plugins}
          onDragEnd={(event) => {
            const { source } = event.operation;
            if (event.canceled || !isSortable(source)) return;
            if (source.initialIndex !== source.index) move(source.initialIndex, source.index);
          }}
        >
          <ul className="cm-il-grid">
            {images.map((src, index) => (
              <Thumb
                key={ids[index]}
                id={ids[index]!}
                src={src}
                index={index}
                last={index === images.length - 1}
                readOnly={Boolean(readOnly)}
                onRemove={() => set(images.filter((_, i) => i !== index))}
                onMove={(by) => move(index, index + by)}
              />
            ))}
            {Array.from({ length: busy }, (_, i) => (
              <li key={`wait-${i}`} className="cm-il-item cm-il-wait" aria-hidden="true" />
            ))}
          </ul>
        </DragDropProvider>
      )}
      {!readOnly && (
        <>
          <input ref={picker} type="file" accept="image/*" multiple hidden onChange={(event) => { void add(event.target.files); event.target.value = ""; }} />
          <button type="button" className="cm-il-add" disabled={busy > 0 || full} onClick={() => picker.current?.click()}>
            {!full && busy === 0 && <Icon d={PLUS} size={14} />}
            {busy > 0 ? `Đang tải ${busy} ảnh…` : full ? `Đã đủ ${MAX_ALBUM_IMAGES} ảnh` : "Thêm ảnh"}
          </button>
        </>
      )}
      {error && (
        <span role="alert" style={{ fontSize: 12, lineHeight: 1.4, color: "var(--miditor-danger, #b3261e)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
