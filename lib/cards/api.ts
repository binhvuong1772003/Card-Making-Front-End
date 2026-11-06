import { z } from 'zod';
import { apiFetch } from '@/lib/api';

const role = z.enum(['OWNER', 'EDITOR', 'VIEWER']);

const cardSummary = z.object({
  id: z.string(),
  title: z.string(),
  revision: z.number().int(),
  role,
  updatedAt: z.string(),
});

// `document` là PageData của editor (hoặc {} khi thiệp mới). Cấu trúc do Miditor kiểm; ở đây chỉ cần là object.
const cardDetail = z.object({
  id: z.string(),
  title: z.string(),
  revision: z.number().int(),
  role,
  document: z.record(z.string(), z.unknown()),
});

export type CardSummary = z.infer<typeof cardSummary>;
export type CardDetail = z.infer<typeof cardDetail>;

const LIST = 'query { cards(first: 50) { nodes { id title revision role updatedAt } } }';
const GET = 'query($id: ID!) { card(id: $id) { id title revision role document } }';
const CREATE = 'mutation($input: CreateCardInput!) { createCard(input: $input) { id } }';
const SAVE =
  'mutation($id: ID!, $revision: Int!, $document: JSON!) { saveCardDocument(id: $id, revision: $revision, document: $document) { revision } }';

export const cardsApi = {
  list: async (signal?: AbortSignal): Promise<CardSummary[]> =>
    z.object({ cards: z.object({ nodes: z.array(cardSummary) }) }).parse(await apiFetch.graphql(LIST, undefined, signal)).cards.nodes,

  get: async (id: string, signal?: AbortSignal): Promise<CardDetail> => {
    const { card } = z.object({ card: cardDetail.nullable() }).parse(await apiFetch.graphql(GET, { id }, signal));
    if (!card) throw new Error('Card not found');
    return card;
  },

  create: async (title: string): Promise<string> =>
    z.object({ createCard: z.object({ id: z.string() }) }).parse(await apiFetch.graphql(CREATE, { input: { title } })).createCard.id,

  // Ghi cả bản nháp, có điều kiện `revision`. Trả `revision` mới; `revision` cũ thì ném ApiError CONFLICT.
  save: async (id: string, revision: number, document: unknown): Promise<number> =>
    z
      .object({ saveCardDocument: z.object({ revision: z.number().int() }) })
      .parse(await apiFetch.graphql(SAVE, { id, revision, document })).saveCardDocument.revision,
};
