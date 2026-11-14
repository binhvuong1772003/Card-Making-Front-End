import { z } from 'zod';
import { apiFetch } from '@/lib/api';

const frame = z.object({
  id: z.string(), label: z.string(), category: z.string(), geometry: z.string(), maskPath: z.string().nullable(),
  width: z.number().int(), height: z.number().int(), sortOrder: z.number().int(),
});
const decoration = z.object({
  id: z.string(), name: z.string(), category: z.string(), tags: z.array(z.string()), publicId: z.string(), url: z.string(),
  width: z.number().int(), height: z.number().int(), sortOrder: z.number().int(),
});
const pageInfo = z.object({ hasNextPage: z.boolean(), endCursor: z.string().nullable() });
export type CatalogFrame = z.infer<typeof frame>;
export type CatalogDecoration = z.infer<typeof decoration>;
export type CatalogPage<T> = { nodes: T[]; pageInfo: z.infer<typeof pageInfo> };

const FRAME_QUERY = `query($first:Int,$after:String){photoFrameShapes(first:$first,after:$after){nodes{id label category geometry maskPath width height sortOrder} pageInfo{hasNextPage endCursor}}}`;
const DECOR_QUERY = `query($category:String,$search:String,$first:Int,$after:String){decorativeAssets(category:$category,search:$search,first:$first,after:$after){nodes{id name category tags publicId url width height sortOrder} pageInfo{hasNextPage endCursor}}}`;
const SAVE_FRAME = `mutation($input:PhotoFrameShapeInput!){savePhotoFrameShape(input:$input){id}}`;
const RETIRE_FRAME = `mutation($id:ID!){retirePhotoFrameShape(id:$id){id}}`;
const CREATE_DECORATION = `mutation($input:DecorativeAssetInput!){createDecorativeAsset(input:$input){id}}`;
const UPDATE_DECORATION = `mutation($id:ID!,$name:String,$category:String,$tags:[String!],$sortOrder:Int){updateDecorativeAsset(id:$id,name:$name,category:$category,tags:$tags,sortOrder:$sortOrder){id}}`;
const RETIRE_DECORATION = `mutation($id:ID!){retireDecorativeAsset(id:$id){id}}`;

export const catalogApi = {
  frames: async (first = 24, after?: string, signal?: AbortSignal): Promise<CatalogPage<CatalogFrame>> =>
    z.object({ photoFrameShapes: z.object({ nodes: z.array(frame), pageInfo }) })
      .parse(await apiFetch.graphql(FRAME_QUERY, { first, after }, signal)).photoFrameShapes,
  decorations: async (options: { category?: string; search?: string; first?: number; after?: string } = {}, signal?: AbortSignal): Promise<CatalogPage<CatalogDecoration>> =>
    z.object({ decorativeAssets: z.object({ nodes: z.array(decoration), pageInfo }) })
      .parse(await apiFetch.graphql(DECOR_QUERY, { category: options.category, search: options.search, first: options.first ?? 24, after: options.after }, signal)).decorativeAssets,
  saveFrame: async (input: CatalogFrame & { legacyType?: string }) => { await apiFetch.graphql(SAVE_FRAME, { input }); },
  retireFrame: async (id: string) => { await apiFetch.graphql(RETIRE_FRAME, { id }); },
  createDecoration: async (input: Omit<CatalogDecoration, 'id'>) => {
    const result = z.object({ createDecorativeAsset: z.object({ id: z.string() }) }).parse(await apiFetch.graphql(CREATE_DECORATION, { input }));
    return result.createDecorativeAsset.id;
  },
  updateDecoration: async (id: string, patch: { name?: string; category?: string; tags?: string[]; sortOrder?: number }) => { await apiFetch.graphql(UPDATE_DECORATION, { id, ...patch }); },
  retireDecoration: async (id: string) => { await apiFetch.graphql(RETIRE_DECORATION, { id }); },
};
