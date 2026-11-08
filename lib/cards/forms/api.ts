import { API_URL } from "@/lib/api/config";
import { ApiError, type ApiErrorCode } from "@/lib/api/errors";

// Form công khai của thiệp gọi thẳng CMBE bằng JSON, không cookie: không dùng `apiFetch` vì hàm đó gắn /api/v1 cho các API đăng nhập và
// refresh 401. Dùng chung một chỗ đọc lỗi để câu tiếng Việt của khối Biểu mẫu khớp nhau.

interface ErrorBody {
  error?: { code?: ApiErrorCode; message?: string; details?: unknown };
}

export async function requestJson<T>(path: string, init: RequestInit, fetchImpl: typeof fetch = fetch): Promise<T> {
  let res: Response;
  try {
    res = await fetchImpl(`${API_URL}/api/v1${path}`, {
      ...init,
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Cannot reach the server");
  }

  if (!res.ok) {
    let body: ErrorBody | null = null;
    try {
      body = (await res.json()) as ErrorBody;
    } catch {
      // Phản hồi không phải JSON (proxy, trang lỗi): giữ mã chung bên dưới.
    }
    throw new ApiError(res.status, body?.error?.code ?? "UNKNOWN", body?.error?.message ?? res.statusText, body?.error?.details);
  }

  return (await res.json()) as T;
}

// Câu chung cho một lần gửi hỏng. 409 mang lý do trong `details.reason` để phân biệt thiệp đã đủ chỗ với form đã hết hạn.
export function formErrorMessage(err: unknown): string {
  if (!(err instanceof ApiError)) return "Chưa gửi được, thử lại sau.";
  if (err.code === "NETWORK") return "Chưa gửi được, kiểm tra mạng rồi thử lại.";
  if (err.code === "RATE_LIMITED") return "Bạn gửi hơi nhanh, thử lại sau ít phút.";
  if (err.code === "NOT_FOUND") return "Không tìm thấy thiệp này.";
  if (err.code === "VALIDATION") return "Thông tin chưa đúng, bạn kiểm tra lại.";
  if (err.code === "CONFLICT") {
    const reason = (err.details as { reason?: unknown } | undefined)?.reason;
    if (reason === "FULL") return "Thiệp này đã nhận đủ phản hồi.";
    if (reason === "CLOSED") return "Đã hết hạn xác nhận.";
  }
  return "Chưa gửi được, thử lại sau.";
}
