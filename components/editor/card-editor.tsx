"use client";

import { Editor, EditorProvider, createEditor, useEditor, type RailTool, type SaveStatus, type CustomFieldProps } from "@miditor/editor";
import { vi } from "@miditor/editor/locales/vi";
import "@miditor/editor/style.css";
import "./editor-overrides.css";
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/assets/upload-image";
import { errorMessage } from "@/lib/auth/messages";
import type { CardDetail } from "@/lib/cards/api";
import { cardRenderers, EDIT_METADATA } from "@/lib/cards/blocks";
import { CARD_FONTS } from "@/lib/cards/fonts";
import { createCardSaver } from "@/lib/cards/card-saver";
import { cardAppearance } from "./card-appearance";
import { DateInput } from "./date-input";
import { FrameShapeInput } from "./frame-shape-input";
import { FixedImageInput, SingleImageInput } from "./single-image-input";
import { TimeInput } from "./time-input";
import { FormFieldsInput, PublicListInput } from "./form-fields-input";
import { FormIdInput } from "./form-id-input";
import { TextEffectsInput } from "./text-effects-input";
import { ImageListInput } from "./image-list-input";
import { ElementsPanel } from "./elements-panel";
import { DecorationsPanel } from "./decorations-panel";
import { phosphorIcons } from "./phosphor-icons";
import { CardHeader } from "./card-header";
import type { SealState } from "./status-seal";
import { ZoomPill } from "./zoom-pill";
import { createCardSession, unreachablePageNames, type CardSession } from "./card-session";
import { normalizeCardDocument, type CardDocument, type PageNavigation } from "@/lib/cards/document";
import { PagesPanel } from "./pages-panel";
import { PageInteractionPanel } from "./page-interaction-panel";
import { PageLayoutSettings } from "./page-layout-settings";
import { PopupPageSettings } from "./popup-page-settings";
import type { TreeNode } from "@miditor/core";
import { CardPlayer } from "@/components/cards/card-player";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { navigationComponents, toEditorPage } from "@/lib/cards/editor-navigation";
import { canNavigateFrom, normalizePageNavigation } from "@/lib/cards/page-actions";

