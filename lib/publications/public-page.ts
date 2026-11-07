import { z } from "zod";
import { API_URL } from "../api/config";

// Trang công khai của một thiệp đã xuất bản (REST không cần đăng nhập). `document` là PageData; Miditor tự kiểm khi dựng.
const publicPage = z.object({
  slug: z.string(),
  title: z.string(),
  document: z.record(z.string(), z.unknown()),
  publishedAt: z.string(),
});
export type PublicPage = z.infer<typeof publicPage>;

// Gọi từ máy chủ Next. 404 là "không có trang này" (null); lỗi khác ném ra để không nhầm một lần lỗi mạng với trang đã gỡ.
export async function fetchPublicPage(slug: string, fetchImpl: typeof fetch = fetch): Promise<PublicPage | null> {
  const res = await fetchImpl(`${API_URL}/api/v1/publications/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Public page request failed with ${res.status}`);
  return publicPage.parse(await res.json());
}
