import { z } from 'zod';
import { apiFetch } from '@/lib/api';

const status = z.enum(['PENDING', 'PUBLISHED', 'REJECTED', 'UNLISTED', 'REMOVED']);
const category = z.enum(['WEDDING', 'BIRTHDAY', 'EVENT', 'OTHER']);

// Một mẫu nhìn từ admin: có email tác giả (người dùng thường không thấy) và lý do từ chối.
const adminTemplate = z.object({
  id: z.string(),
  title: z.string(),
  category,
  authorName: z.string(),
  authorEmail: z.string().nullable(),
  status,
  rejectReason: z.string().nullable(),
  updatedAt: z.string(),
  snapshot: z.record(z.string(), z.unknown()),
});

export type AdminTemplate = z.infer<typeof adminTemplate>;
export type TemplateStatus = z.infer<typeof status>;

const FIELDS = 'id title category authorName authorEmail status rejectReason updatedAt snapshot';
const LIST = `query($status: TemplateStatus!, $first: Int) { adminTemplates(status: $status, first: $first) { nodes { ${FIELDS} } pageInfo { hasNextPage } } }`;
const APPROVE = `mutation($id: ID!) { approveTemplate(id: $id) { ${FIELDS} } }`;
const REJECT = `mutation($id: ID!, $reason: String!) { rejectTemplate(id: $id, reason: $reason) { ${FIELDS} } }`;
const REMOVE = `mutation($id: ID!) { removeTemplate(id: $id) { ${FIELDS} } }`;

export const adminApi = {
  // Tối đa 50 mẫu mới nhất của một trạng thái; `more` cho biết còn nữa.
  list: async (templateStatus: TemplateStatus, signal?: AbortSignal): Promise<{ nodes: AdminTemplate[]; more: boolean }> => {
    const { adminTemplates } = z
      .object({ adminTemplates: z.object({ nodes: z.array(adminTemplate), pageInfo: z.object({ hasNextPage: z.boolean() }) }) })
      .parse(await apiFetch.graphql(LIST, { status: templateStatus, first: 50 }, signal));
    return { nodes: adminTemplates.nodes, more: adminTemplates.pageInfo.hasNextPage };
  },

  approve: async (id: string): Promise<void> => {
    await apiFetch.graphql(APPROVE, { id });
  },

  reject: async (id: string, reason: string): Promise<void> => {
    await apiFetch.graphql(REJECT, { id, reason });
  },

  remove: async (id: string): Promise<void> => {
    await apiFetch.graphql(REMOVE, { id });
  },
};
