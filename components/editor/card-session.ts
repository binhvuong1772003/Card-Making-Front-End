import type { PageData, TreeNode } from '@miditor/core';
import { blankCardPage, type CardDocument, type CardPage, type PageNavigation } from '@/lib/cards/document';
import { fromEditorPage } from '@/lib/cards/editor-navigation';
import { formKeyOf, newFormId } from '@/lib/cards/forms/form-id';

export type PageHistory = { past: PageData[]; future: PageData[]; index: number };
const nodes = (root: TreeNode): TreeNode[] => [root, ...root.children.flatMap(nodes)];
const freshId = () => `p${crypto.randomUUID().replaceAll('-', '').slice(0, 20)}`;

export function unreachablePageNames(document: CardDocument): string[] {
  const visited = new Set<string>();
  const pending = [document.startPageId];
  while (pending.length) {
    const id = pending.pop()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const page = document.pages.find(page => page.id === id);
    if (page) pending.push(...Object.values(page.interactions).map(action => action.targetPageId));
  }
  return document.pages.filter(page => !visited.has(page.id)).map(page => page.name);
}

export function createCardSession(initial: CardDocument, saver: { changed(document: CardDocument): void; idle(): Promise<void>; failed?(): boolean }) {
  let document = initial;
  let activePageId = initial.startPageId;
  let snapshot = { document, activePageId };
  let lastEnqueued: CardDocument | null = null;
  const listeners = new Set<() => void>();
  const canonical = new WeakMap<PageData, PageData>();
  const identities = new WeakMap<PageData, Map<string, symbol>>();
  const histories = new Map<string, PageHistory>();
  const views = new Map<string, { frame: 'desktop' | 'phone'; zoom: number }>();
  let deleted: { page: CardPage; index: number; startPageId: string; activePageId: string; fallback: string; incoming: Record<string, Record<string, PageNavigation>>; sources: Map<string, Map<string, symbol>> } | null = null;
  for (const page of document.pages) {
    identities.set(page.data, new Map(nodes(page.data.root).map(node => [node.id, Symbol(node.id)])));
  }

  const emit = (save = true) => {
    snapshot = { document, activePageId };
    listeners.forEach(listener => listener());
    if (save) { lastEnqueued = document; saver.changed(document); }
  };
  const replace = (pageId: string, patch: Partial<CardDocument['pages'][number]>) => {
    document = { ...document, pages: document.pages.map(page => page.id === pageId ? { ...page, ...patch } : page) };
    emit();
  };
  const requirePage = (id: string) => {
    const page = document.pages.find(page => page.id === id);
    if (!page) throw new Error('Không tìm thấy trang.');
    return page;
  };
  const rekeyForms = (data: PageData, previous?: PageData, allNew = false): PageData => {
    const oldForms = new Map(previous ? nodes(previous.root).filter(n => n.type === 'Form').map(n => [n.id, formKeyOf(n.props.formId, n.id)]) : []);
    const used = new Set(document.pages.filter(p => p.data !== previous).flatMap(p => nodes(p.data.root).filter(n => n.type === 'Form').map(n => formKeyOf(n.props.formId, n.id))));
    const visit = (node: TreeNode): TreeNode => {
      const children = node.children.map(visit);
      let props = node.props;
      if (node.type === 'Form') {
        let key = oldForms.get(node.id) ?? formKeyOf(node.props.formId, node.id);
        if (allNew || !oldForms.has(node.id) || used.has(key)) {
          do { key = newFormId(); } while (used.has(key));
        }
        used.add(key);
        if (props.formId !== key) props = { ...props, formId: key };
      }
      return props !== node.props || children.some((n, i) => n !== node.children[i]) ? { ...node, props, children } : node;
    };
    const root = visit(data.root);
    return root === data.root ? data : { ...data, root };
  };

  const session = {
    get document() { return document; },
    get activePageId() { return activePageId; },
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => snapshot,
    receivePage(pageId: string, incoming: PageData) {
      const page = document.pages.find(p => p.id === pageId);
      if (!page) return;
      const decoded = fromEditorPage(incoming, document.pages);
      const data = canonical.get(incoming) ?? rekeyForms(decoded.data, page.data);
      const ids = new Set(nodes(data.root).map(n => n.id));
      const previousIdentities = identities.get(page.data);
      const identity = identities.get(incoming) ?? new Map(nodes(data.root).map(node => [node.id, previousIdentities?.get(node.id) ?? Symbol(node.id)]));
      const interactions = Object.fromEntries(Object.entries(decoded.interactions).filter(([id]) => ids.has(id)));
      canonical.set(incoming, data);
      identities.set(data, identity); identities.set(incoming, identity);
      if (JSON.stringify(page.data) === JSON.stringify(data) && Object.keys(interactions).length === Object.keys(page.interactions).length && Object.entries(interactions).every(([id, action]) => JSON.stringify(page.interactions[id]) === JSON.stringify(action))) return;
      replace(pageId, { data, interactions });
    },
    setPopupSettings(pageId: string, popup: CardPage['popup']) { requirePage(pageId); replace(pageId, { popup }); },
    setPageLayout(pageId: string, layout: CardPage['layout']) { requirePage(pageId); replace(pageId, { layout }); },
    switchPage(pageId: string, flush: () => PageData | null) {
      requirePage(pageId);
      if (pageId === activePageId) return;
      const data = flush();
      if (!data) throw new Error('Chưa lưu được nội dung trang đang sửa.');
      session.receivePage(activePageId, data);
      activePageId = pageId;
      emit(false);
    },
    async flushAndSave(flush: () => PageData | null) {
      const data = flush();
      if (!data) throw new Error('Chưa lấy được nội dung đang sửa.');
      session.receivePage(activePageId, data);
      if (lastEnqueued !== document || saver.failed?.()) { lastEnqueued = document; saver.changed(document); }
      await saver.idle();
    },
    addPage() {
      if (document.pages.length >= 50) throw new Error('Mỗi thiệp có tối đa 50 trang.');
      const page = blankCardPage(freshId(), `Trang ${document.pages.length + 1}`);
      identities.set(page.data, new Map(nodes(page.data.root).map(node => [node.id, Symbol(node.id)])));
      document = { ...document, pages: [...document.pages, page] }; emit(); return page.id;
    },
    duplicatePage(pageId: string) {
      if (document.pages.length >= 50) throw new Error('Mỗi thiệp có tối đa 50 trang.');
      const original = requirePage(pageId);
      const id = freshId();
      const data = rekeyForms(structuredClone(original.data), undefined, true);
      const interactions = Object.fromEntries(Object.entries(original.interactions).map(([key, action]) => [key, { ...action, targetPageId: action.targetPageId === pageId ? id : action.targetPageId }]));
      const page = { ...original, id, name: `${original.name.slice(0, 70)} (bản sao)`, data, interactions };
      identities.set(data, new Map(nodes(data.root).map(node => [node.id, Symbol(node.id)])));
      const index = document.pages.indexOf(original);
      document = { ...document, pages: [...document.pages.slice(0, index + 1), page, ...document.pages.slice(index + 1)] }; emit(); return id;
    },
    renamePage(pageId: string, name: string) {
      const trimmed = name.trim();
      if (!trimmed || trimmed.length > 80) throw new Error('Tên trang cần từ 1 đến 80 ký tự.');
      requirePage(pageId); replace(pageId, { name: trimmed });
    },
    reorderPages(ids: string[]) {
      if (ids.length !== document.pages.length || new Set(ids).size !== ids.length) throw new Error('Thứ tự trang không hợp lệ.');
      document = { ...document, pages: ids.map(requirePage) }; emit();
    },
    setStartPage(pageId: string) { requirePage(pageId); document = { ...document, startPageId: pageId }; emit(); },
    deletePage(pageId: string) {
      requirePage(pageId);
      if (document.pages.length === 1) throw new Error('Thiệp cần ít nhất một trang.');
      const index = document.pages.findIndex(p => p.id === pageId);
      const removed = requirePage(pageId);
      const incoming = Object.fromEntries(document.pages.map(page => [page.id, Object.fromEntries(Object.entries(page.interactions).filter(([, action]) => action.targetPageId === pageId))]));
      const pages = document.pages.filter(p => p.id !== pageId).map(page => ({ ...page, interactions: Object.fromEntries(Object.entries(page.interactions).filter(([, action]) => action.targetPageId !== pageId)) }));
      const fallback = pages[Math.min(index, pages.length - 1)]!.id;
      deleted = { page: removed, index, startPageId: document.startPageId, activePageId, fallback, incoming, sources: new Map(document.pages.map(page => [page.id, identities.get(page.data) ?? new Map()])) };
      document = { ...document, pages, startPageId: document.startPageId === pageId ? fallback : document.startPageId };
      if (activePageId === pageId) activePageId = fallback;
      emit();
    },
    undoDelete() {
      if (!deleted) return;
      if (document.pages.length >= 50) throw new Error('Không thể hoàn tác vì thiệp đã đủ 50 trang.');
      const undo = deleted; deleted = null;
      if (document.pages.some(page => page.id === undo.page.id)) return;
      const pages = document.pages.map(page => {
        const ids = new Set(nodes(page.data.root).map(node => node.id));
        const restored = Object.fromEntries(Object.entries(undo.incoming[page.id] ?? {}).filter(([nodeId]) => ids.has(nodeId) && !page.interactions[nodeId] && identities.get(page.data)?.get(nodeId) === undo.sources.get(page.id)?.get(nodeId)));
        return { ...page, interactions: { ...page.interactions, ...restored } };
      });
      const liveIds = new Set([...pages.map(page => page.id), undo.page.id]);
      const page = { ...undo.page, interactions: Object.fromEntries(Object.entries(undo.page.interactions).filter(([, action]) => liveIds.has(action.targetPageId))) };
      pages.splice(Math.min(undo.index, pages.length), 0, page);
      document = { ...document, pages, startPageId: document.startPageId === undo.fallback ? undo.startPageId : document.startPageId };
      if (activePageId === undo.fallback) activePageId = undo.activePageId;
      emit();
    },
    captureHistory(pageId: string, history: PageHistory) { histories.set(pageId, history); },
    historyFor(pageId: string) { return histories.get(pageId); },
    aliasHistory(pageId: string, history: PageHistory, present: PageData) {
      const old = histories.get(pageId);
      if (old) for (const side of ['past', 'future'] as const) {
        const original = side === 'past' ? old[side].slice(-history[side].length) : old[side].slice(0, history[side].length);
        history[side].forEach((data, i) => {
          if (original[i]) canonical.set(data, canonical.get(original[i]!) ?? fromEditorPage(original[i]!, document.pages).data);
          if (original[i]) {
            const source = identities.get(original[i]!) ?? identities.get(requirePage(pageId).data);
            identities.set(data, new Map(nodes(data.root).map(node => [node.id, source?.get(node.id) ?? Symbol(node.id)])));
          }
        });
      }
      canonical.set(present, requirePage(pageId).data);
      identities.set(present, identities.get(requirePage(pageId).data) ?? new Map());
      histories.set(pageId, history);
    },
    setView(pageId: string, view: { frame: 'desktop' | 'phone'; zoom: number }) { views.set(pageId, view); },
    viewFor(pageId: string) { return views.get(pageId); },
  };
  return session;
}
export type CardSession = ReturnType<typeof createCardSession>;
