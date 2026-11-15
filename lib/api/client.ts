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

// GraphQL nằm ở gốc, không dưới /api/v1, và trả HTTP 200 kèm `errors` (xem `graphql` bên dưới).
const GRAPHQL_PATH = '/graphql';

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
      return await fetchImpl(path === GRAPHQL_PATH ? `${baseUrl}${path}` : `${baseUrl}/api/v1${path}`, {
        method: init.method ?? (hasBody ? 'POST' : 'GET'),
        credentials: 'include',
        headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
        body: hasBody ? JSON.stringify(init.body) : undefined,
        // Không truyền tín hiệu hủy xuống fetch: TanStack Query hủy truy vấn khi màn hình bị gỡ hoặc ẩn đi (Next giữ trang cũ ở chế độ ẩn), và lúc đó fetch ném AbortError nổi lên lớp phủ lỗi của Next dù không có lỗi thật. Kết quả của truy vấn đã hủy vẫn bị bỏ.
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

  interface GraphqlResponse<T> {
    data?: T | null;
    errors?: { message: string; extensions?: { code?: ApiErrorCode } }[];
  }

  // Lỗi GraphQL đi kèm HTTP 200, nên UNAUTHENTICATED nằm trong `errors`: refresh một lần rồi thử lại, như `apiFetch` với 401.
  async function graphql<T>(query: string, variables?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    const run = () => apiFetch<GraphqlResponse<T>>(GRAPHQL_PATH, { body: { query, variables }, signal });
    const startedAt = epoch;
    let result = await run();
    if (result.errors?.[0]?.extensions?.code === 'UNAUTHENTICATED') {
      const refreshed = epoch !== startedAt ? 'ok' : await refresh();
      if (refreshed !== 'expired') result = await run();
    }
    const first = result.errors?.[0];
    if (first) throw new ApiError(200, first.extensions?.code ?? 'UNKNOWN', first.message);
    if (!result.data) throw new ApiError(200, 'UNKNOWN', 'No data');
    return result.data;
  }

  return Object.assign(apiFetch, { graphql });
}
