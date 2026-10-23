import { ApiError, type ApiErrorCode } from './errors';

export interface ApiRequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export interface ApiClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
}

// 401 từ các endpoint này là kết quả bình thường (sai mật khẩu, hết phiên), không phải token hết hạn: không được refresh.
const NO_REFRESH = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/verify-email',
  '/auth/resend-verification',
]);

const REFRESH_LOCK = 'cmfe-auth-refresh';

type RefreshResult = 'ok' | 'conflict' | 'expired';

// Chạy `run` dưới khóa của trình duyệt để các tab không refresh cùng lúc; không có Web Locks (test, trình duyệt cũ) thì chạy thẳng.
const withTabLock = async <T>(run: () => Promise<T>): Promise<T> => {
  if (typeof navigator === 'undefined' || !navigator.locks) return run();
  return await navigator.locks.request(REFRESH_LOCK, run);
};

export function createApiClient({ baseUrl, fetch: fetchImpl = (...args) => fetch(...args) }: ApiClientOptions) {
  // Mỗi lần refresh xong tăng một nấc. Request gửi trước nấc đó mang cookie cũ nên chỉ cần thử lại, không refresh nữa.
  let epoch = 0;
  let inflight: Promise<RefreshResult> | null = null;

  async function send(path: string, init: ApiRequestInit): Promise<Response> {
    const hasBody = init.body !== undefined;
    try {
      return await fetchImpl(`${baseUrl}/api/v1${path}`, {
        method: init.method ?? (hasBody ? 'POST' : 'GET'),
        credentials: 'include',
        headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
        body: hasBody ? JSON.stringify(init.body) : undefined,
        signal: init.signal,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new ApiError(0, 'NETWORK', 'Cannot reach the server');
    }
  }

  async function toApiError(res: Response): Promise<ApiError> {
    try {
      const data = (await res.json()) as { error?: { code?: ApiErrorCode; message?: string; details?: unknown } };
      if (data.error?.code) return new ApiError(res.status, data.error.code, data.error.message ?? res.statusText, data.error.details);
    } catch {
      // Phản hồi không phải JSON (proxy, trang lỗi): rơi xuống mã chung bên dưới.
    }
    return new ApiError(res.status, res.status >= 500 ? 'INTERNAL' : 'UNKNOWN', res.statusText || 'Request failed');
  }

  function refresh(): Promise<RefreshResult> {
    inflight ??= withTabLock(async (): Promise<RefreshResult> => {
      const res = await send('/auth/refresh', { method: 'POST' });
      if (res.ok) return 'ok';
      const err = await toApiError(res);
      // 409: tab khác vừa refresh xong, cookie mới đã nằm trong trình duyệt. 401: phiên đã hết.
      if (err.code === 'REFRESH_CONFLICT') return 'conflict';
      if (err.code === 'UNAUTHENTICATED') return 'expired';
      throw err;
    })
      .then((result) => {
        epoch += 1;
        return result;
      })
      .finally(() => {
        inflight = null;
      });
    return inflight;
  }

  async function apiFetch<T = void>(path: string, init: ApiRequestInit = {}): Promise<T> {
    const startedAt = epoch;
    let res = await send(path, init);

    if (res.status === 401 && !NO_REFRESH.has(path)) {
      const result = epoch !== startedAt ? 'ok' : await refresh();
      if (result === 'expired') throw await toApiError(res);
      res = await send(path, init);
    }

    if (!res.ok) throw await toApiError(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }

  return apiFetch;
}
