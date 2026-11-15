"use client";

import type { ComponentDef, JsonValue } from "@miditor/core";
import type { HostToolPanelProps } from "@miditor/editor";
import { useEffect, useRef, useState } from "react";
import { cardRenderers, STATIC_METADATA } from "@/lib/cards/blocks";
import { cardDefinitions } from "@/lib/cards/blocks/definitions";
import { formBlock } from "@/lib/cards/blocks/form";
import { newFormId } from "@/lib/cards/forms/form-id";
import { formPresets, type FormPreset } from "@/lib/cards/blocks/form-presets";
import { nodeStyleCss } from "@/lib/cards/blocks/node-style";
import { cutStyle } from "@/components/blocks/photo-frame-view";
import { frameGeometry, photoFrameBlock } from "@/lib/cards/blocks/photo-frame";
import { AlbumThumbnail } from "@/components/blocks/album-thumbnail";
import { THUMBNAIL_BACKGROUND, ThumbnailLandscape } from "@/components/blocks/thumbnail-landscape";
import { catalogApi, type CatalogFrame } from "@/lib/cards/catalog-api";

// Công cụ "Thành phần" trên thanh trái: các kiểu khối của CardMaking (lịch, album, bản đồ) dưới dạng thẻ có hình xem trước thật, bấm để thêm vào trang.
// Nhóm "Biểu mẫu" khác các nhóm còn lại: chỉ có MỘT loại khối `Form` với ba bộ câu hỏi dựng sẵn (`formPresets`), nên thẻ của nhóm này là các mẫu chứ
// không phải các loại. Mỗi nhóm duyệt tối đa sáu mục, mỗi lượt hai mục; mũi tên cuối mở "Xem tất cả".
// Tên "Mẫu" để dành cho mẫu cả tấm thiệp.
// Album dùng sơ đồ bố cục dịu màu; các khối khác vẽ ở chế độ "static" rồi thu nhỏ vừa thẻ. Thư viện "Khối" mặc định của
// Miditor chỉ có chữ và icon; bảng này không thay nó, chỉ thêm một cách chọn bằng mắt. Thêm kiểu mới vào `cardDefinitions` là bảng tự có thẻ.
// Địa điểm mẫu chỉ để xem; khối thêm vào trang bắt đầu bằng mặc định.
function sampleProps(type: string, def: ComponentDef): Record<string, JsonValue> {
  const props: Record<string, JsonValue> = { ...def.defaultProps };
  if (type === "Map") Object.assign(props, { name: "Trung tâm Hội nghị White Palace", address: "194 Hoàng Văn Thụ, Phú Nhuận" });
  return props;
}

// Một chỗ trong bảng: một loại khối, hoặc một bộ câu hỏi dựng sẵn của khối `Form`.
type PanelItem = { kind: "block"; type: string; def: ComponentDef } | { kind: "preset"; preset: FormPreset } | { kind: "frame"; shape: CatalogFrame };

function FrameArtwork({ shape, geometry, maskPath, style = {} }: { shape: string; geometry?: string; maskPath?: string | null; style?: React.CSSProperties }) {
  return (
    <div data-drag-artwork style={{ overflow: "hidden", ...cutStyle(frameGeometry(shape, geometry, maskPath ?? undefined)), ...style }}>
      <ThumbnailLandscape />
    </div>
  );
}

