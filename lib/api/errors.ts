// Lỗi REST của CMBE luôn có dạng { error: { code, message, details? } }. Rẽ nhánh theo `code`, không theo `message`.
export type ApiErrorCode =
  | 'VALIDATION'
  | 'UNAUTHENTICATED'
  | 'EMAIL_NOT_VERIFIED'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'ACCOUNT_CONFLICT'
  | 'REFRESH_CONFLICT'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_FAILED'
  | 'PROVIDER_EMAIL_UNVERIFIED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL'
  | 'NETWORK'
  | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isApiError = (err: unknown, code?: ApiErrorCode): err is ApiError =>
  err instanceof ApiError && (code === undefined || err.code === code);
