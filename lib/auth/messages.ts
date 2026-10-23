import { ApiError, type ApiErrorCode } from '@/lib/api';

const MESSAGES: Partial<Record<ApiErrorCode, string>> = {
  VALIDATION: 'Thông tin không hợp lệ, hãy kiểm tra lại.',
  UNAUTHENTICATED: 'Email hoặc mật khẩu không đúng.',
  EMAIL_NOT_VERIFIED: 'Email chưa được xác minh.',
  TOKEN_INVALID: 'Liên kết không hợp lệ.',
  TOKEN_EXPIRED: 'Liên kết đã hết hạn.',
  FORBIDDEN: 'Yêu cầu bị từ chối. Kiểm tra CORS_ORIGINS của backend có chứa địa chỉ trang này không.',
  RATE_LIMITED: 'Thử quá nhiều lần, hãy đợi vài phút rồi thử lại.',
  NETWORK: 'Không kết nối được máy chủ.',
  INTERNAL: 'Máy chủ gặp lỗi, thử lại sau.',
};

export const errorMessage = (err: unknown): string =>
  (err instanceof ApiError && MESSAGES[err.code]) || 'Có lỗi xảy ra, thử lại sau.';

// Mã lỗi backend gắn vào /login?error=<mã> sau khi đăng nhập Google thất bại (redirects.ts của CMBE).
const GOOGLE_ERRORS: Record<string, string> = {
  cancelled: 'Bạn đã hủy đăng nhập Google.',
  invalid_state: 'Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn, hãy thử lại.',
  google_failed: 'Google từ chối hoặc không phản hồi, hãy thử lại.',
  email_unverified: 'Email của tài khoản Google này chưa được Google xác minh.',
  account_conflict: 'Email này đã liên kết với một tài khoản Google khác.',
  server_error: 'Máy chủ gặp lỗi khi đăng nhập Google, thử lại sau.',
};

export const googleErrorMessage = (code: string | undefined): string | null =>
  code ? (GOOGLE_ERRORS[code] ?? 'Đăng nhập Google thất bại.') : null;
