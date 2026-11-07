import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import type { Occasion } from '@/lib/cards/occasions';

const category = z.enum(['WEDDING', 'BIRTHDAY', 'EVENT', 'OTHER']);

// Một mẫu trong thư viện công khai. `snapshot` là PageData để dựng ảnh xem trước; Miditor tự kiểm khi dựng.
const template = z.object({
  id: z.string(),
  title: z.string(),
  category,
  authorName: z.string(),
  useCount: z.number().int(),
  snapshot: z.record(z.string(), z.unknown()),
});
const pageInfo = z.object({ hasNextPage: z.boolean(), endCursor: z.string().nullable() });

export type Template = z.infer<typeof template>;
export type TemplatePage = { nodes: Template[]; pageInfo: z.infer<typeof pageInfo> };

const FIELDS = 'id title category authorName useCount snapshot';
const LIST = `query($category: CardOccasion, $first: Int, $after: String) { templates(category: $category, first: $first, after: $after) { nodes { ${FIELDS} } pageInfo { hasNextPage endCursor } } }`;
const GET = `query($id: ID!) { template(id: $id) { ${FIELDS} } }`;
const COUNTS = 'query { templateCounts { category count } }';
const USE = 'mutation($id: ID!) { createCardFromTemplate(id: $id) { id } }';

export const templatesApi = {
  // Mẫu đang hiện, mới duyệt nhất lên đầu; `after` là con trỏ của trang trước.
  list: async (options: { category?: Occasion; first?: number; after?: string } = {}, signal?: AbortSignal): Promise<TemplatePage> =>
    z
      .object({ templates: z.object({ nodes: z.array(template), pageInfo }) })
      .parse(await apiFetch.graphql(LIST, { category: options.category, first: options.first, after: options.after }, signal)).templates,

  get: async (id: string, signal?: AbortSignal): Promise<Template> => {
    const { template: found } = z.object({ template: template.nullable() }).parse(await apiFetch.graphql(GET, { id }, signal));
    if (!found) throw new Error('Template not found');
    return found;
  },

  // Số mẫu đang hiện theo từng loại.
  counts: async (signal?: AbortSignal): Promise<Record<Occasion, number>> => {
    const { templateCounts } = z
      .object({ templateCounts: z.array(z.object({ category, count: z.number().int() })) })
      .parse(await apiFetch.graphql(COUNTS, undefined, signal));
    const result: Record<Occasion, number> = { WEDDING: 0, BIRTHDAY: 0, EVENT: 0, OTHER: 0 };
    for (const { category: key, count } of templateCounts) result[key] = count;
    return result;
  },

  // Dùng làm mẫu: tạo thiệp mới của mình từ mẫu, trả id thiệp mới.
  use: async (id: string): Promise<string> =>
    z.object({ createCardFromTemplate: z.object({ id: z.string() }) }).parse(await apiFetch.graphql(USE, { id })).createCardFromTemplate.id,
};
