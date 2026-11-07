import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import type { Occasion } from './occasions';

const role = z.enum(['OWNER', 'EDITOR', 'VIEWER']);
const occasion = z.enum(['WEDDING', 'BIRTHDAY', 'EVENT', 'OTHER']);

const cardSummary = z.object({
  id: z.string(),
  title: z.string(),
  revision: z.number().int(),
  role,
  occasion,
  published: z.boolean(),
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

const LIST =
  'query($occasion: CardOccasion, $search: String) { cards(first: 50, occasion: $occasion, search: $search) { nodes { id title revision role occasion published updatedAt } } }';
const GET = 'query($id: ID!) { card(id: $id) { id title revision role document } }';
const CREATE = 'mutation($input: CreateCardInput!) { createCard(input: $input) { id } }';
const RENAME = 'mutation($id: ID!, $title: String!) { updateCardTitle(id: $id, title: $title) { id title } }';
const REMOVE = 'mutation($id: ID!) { deleteCard(id: $id) }';
const DUPLICATE = 'mutation($id: ID!) { duplicateCard(id: $id) { id } }';
const SAVE =
  'mutation($id: ID!, $revision: Int!, $document: JSON!) { saveCardDocument(id: $id, revision: $revision, document: $document) { revision } }';

export const cardsApi = {
  // Danh sách của người đang gọi, mới sửa nhất lên đầu; lọc theo dịp và tìm trong tiêu đề (phía server). Tối đa 50 thiệp.
  list: async (options: { occasion?: Occasion; search?: string } = {}, signal?: AbortSignal): Promise<CardSummary[]> =>
    z
      .object({ cards: z.object({ nodes: z.array(cardSummary) }) })
      .parse(await apiFetch.graphql(LIST, { occasion: options.occasion, search: options.search || undefined }, signal)).cards.nodes,

  get: async (id: string, signal?: AbortSignal): Promise<CardDetail> => {
    const { card } = z.object({ card: cardDetail.nullable() }).parse(await apiFetch.graphql(GET, { id }, signal));
    if (!card) throw new Error('Card not found');
    return card;
  },

  create: async (title: string, occasion?: Occasion): Promise<string> =>
    z.object({ createCard: z.object({ id: z.string() }) }).parse(await apiFetch.graphql(CREATE, { input: { title, occasion } })).createCard.id,

  rename: async (id: string, title: string): Promise<void> => {
    await apiFetch.graphql(RENAME, { id, title });
  },

  remove: async (id: string): Promise<void> => {
    await apiFetch.graphql(REMOVE, { id });
  },

  // Nhân bản vào thư viện của mình; trả id thiệp mới.
  duplicate: async (id: string): Promise<string> =>
    z.object({ duplicateCard: z.object({ id: z.string() }) }).parse(await apiFetch.graphql(DUPLICATE, { id })).duplicateCard.id,

  // Ghi cả bản nháp, có điều kiện `revision`. Trả `revision` mới; `revision` cũ thì ném ApiError CONFLICT.
  save: async (id: string, revision: number, document: unknown): Promise<number> =>
    z
      .object({ saveCardDocument: z.object({ revision: z.number().int() }) })
      .parse(await apiFetch.graphql(SAVE, { id, revision, document })).saveCardDocument.revision,
};
