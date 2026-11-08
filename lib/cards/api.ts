import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { upgradePageDocument } from './forms/legacy';
import { cardForm, responsesPage, type ResponseStatus, type ResponsesPage } from './forms/responses';
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

const publicationInfo = z.object({
  slug: z.string(),
  publishedAt: z.string(),
  listInGallery: z.boolean(),
  // NONE: không gửi; PENDING: có bản chờ duyệt; REJECTED: bị từ chối (xem lý do); LIVE: đang hiện trong thư viện.
  galleryStatus: z.enum(['NONE', 'PENDING', 'REJECTED', 'LIVE']),
  galleryRejectReason: z.string().nullable(),
});
export type PublicationInfo = z.infer<typeof publicationInfo>;
export type CardSummary = z.infer<typeof cardSummary>;
export type CardDetail = z.infer<typeof cardDetail>;

const LIST =
  'query($occasion: CardOccasion, $search: String) { cards(first: 50, occasion: $occasion, search: $search) { nodes { id title revision role occasion published updatedAt } } }';
const GET = 'query($id: ID!) { card(id: $id) { id title revision role document } }';
const CREATE = 'mutation($input: CreateCardInput!) { createCard(input: $input) { id } }';
const RENAME = 'mutation($id: ID!, $title: String!) { updateCardTitle(id: $id, title: $title) { id title } }';
const REMOVE = 'mutation($id: ID!) { deleteCard(id: $id) }';
const PUBLICATION_FIELDS = 'slug publishedAt listInGallery galleryStatus galleryRejectReason';
const PUBLICATION = `query($cardId: ID!) { publication(cardId: $cardId) { ${PUBLICATION_FIELDS} } }`;
const PUBLISH = `mutation($id: ID!, $slug: String, $gallery: Boolean) { publishCard(id: $id, slug: $slug, listInGallery: $gallery) { ${PUBLICATION_FIELDS} } }`;
const UNPUBLISH = 'mutation($id: ID!) { unpublishCard(id: $id) }';
const DUPLICATE = 'mutation($id: ID!) { duplicateCard(id: $id) { id } }';
const SAVE =
  'mutation($id: ID!, $revision: Int!, $document: JSON!) { saveCardDocument(id: $id, revision: $revision, document: $document) { revision } }';
// Trang Phản hồi (chủ thiệp và người sửa thiệp). `cardForms` đọc từ bản xuất bản và cộng các khối đã gỡ còn câu trả lời.
const CARD_HEADER = 'query($id: ID!) { card(id: $id) { id title role } }';
const CARD_FORMS = 'query($cardId: ID!) { cardForms(cardId: $cardId) { blockId heading fields { id label type options } publicList moderation removed total pending } }';
const FORM_RESPONSES =
  'query($cardId: ID!, $blockId: String, $status: EntryStatus, $search: String, $first: Int, $after: String) { formResponses(cardId: $cardId, blockId: $blockId, status: $status, search: $search, first: $first, after: $after) { nodes { id blockId answers { id label type value } status createdAt } pageInfo { hasNextPage endCursor } summary { fieldId label type answered counts { option count } total } counts { visible hidden pending } } }';
const DELETE_RESPONSE = 'mutation($id: ID!) { deleteFormResponse(id: $id) }';
const SET_RESPONSE_STATUS = 'mutation($id: ID!, $status: EntryStatus!) { setFormResponseStatus(id: $id, status: $status) { id } }';