function Thumb({ type, def, props, dragPreview = false }: { type: string; def: ComponentDef; props: Record<string, unknown>; dragPreview?: boolean }) {
  const { w, h } = def.size ?? { w: 340, h: 300 };
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const photoFrame = type.startsWith("PhotoFrame");
  const albumThumbnail = type.startsWith("Album") && !dragPreview;

  useEffect(() => {
    if (photoFrame || albumThumbnail) return;
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(Math.min(entry.contentRect.width / w, entry.contentRect.height / h));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [photoFrame, albumThumbnail, w, h]);

  if (albumThumbnail) {
    return <div data-drag-artwork className="cm-tpl-thumb"><AlbumThumbnail type={type} /></div>;
  }

  if (photoFrame) {
    const shapeValue = typeof props.shape === "object" && props.shape !== null ? props.shape as Record<string, JsonValue> : null;
    const shape = typeof shapeValue?.id === "string" ? shapeValue.id : typeof props.shape === "string" ? props.shape : "rectangle";
    const geometry = typeof shapeValue?.geometry === "string" ? shapeValue.geometry : undefined;
    const maskPath = typeof shapeValue?.maskPath === "string" ? shapeValue.maskPath : undefined;
    return (
      <div ref={box} className="cm-tpl-thumb" aria-hidden="true" style={{ display: "grid", placeItems: "center", background: THUMBNAIL_BACKGROUND }}>
        <FrameArtwork shape={shape} geometry={geometry} maskPath={maskPath} style={{ width: "76%", aspectRatio: `${w} / ${h}` }} />
      </div>
    );
  }

  const draw = cardRenderers[type as keyof typeof cardRenderers];
  return (
    <div ref={box} data-drag-artwork className={`cm-tpl-thumb${dragPreview ? " cm-tpl-thumb-preview" : ""}`}>
      <div aria-hidden="true" inert style={{ position: "absolute", left: `calc(50% - ${w * scale / 2}px)`, top: `calc(50% - ${h * scale / 2}px)`, width: w, height: h, boxSizing: "border-box", transform: `scale(${scale})`, transformOrigin: "top left", pointerEvents: "none", ...nodeStyleCss(def.defaultStyles) }}>
        {draw?.({ id: type, props: props as never, device: "desktop", responsive: false, theme: undefined, metadata: STATIC_METADATA, children: null })}
      </div>
    </div>
  );
}

// Các nhóm theo thứ tự xuất hiện đầu tiên trong `cardDefinitions`. Gặp `Form` thì thay bằng nhóm mẫu: cùng một loại, ba bộ câu hỏi khác nhau.
function groups(frames: CatalogFrame[]): [string, PanelItem[]][] {
  const byCategory = new Map<string, PanelItem[]>();
  for (const [type, def] of Object.entries(cardDefinitions)) {
    if (type === "Text") continue; // Miditor already exposes the built-in text block.
    // Trang trí và Hạt trôi có chỗ riêng ở tab "Trang trí" (kho ảnh và các mẫu động), thẻ trống ở đây chỉ gây rối.
    if (type === "Decoration" || type === "Particles" || type === "Burst" || type === "Gradient") continue;
    const category = def.category ?? "Khác";
    if (type === "Form") {
      byCategory.set(category, formPresets.map((preset) => ({ kind: "preset", preset })));
      continue;
    }
    if (type === "PhotoFrame") {
      byCategory.set(category, frames.map((shape) => ({ kind: "frame", shape })));
      continue;
    }
    byCategory.set(category, [...(byCategory.get(category) ?? []), { kind: "block", type, def }]);
  }
  return [...byCategory];
}

const PAGE_SIZE = 2;
const PREVIEW_LIMIT = 6;

const CSS = `
.cm-tpl{height:100%;overflow-y:auto;padding:12px;box-sizing:border-box;color:var(--miditor-text,#2a2224)}
.cm-tpl h3{margin:0;font-size:13px;font-weight:600;color:var(--miditor-muted,#6e6063)}
.cm-tpl-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:16px 0 8px;min-height:28px}
.cm-tpl-head:first-child{margin-top:0}
.cm-tpl-head h3{margin:0}
.cm-tpl-carousel{position:relative}
.cm-tpl-window{overflow:hidden;padding:3px;margin:-3px}
.cm-tpl-track{display:flex;gap:8px;transition:transform .3s cubic-bezier(.22,1,.36,1)}
.cm-tpl-track>.cm-tpl-grid{flex:0 0 100%;min-width:0}
.cm-tpl-nav{position:absolute;top:4px;left:0;right:0;aspect-ratio:2;display:flex;align-items:center;justify-content:space-between;pointer-events:none}
.cm-tpl-all{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;box-sizing:border-box;border:1px solid var(--miditor-accent,#7b1e2b);background:var(--miditor-panel,#fff);padding:4px;border-radius:50%;color:var(--miditor-accent,#7b1e2b);box-shadow:0 3px 10px #2a222433;cursor:pointer;pointer-events:auto;transition:transform .15s ease,background-color .15s ease,color .15s ease,box-shadow .15s ease}
.cm-tpl-all svg{width:18px;height:18px;stroke:currentColor;stroke-width:4}
.cm-tpl-all:hover:not(:disabled){background:var(--miditor-accent,#7b1e2b);color:#fff}
.cm-tpl-all:active:not(:disabled){transform:scale(.92);box-shadow:0 1px 4px #2a222433}
.cm-tpl-all:disabled{visibility:hidden;pointer-events:none}
.cm-tpl-all:focus-visible,.cm-tpl-back:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-tpl-back{display:inline-flex;align-items:center;gap:4px;border:0;background:transparent;padding:4px 6px 4px 2px;margin-bottom:8px;border-radius:6px;color:var(--miditor-text,#2a2224);font:inherit;font-size:14px;font-weight:600;cursor:pointer}
.cm-tpl-back:hover{background:var(--miditor-soft,#f4e6e9)}
.cm-tpl-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:start}
.cm-tpl-card{display:grid;gap:6px;padding:6px 0;border:1px solid transparent;border-radius:10px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color .15s ease,border-color .15s ease;user-select:none;-webkit-user-select:none}
.cm-tpl-card:hover{background:var(--miditor-soft,#f4e6e9);border-color:var(--miditor-border,#ece3e5)}
.cm-tpl-card:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:1px}
.cm-tpl-thumb{position:relative;width:100%;aspect-ratio:1;overflow:hidden;border-radius:8px;background:#fff;box-shadow:inset 0 0 0 1px var(--miditor-border,#ece3e5)}
.cm-tpl-thumb-preview{height:100%;aspect-ratio:auto;border-radius:0;background:transparent;box-shadow:none}
.cm-tpl-name{font-size:12px;font-weight:500;line-height:1.3}
.cm-tpl-state{grid-column:1/-1;margin:4px 0;padding:10px 4px;color:var(--miditor-muted,#6e6063);font-size:12px;line-height:1.4}
.cm-tpl-more{grid-column:1/-1;justify-self:center;margin:12px 0 4px;border:1px solid var(--miditor-border,#ece3e5);border-radius:8px;background:var(--miditor-panel,#fff);padding:8px 18px;color:var(--miditor-accent,#7b1e2b);font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.cm-tpl-more:disabled{opacity:.6;cursor:wait}
@media (prefers-reduced-motion:reduce){.cm-tpl-card,.cm-tpl-track,.cm-tpl-all{transition:none}.cm-tpl-all:active:not(:disabled){transform:none}}
`;

function Card({ item, editor, drag }: { item: PanelItem; editor: HostToolPanelProps["editor"]; drag: HostToolPanelProps["drag"] }) {
  const preset = item.kind === "preset" ? item.preset : null;
  const frameShape = item.kind === "frame" ? item.shape : null;
  const type = item.kind === "preset" ? "Form" : item.kind === "frame" ? "PhotoFrame" : item.type;
  const def = item.kind === "preset" ? formBlock : item.kind === "frame"
    ? { ...photoFrameBlock, size: { w: item.shape.width, h: item.shape.height } }
    : item.def;
  const label = item.kind === "preset" ? item.preset.label : item.kind === "frame" ? item.shape.label : item.def.label;
  const props: Record<string, JsonValue> = frameShape
    ? { ...def.defaultProps, shape: { id: frameShape.id, geometry: frameShape.geometry, maskPath: frameShape.maskPath ?? "" } }
    : item.kind === "preset" ? { ...def.defaultProps, ...item.preset.props } : sampleProps(type, def);
  // Thẻ là div có vai trò nút, không phải <button>: hình xem trước chứa nút thật (mũi tên, chấm của album), và nút không được lồng trong nút.
  return (
    <div
      role="button"
      tabIndex={0}
      className="cm-tpl-card"
      aria-label={`Thêm ${label}`}
      title={preset?.description}
      // Bấm thì thêm; kéo ra canvas thì thả ở đâu khối vào đó (Miditor lo phần kéo, kể cả bỏ qua cú bấm kết thúc cú kéo).
      onPointerDown={(event) => {
        if (frameShape) {
          const shape = frameShape.id;
          const source = event.currentTarget.querySelector<HTMLElement>("[data-drag-artwork]");
          if (source && event.target instanceof Element && event.target.closest("[data-drag-artwork]")) {
            drag.press(event, type, label, { source, preview: <FrameArtwork shape={shape} geometry={frameShape.geometry} maskPath={frameShape.maskPath} style={{ width: "100%", height: "100%" }} />, overrides: { props } });
          }
          return;
        }
        const source = event.currentTarget.querySelector<HTMLElement>("[data-drag-artwork]");
        if (!source || !(event.target instanceof Element) || !event.target.closest("[data-drag-artwork]")) return;
        const previewProps = preset ? props : { ...def.defaultProps };
        const overrides = preset ? { props: { ...preset.props, formId: newFormId() } } : undefined;
        drag.press(event, type, label, {
          source,
          preview: <Thumb type={type} def={def} props={previewProps} dragPreview />,
          ...(overrides ? { overrides } : {}),
        });
      }}
      onClick={() => {
        if (drag.wasDragged()) return;
        if (frameShape) editor.addBlock("PhotoFrame", { props });
        else if (preset) editor.addBlock("Form", { props: { ...preset.props, formId: newFormId() } });
        else editor.addBlock(type);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (frameShape) editor.addBlock("PhotoFrame", { props });
          else if (preset) editor.addBlock("Form", { props: { ...preset.props, formId: newFormId() } });
          else editor.addBlock(type);
        }
      }}
    >
      <Thumb type={type} def={def} props={props} />
      <span className="cm-tpl-name">{label}</span>
    </div>
  );
}

