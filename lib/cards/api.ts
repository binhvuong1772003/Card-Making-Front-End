import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { upgradePageDocument } from './forms/legacy';
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
