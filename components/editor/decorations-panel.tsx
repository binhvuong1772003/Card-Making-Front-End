"use client";

import type { HostToolPanelProps } from "@miditor/editor";
import { useEffect, useState } from "react";
import { catalogApi, type CatalogDecoration, type CatalogPage } from "@/lib/cards/catalog-api";
import { AnimatedDecorations } from "@/components/editor/animated-decorations";

const CATEGORIES = ["Hoa lá", "Viền & nền", "Biểu tượng", "Phong bì & quà"] as const;
const PAGE_SIZE = 2;
const PREVIEW_LIMIT = 6;
const TINTS = [
  { name: "Đỏ trầm", value: "#7b1e2b" },
  { name: "Vàng đồng", value: "#b98b43" },
  { name: "Xanh olive", value: "#75885c" },
  { name: "Xanh lam", value: "#526f91" },
] as const;
const isTintable = (asset: CatalogDecoration) => asset.tags.some((tag) => ["đổi màu", "đơn sắc"].includes(tag.trim().toLocaleLowerCase("vi")));
const tintedUrl = (url: string, color: string) => url.replace("/image/upload/", `/image/upload/e_colorize:80,co_rgb:${color.slice(1)}/`);
const LEFT = "M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z";
const CSS = `
.cm-deco{height:100%;overflow-y:auto;padding:12px;box-sizing:border-box;color:var(--miditor-text,#2a2224)}
.cm-deco h2{margin:0;font-size:14px;font-weight:650}
.cm-deco-intro{margin:4px 0 12px;color:var(--miditor-muted,#6e6063);font-size:12px;line-height:1.4}
.cm-deco-search{display:block;width:100%;height:36px;margin-bottom:12px;border:1px solid var(--miditor-border,#e8dfe1);border-radius:8px;background:var(--miditor-panel,#fff);padding:0 10px;color:var(--miditor-text,#2a2224);font:inherit;font-size:12px;outline:none}
.cm-deco-search:focus{border-color:var(--miditor-accent,#7b1e2b);box-shadow:0 0 0 2px color-mix(in srgb,var(--miditor-accent,#7b1e2b) 16%,transparent)}
.cm-deco h3{margin:0;font-size:13px;font-weight:600;color:var(--miditor-muted,#6e6063)}
.cm-deco-section{margin:0 0 16px}
.cm-deco-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:16px 0 8px;min-height:24px}
.cm-deco-section:first-of-type .cm-deco-head{margin-top:0}
.cm-deco-carousel{position:relative}
.cm-deco-window{overflow:hidden;padding:3px;margin:-3px}
.cm-deco-track{display:flex;gap:8px;transition:transform .3s cubic-bezier(.22,1,.36,1)}
.cm-deco-track>.cm-deco-grid{flex:0 0 100%;min-width:0}
.cm-deco-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;align-items:start}
.cm-deco-full-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px 7px}
.cm-deco-card{display:grid;align-content:start;gap:5px;min-width:0;padding:3px;border:1px solid transparent;border-radius:9px;background:transparent;color:inherit}
.cm-deco-art{position:relative;min-width:0}
.cm-deco-add{display:block;width:100%;border:0;border-radius:7px;background:transparent;padding:0;text-align:left;cursor:pointer;user-select:none;-webkit-user-select:none}
.cm-deco-add:hover .cm-deco-thumb{background:var(--miditor-soft,#f4e6e9)}
.cm-deco-add:focus-visible,.cm-deco-tint-toggle:focus-visible,.cm-deco-tint:focus-visible,.cm-deco-arrow:focus-visible,.cm-deco-back:focus-visible,.cm-deco-more:focus-visible{outline:2px solid var(--miditor-focus,#2f6bff);outline-offset:2px}
.cm-deco-thumb{display:grid;place-items:center;width:100%;aspect-ratio:1;overflow:hidden;border-radius:7px;background:#f8f5f3;box-shadow:inset 0 0 0 1px var(--miditor-border,#ece3e5)}
.cm-deco-thumb img{display:block;width:100%;height:100%;object-fit:contain;padding:7px;box-sizing:border-box}
.cm-deco-name{display:-webkit-box;overflow:hidden;min-height:28px;-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:11px;font-weight:500;line-height:1.25}
.cm-deco-tint-toggle{position:absolute;top:4px;right:4px;display:grid;width:28px;height:28px;place-items:center;border:1px solid #e9dfe1;border-radius:50%;background:#fff;color:var(--miditor-accent,#7b1e2b);font:inherit;font-size:10px;font-weight:650;cursor:pointer;box-shadow:0 1px 3px #3020241a}
.cm-deco-tint-menu{position:absolute;z-index:3;top:4px;right:36px;display:flex;align-items:center;gap:5px;border:1px solid var(--miditor-border,#e8dfe1);border-radius:999px;background:#fff;padding:4px;box-shadow:0 3px 12px #30202424}
.cm-deco-tint{display:grid;width:22px;height:22px;place-items:center;border:0;border-radius:50%;padding:0;cursor:pointer}
.cm-deco-tint input{width:22px;height:22px;border:0;border-radius:50%;padding:0;background:transparent;cursor:pointer}
.cm-deco-tint input::-webkit-color-swatch-wrapper{padding:0}
.cm-deco-tint input::-webkit-color-swatch,.cm-deco-tint input::-moz-color-swatch{border:1px solid #0002;border-radius:50%}
.cm-deco-nav{position:absolute;top:3px;left:0;right:0;aspect-ratio:2;display:flex;align-items:center;justify-content:space-between;pointer-events:none}
.cm-deco-arrow{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;box-sizing:border-box;border:1px solid var(--miditor-accent,#7b1e2b);border-radius:50%;background:var(--miditor-panel,#fff);padding:5px;color:var(--miditor-accent,#7b1e2b);box-shadow:0 3px 10px #2a222433;cursor:pointer;pointer-events:auto;transition:transform .15s ease,background-color .15s ease,color .15s ease}
.cm-deco-arrow svg{width:18px;height:18px;fill:currentColor}
.cm-deco-arrow:hover{background:var(--miditor-accent,#7b1e2b);color:#fff}
.cm-deco-arrow:active{transform:scale(.92)}
.cm-deco-arrow:disabled{visibility:hidden;pointer-events:none}
.cm-deco-back{display:inline-flex;align-items:center;gap:5px;border:0;border-radius:6px;background:transparent;padding:4px 6px 4px 2px;margin:0 0 10px;color:var(--miditor-text,#2a2224);font:inherit;font-size:14px;font-weight:600;cursor:pointer}
.cm-deco-back:hover{background:var(--miditor-soft,#f4e6e9)}
.cm-deco-state{margin:8px 0;padding:8px 4px;color:var(--miditor-muted,#6e6063);font-size:12px;line-height:1.45}
.cm-deco-more{display:block;margin:14px auto 4px;border:1px solid var(--miditor-border,#e8dfe1);border-radius:8px;background:var(--miditor-panel,#fff);padding:8px 18px;color:var(--miditor-accent,#7b1e2b);font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.cm-deco-more:disabled{opacity:.6;cursor:wait}
@media(prefers-reduced-motion:reduce){.cm-deco-track{transition:none}}
`;

