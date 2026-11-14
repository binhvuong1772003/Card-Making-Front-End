import { z } from 'zod';
import { apiFetch } from '../api';

// Tải ảnh thẳng lên Cloudinary bằng chữ ký do backend cấp (backend giữ api secret). Trả về địa chỉ https của ảnh để Miditor lưu vào thiệp.
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const signature = z.object({
  cloudName: z.string(),
  apiKey: z.string(),
  timestamp: z.number(),
  folder: z.string(),
  allowedFormats: z.string(),
  transformation: z.string(), // do backend ký (thu nhỏ ảnh quá lớn); phải gửi đúng nguyên văn, đổi là chữ ký sai
  signature: z.string(),
});
export type UploadSignature = z.infer<typeof signature>;

const cloudinaryReply = z.object({ secure_url: z.string().optional(), error: z.object({ message: z.string() }).optional() });

export interface UploadDeps {
  sign: () => Promise<UploadSignature>;
  fetch: typeof fetch;
}

export function createUploadImage({ sign, fetch: send }: UploadDeps) {
  return async function uploadImage(file: File): Promise<string> {
    // Lời lỗi hiện nguyên văn trong editor: "Tải lên không thành công: <lời này>".
    if (file.size > MAX_IMAGE_BYTES) throw new Error('ảnh lớn hơn 8 MB');
    const s = await sign();
    const form = new FormData();
    form.set('file', file);
    form.set('api_key', s.apiKey);
    form.set('timestamp', String(s.timestamp));
    form.set('folder', s.folder);
    form.set('allowed_formats', s.allowedFormats);
    form.set('transformation', s.transformation);
    form.set('signature', s.signature);
    const res = await send(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: 'POST', body: form });
    const reply = cloudinaryReply.safeParse(await res.json().catch(() => null));
    if (!res.ok || !reply.success || !reply.data.secure_url) {
      throw new Error(reply.success && reply.data.error ? reply.data.error.message : 'máy chủ ảnh không nhận ảnh này');
    }
    return reply.data.secure_url;
  };
}

export const uploadImage = createUploadImage({
  sign: async () => signature.parse(await apiFetch('/assets/sign', { method: 'POST' })),
  fetch: (...args) => fetch(...args),
});

const catalogSignature = signature;
const catalogUploadReply = z.object({
  secure_url: z.string().url(), public_id: z.string().min(1), width: z.number().int().positive(), height: z.number().int().positive(),
  error: z.object({ message: z.string() }).optional(),
});

/** Upload a shared decorative asset; only admins can obtain this folder's signature. */
export async function uploadCatalogImage(file: File) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error('ảnh lớn hơn 8 MB');
  const s = catalogSignature.parse(await apiFetch('/assets/catalog/sign', { method: 'POST' }));
  const form = new FormData();
  form.set('file', file);
  form.set('api_key', s.apiKey);
  form.set('timestamp', String(s.timestamp));
  form.set('folder', s.folder);
  form.set('allowed_formats', s.allowedFormats);
  form.set('transformation', s.transformation);
  form.set('signature', s.signature);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: 'POST', body: form });
  const reply = catalogUploadReply.safeParse(await res.json().catch(() => null));
  if (!res.ok || !reply.success) throw new Error(reply.success ? reply.data.error?.message ?? 'máy chủ ảnh không nhận ảnh này' : 'máy chủ ảnh trả dữ liệu không hợp lệ');
  return { url: reply.data.secure_url, publicId: reply.data.public_id, width: reply.data.width, height: reply.data.height };
}