const LEFT = "M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z";
const itemKey = (item: PanelItem) => item.kind === "block" ? item.type : item.kind === "frame" ? `frame-${item.shape.id}` : `preset-${item.preset.id}`;

const itemText = (item: PanelItem) => (item.kind === "block" ? `${item.def.label} ${(item.def.keywords ?? []).join(" ")} ${item.def.category ?? ""}` : item.kind === "preset" ? item.preset.label : `${item.shape.label ?? ""} khung ảnh`).toLowerCase();

export function ElementsPanel({ editor, drag, search = "" }: HostToolPanelProps & { search?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const [pages, setPages] = useState<Record<string, number>>({});
  const [framePage, setFramePage] = useState<Awaited<ReturnType<typeof catalogApi.frames>> | null>(null);
  const [frameStatus, setFrameStatus] = useState("loading");
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState("");
  const frames = framePage?.nodes ?? [];
  const query = search.trim().toLowerCase();
  const GROUPS = groups(frames).map(([category, items]): [string, PanelItem[]] => [category, query ? items.filter((item) => itemText(item).includes(query) || category.toLowerCase().includes(query)) : items]).filter(([, items]) => !query || items.length > 0);
  const group = open === null ? undefined : GROUPS.find(([category]) => category === open);

  useEffect(() => {
    const controller = new AbortController();
    catalogApi.frames(24, undefined, controller.signal).then((page) => {
      setFramePage(page);
      setFrameStatus("ready");
    }).catch(() => { if (!controller.signal.aborted) setFrameStatus("error"); });
    return () => controller.abort();
  }, []);

  const loadMore = async () => {
    if (!open || loadingMore) return;
    const page = open === "Khung ảnh" ? framePage : null;
    if (!page?.pageInfo.hasNextPage || !page.pageInfo.endCursor) return;
    setLoadingMore(true);
    setMoreError("");
    try {
      const next = await catalogApi.frames(24, page.pageInfo.endCursor);
      setFramePage({ nodes: [...(framePage?.nodes ?? []), ...next.nodes], pageInfo: next.pageInfo });
    } catch { setMoreError("Chưa tải thêm được. Thử lại nhé."); }
    finally { setLoadingMore(false); }
  };

  if (group) {
    const status = open === "Khung ảnh" ? frameStatus : "ready";
    const more = open === "Khung ảnh" ? framePage?.pageInfo.hasNextPage : false;
    return (
      <div className="cm-tpl">
        <style>{CSS}</style>
        <button type="button" className="cm-tpl-back" aria-label="Quay lại danh sách thành phần" onClick={() => setOpen(null)}>
          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d={LEFT} />
          </svg>
          {group[0]}
        </button>
        <div className="cm-tpl-grid">
          {group[1].map((item) => <Card key={itemKey(item)} item={item} editor={editor} drag={drag} />)}
        </div>
        {group[1].length === 0 && <p className="cm-tpl-state">{status === "loading" ? "Đang tải thư viện…" : status === "error" ? "Không tải được thư viện. Thử mở lại bảng này nhé." : "Chưa có mẫu nào."}</p>}
        {moreError && <p className="cm-tpl-state" role="alert">{moreError}</p>}
        {more && <button type="button" className="cm-tpl-more" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "Đang tải…" : "Tải thêm"}</button>}
      </div>
    );
  }

  return (
    <div className="cm-tpl">
      <style>{CSS}</style>
      {GROUPS.map(([category, items]) => {
        const page = pages[category] ?? 0;
        const previewCount = Math.min(items.length, PREVIEW_LIMIT);
        const lastPage = (page + 1) * PAGE_SIZE >= previewCount;
        const state = category === "Khung ảnh" ? frameStatus : "ready";
        return (
          <section key={category} aria-label={category}>
            <div className="cm-tpl-head">
              <h3>{category}</h3>
            </div>
            <div className="cm-tpl-carousel">
              <div className="cm-tpl-window">
                <div className="cm-tpl-track" style={{ transform: `translateX(calc(${-page * 100}% - ${page * 8}px))` }}>
                  {Array.from({ length: Math.ceil(previewCount / PAGE_SIZE) }, (_, previewPage) => (
                    <div key={previewPage} className="cm-tpl-grid" inert={previewPage !== page} aria-hidden={previewPage !== page}>
                      {items.slice(previewPage * PAGE_SIZE, Math.min((previewPage + 1) * PAGE_SIZE, previewCount)).map((item) => <Card key={itemKey(item)} item={item} editor={editor} drag={drag} />)}
                    </div>
                  ))}
                </div>
              </div>
              {items.length === 0 && <p className="cm-tpl-state">{state === "loading" ? "Đang tải thư viện…" : state === "error" ? "Không tải được thư viện." : "Chưa có mẫu nào."}</p>}
              {items.length > PAGE_SIZE && (
                <div className="cm-tpl-nav">
                  <button type="button" className="cm-tpl-all" disabled={page === 0} aria-label={`Xem mẫu trước trong ${category}`} onClick={() => setPages((current) => ({ ...current, [category]: page - 1 }))}>
                    <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d={LEFT} /></svg>
                  </button>
                  <button type="button" className="cm-tpl-all" title={lastPage ? `Xem tất cả (${items.length})` : "Xem tiếp"} aria-label={lastPage ? `Xem tất cả ${items.length} mẫu ${category}` : `Xem mẫu tiếp theo trong ${category}`} onClick={() => {
                    if (lastPage) setOpen(category);
                    else setPages((current) => ({ ...current, [category]: page + 1 }));
                  }}>
                    <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" style={{ transform: "rotate(180deg)" }}><path d={LEFT} /></svg>
                  </button>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
