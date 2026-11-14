import { describe, expect, it } from 'vitest';
import type { JsonValue } from '@miditor/core';
import { normalizeCardDocument } from '@/lib/cards/document';
import { NAVIGATION_PROP, toEditorPage } from '@/lib/cards/editor-navigation';
import { createCardSession } from './card-session';

const fixture = () => normalizeCardDocument({});
const setup = () => {
  const writes: unknown[] = [];
  const session = createCardSession(fixture(), { changed: (doc) => writes.push(doc), idle: async () => {} });
  return { session, writes };
};
const withNavigation = (data: ReturnType<typeof toEditorPage>, nodeId: string, action: JsonValue) => {
  const visit = (node: typeof data.root): typeof data.root => ({
    ...node,
    props: node.id === nodeId ? { ...node.props, [NAVIGATION_PROP]: action } : node.props,
    children: node.children.map(visit),
  });
  return { ...data, root: visit(data.root) };
};

describe('card session', () => {
  it('keeps page popup settings while editor content changes', () => {
    const { session } = setup();
    const page = session.document.pages[0]!;
    session.setPopupSettings(page.id, { width: 640, effect: 'fade', backdropColor: '#17251e', backdropOpacity: 56 });
    session.receivePage(page.id, { ...toEditorPage(session.document.pages[0]!), meta: { title: 'Changed' } });
    expect(session.document.pages[0]?.popup).toEqual({ width: 640, effect: 'fade', backdropColor: '#17251e', backdropOpacity: 56 });
  });

  it('sets the page layout and keeps it while editor content changes', () => {
    const { session } = setup();
    const page = session.document.pages[0]!;
    session.setPageLayout(page.id, 'full');
    session.receivePage(page.id, { ...toEditorPage(session.document.pages[0]!), meta: { title: 'Changed' } });
    expect(session.document.pages[0]?.layout).toBe('full');
    session.setPageLayout(page.id, undefined);
    expect(session.document.pages[0]?.layout).toBeUndefined();
  });

  it('flushes the old page before switching and routes delayed callbacks by page id', () => {
    const { session } = setup();
    const first = session.activePageId;
    const second = session.addPage();
    const draft = { ...session.document.pages[0]!.data, meta: { title: 'Vừa gõ' } };
    session.switchPage(second, () => draft);
    expect(session.document.pages[0]!.data.meta?.title).toBe('Vừa gõ');
    session.receivePage(first, { ...draft, meta: { title: 'Callback cũ' } });
    expect(session.document.pages.find(p => p.id === second)!.data.meta?.title).toBeUndefined();
  });

  it('restores page, incoming links and start page when undoing deletion', () => {
    const { session } = setup();
    const first = session.activePageId;
    const second = session.addPage();
    session.setStartPage(second);
    session.deletePage(second);
    expect(session.document.startPageId).toBe(first);
    session.undoDelete();
    expect(session.document.startPageId).toBe(second);
    expect(session.document.pages).toHaveLength(2);
    expect(() => session.deletePage(first)).not.toThrow();
    expect(() => session.deletePage(second)).toThrow();
  });

  it('decodes native navigation snapshots across first-link undo and redo', () => {
    const { session } = setup();
    const page = session.document.pages[0]!;
    const node = { ...page.data.root, id: 'n1', type: 'Text', children: [] };
    const withNode = { ...page.data, root: { ...page.data.root, children: [node] } };
    session.receivePage(page.id, withNode);
    const second = session.addPage();
    const initial = toEditorPage(session.document.pages[0]!);
    expect(initial.root.children[0]!.props[NAVIGATION_PROP]).toBeNull();
    const linked = withNavigation(initial, 'n1', { type: 'go-to-page', targetPageId: second, transition: 'fade', durationMs: 450 });
    session.receivePage(page.id, linked);
    expect(session.document.pages[0]!.interactions.n1?.targetPageId).toBe(second);
    session.receivePage(page.id, initial);
    expect(session.document.pages[0]!.interactions.n1).toBeUndefined();
    session.receivePage(page.id, linked);
    expect(session.document.pages[0]!.interactions.n1?.targetPageId).toBe(second);
  });

  it('decodes link deletion and node deletion undo from native snapshots', () => {
    const { session } = setup();
    const page = session.document.pages[0]!;
    const target = session.addPage();
    const node = { ...page.data.root, id: 'n1', type: 'Button', children: [] };
    const unlinked = { ...toEditorPage(page), root: { ...page.data.root, children: [node] } };
    const linked = withNavigation(unlinked, 'n1', { type: 'go-to-page', targetPageId: target, transition: 'fade', durationMs: 450 });
    session.receivePage(page.id, linked);
    session.receivePage(page.id, withNavigation(linked, 'n1', null));
    expect(session.document.pages[0]!.interactions.n1).toBeUndefined();
    session.receivePage(page.id, linked);
    session.receivePage(page.id, { ...linked, root: { ...linked.root, children: [] } });
    expect(session.document.pages[0]!.interactions.n1).toBeUndefined();
    session.receivePage(page.id, linked);
    expect(session.document.pages[0]!.interactions.n1?.targetPageId).toBe(target);
  });

  it('aliases raw native history snapshots without persisting the private field', () => {
    const { session } = setup();
    const page = session.document.pages[0]!;
    const raw = toEditorPage(page);
    session.captureHistory(page.id, { past: [raw], future: [], index: 1 });
    session.aliasHistory(page.id, { past: [raw], future: [], index: 1 }, raw);
    session.receivePage(page.id, raw);
    expect(session.document.pages[0]!.data.root.children).toEqual([]);
    expect(JSON.stringify(session.document.pages[0]!.data)).not.toContain(NAVIGATION_PROP);
  });

  it('keeps a reused node unbound and restores the old link on native Undo', () => {
    const { session } = setup();
    const page = session.document.pages[0]!;
    const target = session.addPage();
    const node = { ...page.data.root, id: 'reused', type: 'Button', children: [] };
    const original = { ...toEditorPage(page), root: { ...page.data.root, children: [node] } };
    const linked = withNavigation(original, 'reused', { type: 'go-to-page', targetPageId: target, transition: 'fade', durationMs: 450 });
    session.receivePage(page.id, linked);
    const removed = { ...linked, root: { ...linked.root, children: [] } };
    session.receivePage(page.id, removed);
    const replacement = { ...removed, root: { ...removed.root, children: [{ ...node, props: { [NAVIGATION_PROP]: null } }] } };
    session.receivePage(page.id, replacement);
    expect(session.document.pages[0]!.interactions.reused).toBeUndefined();
    session.receivePage(page.id, removed);
    expect(session.document.pages[0]!.interactions.reused).toBeUndefined();
    session.receivePage(page.id, linked);
    expect(session.document.pages[0]!.interactions.reused?.targetPageId).toBe(target);
  });

  it('ignores callbacks for deleted pages and propagates save errors', async () => {
    const { session } = setup();
    const second = session.addPage();
    const data = session.document.pages[1]!.data;
    session.deletePage(second);
    session.receivePage(second, data);
    expect(session.document.pages).toHaveLength(1);
    const failing = createCardSession(fixture(), { changed: () => {}, idle: async () => { throw new Error('save failed'); } });
    await expect(failing.flushAndSave(() => failing.document.pages[0]!.data)).rejects.toThrow('save failed');
  });

  it('keeps new form identity stable through subsequent edits and rekeys copied forms', () => {
    const { session } = setup();
    const page = session.document.pages[0]!;
    const form = { ...page.data.root, id: 'n1', type: 'Form', props: { formId: '' }, children: [] };
    const withForm = { ...page.data, root: { ...page.data.root, children: [form] } };
    session.receivePage(page.id, withForm);
    const key = session.document.pages[0]!.data.root.children[0]!.props.formId;
    expect(key).not.toBe('n1');
    session.receivePage(page.id, { ...withForm, meta: { title: 'edit' } });
    expect(session.document.pages[0]!.data.root.children[0]!.props.formId).toBe(key);
    const duplicate = session.duplicatePage(page.id);
    const cloned = session.document.pages.find(p => p.id === duplicate)!;
    expect(cloned.data.root.children[0]!.props.formId).not.toBe(key);
  });

  it('undoing page deletion keeps edits made to remaining pages', () => {
    const { session } = setup();
    const first = session.activePageId;
    const second = session.addPage();
    session.deletePage(second);
    const page = session.document.pages[0]!;
    session.receivePage(first, { ...page.data, meta: { title: 'Sửa sau khi xóa' } });
    session.undoDelete();
    expect(session.document.pages).toHaveLength(2);
    expect(session.document.pages[0]!.data.meta?.title).toBe('Sửa sau khi xóa');
  });

  it('remaps cloned self links, keeps other targets and form keys through reorder', async () => {
    const { session, writes } = setup();
    const original = session.document.pages[0]!;
    const form = { ...original.data.root, id: 'form', type: 'Form', props: { formId: '' }, children: [] };
    const button = { ...original.data.root, id: 'button', type: 'Button', children: [] };
    session.receivePage(original.id, { ...original.data, root: { ...original.data.root, children: [form, button] } });
    session.receivePage(original.id, withNavigation(toEditorPage(session.document.pages[0]!), 'button', { type: 'go-to-page', targetPageId: original.id, transition: 'fade', durationMs: 450 }));
    const cloneId = session.duplicatePage(original.id);
    const clone = session.document.pages.find(p => p.id === cloneId)!;
    expect(clone.interactions.button!.targetPageId).toBe(cloneId);
    expect(clone.data.root.children[0]!.props.formId).not.toBe(session.document.pages[0]!.data.root.children[0]!.props.formId);
    const keys = session.document.pages.map(p => p.data.root.children[0]!.props.formId).reverse();
    session.reorderPages([cloneId, original.id]);
    expect(session.document.pages.map(p => p.data.root.children[0]!.props.formId)).toEqual(keys);
    const count = writes.length;
    await session.flushAndSave(() => toEditorPage(session.document.pages.find(p => p.id === session.activePageId)!));
    expect(writes).toHaveLength(count);
  });

  it('does not restore deleted-page links onto a newly created node reusing the same id', () => {
    const { session } = setup();
    const first = session.document.pages[0]!;
    const node = { ...first.data.root, id: 'n1', type: 'Button', children: [] };
    const data = { ...first.data, root: { ...first.data.root, children: [node] } };
    session.receivePage(first.id, data);
    const target = session.addPage();
    session.receivePage(first.id, withNavigation(toEditorPage(session.document.pages[0]!), 'n1', { type: 'go-to-page', targetPageId: target, transition: 'fade', durationMs: 450 }));
    session.deletePage(target);
    session.receivePage(first.id, { ...data, root: { ...data.root, children: [] } });
    session.receivePage(first.id, { ...data, root: { ...data.root, children: [{ ...node }] } });
    session.undoDelete();
    expect(session.document.pages[0]!.interactions.n1).toBeUndefined();
  });

  it('keeps the undo snapshot and reports the page cap when a replacement fills page 50', () => {
    const { session } = setup();
    while (session.document.pages.length < 50) session.addPage();
    const removedId = session.document.pages[49]!.id;
    session.deletePage(removedId);
    session.addPage();
    expect(session.document.pages).toHaveLength(50);
    expect(() => session.undoDelete()).toThrow(/50 trang/i);
    expect(session.document.pages).toHaveLength(50);
  });
});
