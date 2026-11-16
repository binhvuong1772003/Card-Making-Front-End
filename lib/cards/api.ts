import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { upgradePageDocument } from './forms/legacy';
import { cardForm, responsesPage, type ResponseStatus, type ResponsesPage } from './forms/responses';
import { guestRow, type GuestDraft, type GuestRow } from './guests/admin';
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
  // Số bản xuất bản đang công khai (0 khi chưa xuất bản).
  publicationCount: z.number().int(),
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
  id: z.string(),
  slug: z.string(),
  // Tên bản do chủ thiệp đặt (chỉ chủ thiệp thấy).
  label: z.string().nullable(),
  // Bản chính: bản đang mở đầu tiên; thư viện công khai chỉ lấy bản này.
  isMain: z.boolean(),
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
  'query($occasion: CardOccasion, $search: String) { cards(first: 50, occasion: $occasion, search: $search) { nodes { id title revision role occasion published publicationCount updatedAt } } }';
const GET = 'query($id: ID!) { card(id: $id) { id title revision role document } }';
const CREATE = 'mutation($input: CreateCardInput!) { createCard(input: $input) { id } }';
const RENAME = 'mutation($id: ID!, $title: String!) { updateCardTitle(id: $id, title: $title) { id title } }';
const REMOVE = 'mutation($id: ID!) { deleteCard(id: $id) }';
const PUBLICATION_FIELDS = 'id slug label isMain publishedAt listInGallery galleryStatus galleryRejectReason';
const PUBLICATIONS = `query($cardId: ID!) { publications(cardId: $cardId) { ${PUBLICATION_FIELDS} } }`;
const PUBLISH = `mutation($id: ID!, $slug: String, $gallery: Boolean, $publicationId: ID, $label: String) { publishCard(id: $id, slug: $slug, listInGallery: $gallery, publicationId: $publicationId, label: $label) { ${PUBLICATION_FIELDS} } }`;
const UNPUBLISH_ONE = 'mutation($cardId: ID!, $publicationId: ID!) { unpublishPublication(cardId: $cardId, publicationId: $publicationId) }';
const RESTORE_DRAFT = 'mutation($cardId: ID!, $publicationId: ID!) { restoreDraftFromPublication(cardId: $cardId, publicationId: $publicationId) }';
const DUPLICATE = 'mutation($id: ID!) { duplicateCard(id: $id) { id } }';
const SAVE =
  'mutation($id: ID!, $revision: Int!, $document: JSON!) { saveCardDocument(id: $id, revision: $revision, document: $document) { revision } }';
// Trang Phản hồi (chủ thiệp và người sửa thiệp). `cardForms` đọc từ bản xuất bản và cộng các khối đã gỡ còn câu trả lời.
const CARD_HEADER = 'query($id: ID!) { card(id: $id) { id title role } }';
const CARD_FORMS = 'query($cardId: ID!) { cardForms(cardId: $cardId) { blockId heading fields { id label type options } publicList moderation removed total pending } }';
const FORM_RESPONSES =
  'query($cardId: ID!, $blockId: String, $publicationId: ID, $status: EntryStatus, $search: String, $first: Int, $after: String) { formResponses(cardId: $cardId, blockId: $blockId, publicationId: $publicationId, status: $status, search: $search, first: $first, after: $after) { nodes { id blockId publicationId answers { id label type value } status createdAt } pageInfo { hasNextPage endCursor } summary { fieldId label type answered counts { option count } total } counts { visible hidden pending } } }';
const DELETE_RESPONSE = 'mutation($id: ID!) { deleteFormResponse(id: $id) }';
const SET_RESPONSE_STATUS = 'mutation($id: ID!, $status: EntryStatus!) { setFormResponseStatus(id: $id, status: $status) { id } }';