export const cardsApi = {
  // Danh sách của người đang gọi, mới sửa nhất lên đầu; lọc theo dịp và tìm trong tiêu đề (phía server). Tối đa 50 thiệp.
  list: async (options: { occasion?: Occasion; search?: string } = {}, signal?: AbortSignal): Promise<CardSummary[]> =>
    z
      .object({ cards: z.object({ nodes: z.array(cardSummary) }) })
      .parse(await apiFetch.graphql(LIST, { occasion: options.occasion, search: options.search || undefined }, signal)).cards.nodes,

  get: async (id: string, signal?: AbortSignal): Promise<CardDetail> => {
    const { card } = z.object({ card: cardDetail.nullable() }).parse(await apiFetch.graphql(GET, { id }, signal));
    if (!card) throw new Error('Card not found');
    // Editor và trang xem trước đều tải thiệp qua đây: thiệp lưu từ trước khi có khối `Form` được nâng cấp (Rsvp/Guestbook → Form)
    // ngay khi mở, để Miditor không gặp loại khối lạ.
    return { ...card, document: upgradePageDocument(card.document) };
  },

  // Chỉ tên và quyền, không kèm cả `document`: trang Phản hồi không cần tải cả thiệp.
  header: async (id: string, signal?: AbortSignal): Promise<{ id: string; title: string; role: CardSummary["role"] }> => {
    const { card } = z
      .object({ card: z.object({ id: z.string(), title: z.string(), role }).nullable() })
      .parse(await apiFetch.graphql(CARD_HEADER, { id }, signal));
    if (!card) throw new Error('Card not found');
    return card;
  },

  // Các form của thiệp cho trang Phản hồi: theo thứ tự trong bản xuất bản, khối đã gỡ còn câu trả lời xếp sau.
  forms: async (cardId: string, signal?: AbortSignal) =>
    z.object({ cardForms: z.array(cardForm) }).parse(await apiFetch.graphql(CARD_FORMS, { cardId }, signal)).cardForms,

  // Một trang câu trả lời của một form, đã lọc và tìm phía server; `summary` và `counts` tính trên mọi dòng.
  responses: async (
    cardId: string,
    args: { blockId: string; status?: ResponseStatus; search?: string; first?: number; after?: string },
    signal?: AbortSignal,
  ): Promise<ResponsesPage> =>
    z.object({ formResponses: responsesPage }).parse(await apiFetch.graphql(FORM_RESPONSES, { cardId, ...args }, signal)).formResponses,

  deleteResponse: async (id: string): Promise<void> => {
    await apiFetch.graphql(DELETE_RESPONSE, { id });
  },

  setResponseStatus: async (id: string, status: ResponseStatus): Promise<void> => {
    await apiFetch.graphql(SET_RESPONSE_STATUS, { id, status });
  },

  create: async (title: string, occasion?: Occasion): Promise<string> =>
    z.object({ createCard: z.object({ id: z.string() }) }).parse(await apiFetch.graphql(CREATE, { input: { title, occasion } })).createCard.id,

  rename: async (id: string, title: string): Promise<void> => {
    await apiFetch.graphql(RENAME, { id, title });
  },

  remove: async (id: string): Promise<void> => {
    await apiFetch.graphql(REMOVE, { id });
  },

  // Liên kết đang công khai của thiệp, hoặc null nếu chưa xuất bản hoặc đã gỡ.
  publication: async (cardId: string, signal?: AbortSignal): Promise<PublicationInfo | null> =>
    z.object({ publication: publicationInfo.nullable() }).parse(await apiFetch.graphql(PUBLICATION, { cardId }, signal)).publication,

  // Xuất bản (hoặc xuất bản lại) bản nháp đã lưu; `slug` bỏ trống thì giữ slug cũ hoặc tự đặt từ tiêu đề.
  // `listInGallery` bật thì gửi vào hàng chờ duyệt của thư viện công khai, tắt thì rút khỏi thư viện.
  publish: async (id: string, slug?: string, listInGallery = false): Promise<PublicationInfo> =>
    z.object({ publishCard: publicationInfo }).parse(await apiFetch.graphql(PUBLISH, { id, slug: slug || undefined, gallery: listInGallery })).publishCard,

  unpublish: async (id: string): Promise<void> => {
    await apiFetch.graphql(UNPUBLISH, { id });
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