const SessionContext = createContext<{ session: CardSession; readOnly: boolean } | null>(null);
const toolMemory = new WeakMap<CardSession, string>();
function KeepTool({ tools, children }: { tools: readonly RailTool[]; children: ReactNode }) {
  const { session } = useCardSession();
  const restored = useRef(false);
  useEffect(() => {
    if (!restored.current) {
      restored.current = true;
      const previous = toolMemory.get(session);
      const tool = tools.find(tool => tool.id === previous);
      if (tool && !tool.active) { tool.pick(); return; }
    }
    const active = tools.find(tool => tool.active);
    if (active) toolMemory.set(session, active.id);
  }, [tools, session]);
  return children;
}
const editorOverrides = { rail: KeepTool };
const findNode = (node: TreeNode, id: string): TreeNode | undefined => node.id === id ? node : node.children.map(child => findNode(child, id)).find(Boolean);
function useCardSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Thiếu phiên thiết kế.");
  useSyncExternalStore(value.session.subscribe, value.session.getSnapshot, value.session.getSnapshot);
  return value;
}
function PagesTool() {
  const { session, readOnly } = useCardSession();
  const editor = useEditor();
  const frame = useEditor(v => v.frame);
  const zoom = useEditor(v => v.zoom);
  const flush = () => {
    const data = editor.flush();
    if (!data) throw new Error('Chưa lấy được nội dung đang sửa. Hãy thử lại.');
    session.receivePage(session.activePageId, data);
    session.captureHistory(session.activePageId, editor.getHistory());
    session.setView(session.activePageId, { frame, zoom });
    return data;
  };
  const safely = (action: () => void) => { try { action(); } catch (error) { toast.error(errorMessage(error)); } };
  const select = (id: string) => safely(() => session.switchPage(id, flush));
  return <PagesPanel pages={session.document.pages} activePageId={session.activePageId} startPageId={session.document.startPageId}
    readOnly={readOnly}
    onSelectPage={select}
    onRenamePage={(id, name) => safely(() => { if (!readOnly) session.renamePage(id, name); })}
    onAddPage={() => safely(() => { if (!readOnly) { flush(); select(session.addPage()); } })}
    onDuplicatePage={id => safely(() => { if (!readOnly) { const data = flush(); if (data) session.receivePage(session.activePageId, data); select(session.duplicatePage(id)); } })}
    onMovePage={(id, direction) => safely(() => { if (!readOnly) {
      const ids = session.document.pages.map(page => page.id); const index = ids.indexOf(id); const next = index + direction;
      if (next >= 0 && next < ids.length) { [ids[index], ids[next]] = [ids[next]!, ids[index]!]; session.reorderPages(ids); }
    } })}
    onSetStartPage={id => safely(() => { if (!readOnly) session.setStartPage(id); })}
    onDeletePage={id => safely(() => { if (!readOnly) {
      const data = flush(); if (data) session.receivePage(session.activePageId, data);
      session.deletePage(id); toast("Đã xóa trang", { id: "page-deleted", action: { label: "Hoàn tác", onClick: () => safely(() => session.undoDelete()) } });
    } })}
  />;
}
function NavigationField({ value, onChange, nodeId, editor, readOnly }: CustomFieldProps) {
  const { session, readOnly: viewOnly } = useCardSession();
  const data = useEditor(v => v.data);
  const [previewing, setPreviewing] = useState(false);
  const page = session.document.pages.find(page => page.id === session.activePageId)!;
  const node = findNode(data.root, nodeId);
  if (!node || !canNavigateFrom(node) || readOnly || viewOnly) return null;
  const action = value && typeof value === "object" && !Array.isArray(value)
    ? normalizePageNavigation(value as Partial<PageNavigation>, session.document.pages) : undefined;
  return <><PageInteractionPanel pages={session.document.pages} sourceNode={node} value={action}
    onPreview={() => { editor.flush(); setPreviewing(true); }}
    onChange={next => onChange(next ?? null)} />
    <Dialog open={previewing} onOpenChange={setPreviewing}><DialogContent className="sm:max-w-[1000px] max-h-[90dvh] overflow-y-auto">
      <DialogTitle>Thử liên kết — bấm thành phần trong thiệp</DialogTitle>
      {previewing && <CardPlayer document={{ ...session.document, startPageId: page.id }} mode="preview" historyKey={`test:${page.id}`} device="desktop" embedded />}
    </DialogContent></Dialog>
  </>;
}
function RestorePage({ session, pageId }: { session: CardSession; pageId: string }) {
  const editor = useEditor();
  const data = useEditor(v => v.data);
  useEffect(() => {
    session.aliasHistory(pageId, editor.getHistory(), data);
    const view = session.viewFor(pageId);
    if (view) { editor.setFrame(view.frame); editor.setZoom(view.zoom); }
    // Only restore when this keyed provider mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, pageId, editor]);
  return null;
}

// Giữ tham chiếu ổn định: Miditor đọc lại các prop này ở mỗi lần dựng.
// Lời của trang trống theo bản vẽ; các câu còn lại là bản tiếng Việt có sẵn của Miditor.
const SparkleIcon = phosphorIcons.sparkle;
const i18n = {
  locale: "vi",
  messages: {
    ...vi,
    "empty.title": "Trang đang trống",
    "empty.text": "Thêm một khối để bắt đầu, hoặc chọn một khối trong thư viện bên trái.",
    "empty.add": "Thêm hộp",
    "empty.open": "Mở thư viện khối",
  },
};
export const cardEditorConfig = {
  icons: phosphorIcons,
  uploadImage,
  components: navigationComponents,
  renderers: cardRenderers,
  fonts: CARD_FONTS,
  tools: [{ id: "elements", label: "Thành phần", icon: "shape" as const, panel: ElementsPanel }, { id: "decorations", label: "Trang trí", icon: <SparkleIcon size={18} />, panel: DecorationsPanel }, { id: "pages", label: "Trang", icon: "layers" as const, panel: PagesTool }],
  customFields: { "card-navigation": NavigationField, "image-list": ImageListInput, date: DateInput, time: TimeInput, "frame-shape": FrameShapeInput, "single-image": SingleImageInput, "fixed-image": FixedImageInput, "form-fields": FormFieldsInput, "form-public-list": PublicListInput, "form-id": FormIdInput, "text-effects": TextEffectsInput },
};
const VIEW_ONLY = { canEdit: false, canDelete: false, canDuplicate: false, canDrag: false, canAdd: false };

const SEAL: Record<SaveStatus, { state: SealState; label: string }> = {
  saved: { state: "saved", label: "Đã lưu" },
  saving: { state: "pending", label: "Đang lưu" },
  unsaved: { state: "pending", label: "Có thay đổi chưa lưu" },
  error: { state: "error", label: "Không lưu được" },
};

// Bề rộng cố định của bảng thuộc tính bên phải (rộng hơn bảng Trang lúc đầu, 277 px, cho thoải mái). Để `auto` thì cột phình theo nội dung của khối được chọn
// (khối Album làm nó rộng 633 px và đè lên canvas), nên mọi khối đều giữ cột này nguyên.
const PROPERTIES_WIDTH = 320;

// Ô chứa một phần của Miditor: lưới một hàng để phần đó (panel, canvas) giãn đủ chiều cao.
const cell = { minBlockSize: 0, minInlineSize: 0, overflow: "hidden", display: "grid", gridTemplateRows: "minmax(0, 1fr)" } as const;
// Nền làm việc có lưới chấm (bản vẽ F); màu nền của Miditor được đặt trong suốt để lưới hiện ra.
const DOT_GRID = "radial-gradient(color-mix(in srgb, var(--miditor-accent) 10%, transparent) 1px, transparent 1.2px) 0 0 / 18px 18px, var(--miditor-workspace)";


// Trang soạn thiệp: Miditor với giao diện, icon, tiếng Việt và các chỗ cắm của CardMaking. Tự lưu cả bản nháp sau mỗi thay đổi.
export function CardEditor({ card, onDocumentChange, onFlushReady }: { card: CardDetail; onDocumentChange?: (document: CardDocument) => void; onFlushReady?: (flush: (() => CardDocument) | null) => void }) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const viewOnly = card.role === "VIEWER";
  const [runtime] = useState(() => {
    let saveError: unknown;
    const saver = onDocumentChange ? {
      save: (document: CardDocument) => onDocumentChange(document), idle: async () => {},
    } : createCardSaver<CardDocument>(card.id, card.revision, (next, error) => {
      saveError = next === "error" ? error ?? new Error("Không lưu được thiệp.") : undefined;
      setStatus(next);
      if (next === "error") toast.error(errorMessage(error));
    });
    const session = createCardSession(normalizeCardDocument(card.document), {
      changed: document => { if (!viewOnly) saver.save(document); },
      idle: async () => { await saver.idle(); if (saveError) throw saveError; },
      failed: () => saveError !== undefined,
    });
    return { session, controller: createEditor() };
  });
  const { session, controller } = runtime;
  const { document, activePageId } = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const page = document.pages.find(page => page.id === activePageId)!;
  useEffect(() => {
    if (!onFlushReady) return;
    onFlushReady(() => {
      const current = controller.flush();
      if (current) session.receivePage(session.activePageId, current);
      return session.document;
    });
    return () => onFlushReady(null);
  }, [controller, session, onFlushReady]);
  const context = useMemo(() => ({ session, readOnly: viewOnly }), [session, viewOnly]);
  useEffect(() => {
    if (status !== "saving" && status !== "error" && status !== "unsaved") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);
  return (
    <SessionContext.Provider value={context}>
    <EditorProvider key={page.id} data={toEditorPage(page)} controller={controller} initialHistory={session.historyFor(page.id)}
      onChange={viewOnly ? undefined : data => session.receivePage(page.id, data)}
      onAction={viewOnly ? undefined : (_action, data) => session.receivePage(page.id, data)}
      onChangeDebounce={500} status={status} permissions={viewOnly ? VIEW_ONLY : undefined}
      appearance={cardAppearance} i18n={i18n} config={cardEditorConfig} overrides={editorOverrides} metadata={EDIT_METADATA}>
      <RestorePage session={session} pageId={page.id} />
      <div className="card-editor" style={{ display: "grid", gridTemplateRows: "auto minmax(0, 1fr)", blockSize: "100%" }}>
        {onDocumentChange ? <Editor.Header /> : <CardHeader title={card.title} seal={SEAL[status]} cardId={card.id} isOwner={card.role === "OWNER"} canReadResponses={!viewOnly}
          idle={() => session.flushAndSave(() => controller.flush())} hasCardContent={document.pages.some(page => page.data.root.children.length > 0)} unreachablePages={unreachablePageNames(document)} />}
        <div style={{ display: "grid", gridTemplateColumns: `auto 292px minmax(0, 1fr) ${PROPERTIES_WIDTH}px`, minBlockSize: 0 }}>
          <Editor.Rail />
          <div style={cell}><Editor.StartPanel /></div>
          <div style={{ ...cell, position: "relative", background: DOT_GRID }}><Editor.Canvas /><ZoomPill /></div>
          <div style={{ ...cell, display: "grid", gridTemplateRows: "auto minmax(0, 1fr)" }}><div><PageLayoutSettings key={`layout:${page.id}`} session={session} pageId={page.id} readOnly={viewOnly} /><PopupPageSettings key={page.id} session={session} pageId={page.id} readOnly={viewOnly} /></div><div style={cell}><Editor.Properties /></div></div>
        </div>
      </div>
    </EditorProvider>
    </SessionContext.Provider>
  );
}
