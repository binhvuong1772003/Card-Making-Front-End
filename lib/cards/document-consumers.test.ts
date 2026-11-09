import { emptyPage } from '@miditor/core';
import { describe, expect, it } from 'vitest';
import { normalizeCardDocument, getStartPage } from './document';
import { upgradePageDocument } from './forms/legacy';
import { fetchPublicPage } from '../publications/public-page';

describe('whole-card read boundaries', () => {
  it('upgrades forms on later pages without flattening the document or changing links', async () => {
    const first = emptyPage();
    const second = emptyPage();
    second.root.children = [{ ...first.root, id: 'n7', type: 'Guestbook', children: [] }];
    const stored = { kind: 'card', version: 1, startPageId: 'second', pages: [
      { id: 'first', name: 'Trang đầu', data: first, interactions: {} },
      { id: 'second', name: 'Lời chúc', data: second, interactions: {} },
    ] };
    const upgraded = upgradePageDocument(stored);
    const doc = normalizeCardDocument(upgraded);
    expect(doc.pages).toHaveLength(2);
    expect(getStartPage(doc).id).toBe('second');
    expect(doc.pages[1]!.data.root.children[0]!.type).toBe('Form');
    const response = { slug: 'multi-page', title: 'Thiệp', document: stored, publishedAt: new Date(0).toISOString() };
    const loaded = await fetchPublicPage('multi-page', (async () => new Response(JSON.stringify(response))) as typeof fetch);
    expect(normalizeCardDocument(loaded!.document).pages).toHaveLength(2);
  });
});