const GUEST_FIELDS = 'id name code greeting inviteMessage openCount firstOpenedAt lastOpenedAt responded createdAt';
const CARD_GUESTS = `query($cardId: ID!, $search: String) { cardGuests(cardId: $cardId, search: $search) { ${GUEST_FIELDS} } }`;
const ADD_GUESTS = `mutation($cardId: ID!, $entries: [GuestInput!]!) { addGuests(cardId: $cardId, entries: $entries) { ${GUEST_FIELDS} } }`;
const UPDATE_GUEST = `mutation($id: ID!, $name: String, $greeting: String, $inviteMessage: String) { updateGuest(id: $id, name: $name, greeting: $greeting, inviteMessage: $inviteMessage) { ${GUEST_FIELDS} } }`;
const DELETE_GUEST = 'mutation($id: ID!) { deleteGuest(id: $id) }';

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
    args: { blockId: string; publicationId?: string; status?: ResponseStatus; search?: string; first?: number; after?: string },
    signal?: AbortSignal,
  ): Promise<ResponsesPage> =>
    z.object({ formResponses: responsesPage }).parse(await apiFetch.graphql(FORM_RESPONSES, { cardId, ...args }, signal)).formResponses,

  deleteResponse: async (id: string): Promise<void> => {
    await apiFetch.graphql(DELETE_RESPONSE, { id });
  },

  setResponseStatus: async (id: string, status: ResponseStatus): Promise<void> => {
    await apiFetch.graphql(SET_RESPONSE_STATUS, { id, status });
  },

  // Khách mời của thiệp (trang Khách mời): cũ nhất trước, `search` lọc theo tên phía server.
  guests: async (cardId: string, search?: string, signal?: AbortSignal): Promise<GuestRow[]> =>
    z.object({ cardGuests: z.array(guestRow) }).parse(await apiFetch.graphql(CARD_GUESTS, { cardId, search: search || undefined }, signal)).cardGuests,

  addGuests: async (cardId: string, entries: GuestDraft[]): Promise<GuestRow[]> =>
    z.object({ addGuests: z.array(guestRow) }).parse(await apiFetch.graphql(ADD_GUESTS, { cardId, entries })).addGuests,

  // Chuỗi rỗng ở lời chào hoặc lời mời là xoá nó; bỏ trống (undefined) là giữ nguyên.
  updateGuest: async (id: string, patch: { name?: string; greeting?: string; inviteMessage?: string }): Promise<GuestRow> =>
    z.object({ updateGuest: guestRow }).parse(await apiFetch.graphql(UPDATE_GUEST, { id, ...patch })).updateGuest,

  deleteGuest: async (id: string): Promise<void> => {
    await apiFetch.graphql(DELETE_GUEST, { id });
  },

  create: async (title: string, occasion?: Occasion): Promise<string> =>
    z.object({ createCard: z.object({ id: z.string() }) }).parse(await apiFetch.graphql(CREATE, { input: { title, occasion } })).createCard.id,

  rename: async (id: string, title: string): Promise<void> => {
    await apiFetch.graphql(RENAME, { id, title });
  },

  remove: async (id: string): Promise<void> => {
    await apiFetch.graphql(REMOVE, { id });
  },

  // Các bản đang công khai của thiệp, bản chính đứng đầu; rỗng nếu chưa xuất bản hoặc đã gỡ hết.
  publications: async (cardId: string, signal?: AbortSignal): Promise<PublicationInfo[]> =>
    z.object({ publications: z.array(publicationInfo) }).parse(await apiFetch.graphql(PUBLICATIONS, { cardId }, signal)).publications,

  // Chụp bản nháp đã lưu thành một bản công khai: có `publicationId` thì cập nhật bản đó (xuất bản lại, giữ slug nếu không đổi),
  // không có thì tạo bản mới (tối đa 5 bản đang mở). `label` rỗng là bỏ tên, bỏ trống là giữ tên cũ. `listInGallery` chỉ có nghĩa
  // với bản chính: bật thì gửi vào hàng chờ duyệt của thư viện công khai, tắt thì rút khỏi thư viện.
  publish: async (id: string, options: { publicationId?: string; slug?: string; label?: string; listInGallery?: boolean } = {}): Promise<PublicationInfo> =>
    z
      .object({ publishCard: publicationInfo })
      .parse(await apiFetch.graphql(PUBLISH, { id, slug: options.slug || undefined, label: options.label, publicationId: options.publicationId, gallery: options.listInGallery ?? false })).publishCard,

  // Gỡ một bản: liên kết đó trả 404, các bản khác không đổi.
  unpublish: async (cardId: string, publicationId: string): Promise<void> => {
    await apiFetch.graphql(UNPUBLISH_ONE, { cardId, publicationId });
  },

  // Nạp nội dung của một bản vào bản nháp (thay cả bản nháp). Trả `revision` mới.
  restoreDraft: async (cardId: string, publicationId: string): Promise<number> =>
    z.object({ restoreDraftFromPublication: z.number().int() }).parse(await apiFetch.graphql(RESTORE_DRAFT, { cardId, publicationId })).restoreDraftFromPublication,

  // Nhân bản vào thư viện của mình; trả id thiệp mới.
  duplicate: async (id: string): Promise<string> =>
    z.object({ duplicateCard: z.object({ id: z.string() }) }).parse(await apiFetch.graphql(DUPLICATE, { id })).duplicateCard.id,

  // Ghi cả bản nháp, có điều kiện `revision`. Trả `revision` mới; `revision` cũ thì ném ApiError CONFLICT.
  save: async (id: string, revision: number, document: unknown): Promise<number> =>
    z
      .object({ saveCardDocument: z.object({ revision: z.number().int() }) })
      .parse(await apiFetch.graphql(SAVE, { id, revision, document })).saveCardDocument.revision,
};