function DecorationCard({ asset, editor, drag, activeTintId, setActiveTintId }: { asset: CatalogDecoration; editor: HostToolPanelProps["editor"]; drag: HostToolPanelProps["drag"]; activeTintId: string | null; setActiveTintId: (id: string | null) => void }) {
  const showColors = activeTintId === asset.id;
  const props = { src: asset.url, alt: asset.name, fit: "contain", motion: asset.tags.includes("hiệu ứng hộp quà") };
  const size = props.motion ? { w: 340, h: 300 } : asset.width >= asset.height
    ? { w: 180, h: Math.max(40, Math.round(180 * asset.height / asset.width)) }
    : { w: Math.max(40, Math.round(180 * asset.width / asset.height)), h: 180 };
  const add = (url = asset.url) => { editor.addBlock("Decoration", { size, props: { ...props, src: url } }); setActiveTintId(null); };

  return (
    <div className="cm-deco-card">
      <div className="cm-deco-art">
        <button type="button" className="cm-deco-add" aria-label={`Thêm ${asset.name}`} onPointerDown={(event) => {
          const source = event.currentTarget.querySelector<HTMLElement>("[data-drag-artwork]");
          if (source) drag.press(event, "Decoration", asset.name, { source, preview: <img src={asset.url} alt="" />, overrides: { size, props } });
        }} onClick={() => { if (!drag.wasDragged()) add(); }}>
          <div data-drag-artwork className="cm-deco-thumb"><img src={asset.url} alt="" draggable={false} /></div>
        </button>
        {isTintable(asset) && <>
          <button type="button" className="cm-deco-tint-toggle" aria-expanded={showColors} aria-label={`Đổi màu ${asset.name}`} title="Đổi màu" onClick={() => setActiveTintId(showColors ? null : asset.id)}>Màu</button>
          {showColors && <div className="cm-deco-tint-menu" aria-label={`Chọn màu cho ${asset.name}`}>
            {TINTS.map(({ name, value }) => <button key={value} type="button" className="cm-deco-tint" aria-label={`Thêm ${asset.name} màu ${name}`} title={name} style={{ background: value }} onClick={() => add(tintedUrl(asset.url, value))} />)}
            <label className="cm-deco-tint" title="Chọn màu khác"><input type="color" aria-label={`Chọn màu cho ${asset.name}`} defaultValue="#7b1e2b" onChange={(event) => add(tintedUrl(asset.url, event.currentTarget.value))} /></label>
          </div>}
        </>}
      </div>
      <span className="cm-deco-name">{asset.name}</span>
    </div>
  );
}

