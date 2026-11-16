import { API_URL } from "@/lib/api/config";
import { requestJson } from "@/lib/cards/forms/api";

// Khách mở link riêng `/thiep/<slug>?g=<mã>`: trình duyệt đọc mã, hỏi CMBE tên và lời chào của đúng khách đó, rồi đưa vào `metadata` của thiệp.
// Tên không nằm trong link hay HTML công khai, nên trang công khai vẫn cache được; đổi lại chữ dự phòng hiện thoáng trước khi tên tới.
export interface PublicGuest {
  name: string;
  greeting: string | null;
  inviteMessage: string | null;
}

// Mã khách: 8 ký tự bỏ 0/O/1/I/L, như CMBE (`guests.schema.ts`); đọc không phân biệt hoa thường.
const CODE = /^[2-9A-HJKMNP-Z]{8}$/;

/** Mã khách trong chuỗi truy vấn của link (`?g=...`), viết hoa, hoặc undefined nếu không có hay sai dạng. */
export function guestCodeFromSearch(search: string): string | undefined {
  const value = new URLSearchParams(search).get("g")?.trim().toUpperCase();
  return value && CODE.test(value) ? value : undefined;
}

export function fetchPublicGuest(slug: string, code: string, fetchImpl: typeof fetch = fetch): Promise<PublicGuest> {
  return requestJson<PublicGuest>(`/publications/${encodeURIComponent(slug)}/guest/${encodeURIComponent(code)}`, { method: "GET", cache: "no-store" }, fetchImpl);
}

/** Báo CMBE khách đã mở link (một lần mỗi phiên); lỗi không làm hỏng trang. */
export async function recordGuestOpen(slug: string, code: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  try {
    await fetchImpl(`${API_URL}/api/v1/publications/${encodeURIComponent(slug)}/guest/${encodeURIComponent(code)}/open`, { method: "POST" });
  } catch {
    // Chỉ là thống kê.
  }
}