type PreviewState = { search: string; groups: Record<string, CatalogPage<CatalogDecoration>> };
type AllState = { key: string; nodes: CatalogDecoration[]; pageInfo: CatalogPage<CatalogDecoration>["pageInfo"] };

export function DecorationsPanel({ editor, drag }: HostToolPanelProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [retry, setRetry] = useState(0);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [pages, setPages] = useState<{ search: string; values: Record<string, number> }>({ search: "", values: {} });
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [allState, setAllState] = useState<AllState | null>(null);
  const [allError, setAllError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState(false);
  const [allRetry, setAllRetry] = useState(0);
  const [activeTintId, setActiveTintId] = useState<string | null>(null);
  const allKey = JSON.stringify([openCategory, search]);
  const visiblePreview = previewState?.search === search ? previewState.groups : null;
  const visibleAll = allState?.key === allKey ? allState : null;

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all(CATEGORIES.map(async (category) => [category, await catalogApi.decorations({ category, search: search || undefined, first: PREVIEW_LIMIT }, controller.signal)] as const))
      .then((entries) => { if (!controller.signal.aborted) { setPreviewState({ search, groups: Object.fromEntries(entries) }); setPreviewError(null); } })
      .catch(() => { if (!controller.signal.aborted) setPreviewError(search); });
    return () => controller.abort();
  }, [search, retry]);

  useEffect(() => {
    if (!openCategory) return;
    const controller = new AbortController();
    catalogApi.decorations({ category: openCategory, search: search || undefined, first: 24 }, controller.signal)
      .then((page) => { if (!controller.signal.aborted) { setAllState({ key: allKey, nodes: page.nodes, pageInfo: page.pageInfo }); setAllError(null); } })
      .catch(() => { if (!controller.signal.aborted) setAllError(allKey); });
    return () => controller.abort();
  }, [allKey, openCategory, allRetry, search]);

  const changeCategoryPage = (category: string, direction: "previous" | "next", lastPage: boolean) => {
    if (direction === "next" && lastPage) {
      setOpenCategory(category);
      return;
    }
    const current = pages.search === search ? pages.values[category] ?? 0 : 0;
    const next = Math.max(0, current + (direction === "next" ? 1 : -1));
    setPages((state) => state.search === search
      ? { ...state, values: { ...state.values, [category]: next } }
      : { search, values: { [category]: next } });
  };

  const loadMore = async () => {
    if (!visibleAll?.pageInfo.hasNextPage || !visibleAll.pageInfo.endCursor || loadingMore) return;
    const controller = new AbortController();
    setLoadingMore(true); setMoreError(false);
    try {
      const next = await catalogApi.decorations({ category: openCategory ?? undefined, search: search || undefined, first: 24, after: visibleAll.pageInfo.endCursor }, controller.signal);
      if (!controller.signal.aborted) setAllState((current) => current?.key === allKey ? { ...current, nodes: [...current.nodes, ...next.nodes], pageInfo: next.pageInfo } : current);
    } catch { if (!controller.signal.aborted) setMoreError(true); }
    finally { setLoadingMore(false); }
  };

  return (
    <div className="cm-deco">
      <style>{CSS}</style>
      <h2>Trang trí</h2>
      <p className="cm-deco-intro">Kéo hoặc bấm để thêm vào thiệp.</p>
      <input type="search" className="cm-deco-search" aria-label="Tìm trang trí" placeholder="Tìm trang trí" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />

      {openCategory ? <>
        <button type="button" className="cm-deco-back" onClick={() => { setOpenCategory(null); setMoreError(false); }}>
          <svg width="14" height="14" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d={LEFT} /></svg>
          {openCategory}
        </button>
        {!visibleAll && allError !== allKey && <p className="cm-deco-state">Đang tải thư viện…</p>}
        {allError === allKey && <p className="cm-deco-state" role="alert">Không tải được thư viện. <button type="button" className="cm-deco-retry" onClick={() => setAllRetry((value) => value + 1)}>Thử lại</button></p>}
        {visibleAll?.nodes.length === 0 && <p className="cm-deco-state">{search ? `Không tìm thấy “${search}”. Thử từ khác nhé.` : "Nhóm này chưa có hình trang trí."}</p>}
        {visibleAll && visibleAll.nodes.length > 0 && <div className="cm-deco-full-grid">{visibleAll.nodes.map((asset) => <DecorationCard key={asset.id} asset={asset} editor={editor} drag={drag} activeTintId={activeTintId} setActiveTintId={setActiveTintId} />)}</div>}
        {moreError && <p className="cm-deco-state" role="alert">Chưa tải thêm được. Thử lại nhé.</p>}
        {visibleAll?.pageInfo.hasNextPage && <button type="button" className="cm-deco-more" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "Đang tải…" : moreError ? "Thử lại" : "Tải thêm"}</button>}
      </> : <>
        <AnimatedDecorations editor={editor} drag={drag} search={search} />
        {!visiblePreview && previewError !== search && <p className="cm-deco-state">Đang tải thư viện…</p>}
        {previewError === search && <p className="cm-deco-state" role="alert">Không tải được thư viện. <button type="button" className="cm-deco-retry" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></p>}
        {visiblePreview && CATEGORIES.every((category) => visiblePreview[category]?.nodes.length === 0) && <p className="cm-deco-state">{search ? `Không tìm thấy “${search}”. Thử từ khác nhé.` : "Chưa có hình trang trí."}</p>}
        {visiblePreview && CATEGORIES.map((category) => {
          const pageData = visiblePreview[category];
          if (!pageData?.nodes.length) return null;
          const page = pages.search === search ? pages.values[category] ?? 0 : 0;
          const previewCount = Math.min(pageData.nodes.length, PREVIEW_LIMIT);
          const lastPage = (page + 1) * PAGE_SIZE >= previewCount;
          const hasArrows = pageData.nodes.length > PAGE_SIZE || pageData.pageInfo.hasNextPage;
          return <section key={category} className="cm-deco-section" aria-label={category}>
            <div className="cm-deco-head"><h3>{category}</h3></div>
            <div className="cm-deco-carousel">
              <div className="cm-deco-window">
                <div className="cm-deco-track" style={{ transform: `translateX(calc(${-page * 100}% - ${page * 8}px))` }}>
                  {Array.from({ length: Math.ceil(previewCount / PAGE_SIZE) }, (_, previewPage) => <div key={previewPage} className="cm-deco-grid" inert={previewPage !== page} aria-hidden={previewPage !== page}>
                    {pageData.nodes.slice(previewPage * PAGE_SIZE, Math.min((previewPage + 1) * PAGE_SIZE, previewCount)).map((asset) => <DecorationCard key={asset.id} asset={asset} editor={editor} drag={drag} activeTintId={activeTintId} setActiveTintId={setActiveTintId} />)}
                  </div>)}
                </div>
              </div>
              {hasArrows && <div className="cm-deco-nav">
                <button type="button" className="cm-deco-arrow" disabled={page === 0} aria-label={`Trang trước trong ${category}`} onClick={() => changeCategoryPage(category, "previous", false)}><svg viewBox="0 0 256 256" aria-hidden="true"><path d={LEFT} /></svg></button>
                <button type="button" className="cm-deco-arrow" title={lastPage ? "Xem tất cả" : "Xem tiếp"} aria-label={lastPage ? `Xem tất cả trang trí ${category}` : `Xem tiếp trang trí ${category}`} onClick={() => changeCategoryPage(category, "next", lastPage)}><svg viewBox="0 0 256 256" aria-hidden="true" style={{ transform: "rotate(180deg)" }}><path d={LEFT} /></svg></button>
              </div>}
            </div>
          </section>;
        })}
      </>}
    </div>
  );
}
