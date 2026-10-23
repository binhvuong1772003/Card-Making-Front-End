import { z } from 'zod';
import { API_URL, apiFetch } from '@/lib/api';
import { userSchema, type LoginInput, type RegisterInput } from './schemas';

const userResponse = z.object({ user: userSchema });

export const authApi = {
  register: (input: RegisterInput) => apiFetch('/auth/register', { body: input }),

  login: async (input: Pick<LoginInput, 'email' | 'password'>) =>
    userResponse.parse(await apiFetch('/auth/login', { body: input })).user,

  verifyEmail: (token: string) => apiFetch('/auth/verify-email', { body: { token } }),

  resendVerification: (email: string) => apiFetch('/auth/resend-verification', { body: { email } }),

  me: async (signal?: AbortSignal) => userResponse.parse(await apiFetch('/auth/me', { signal })).user,

  logout: () => apiFetch('/auth/logout', { method: 'POST' }),

  logoutAll: () => apiFetch('/auth/logout-all', { method: 'POST' }),
};

// Đăng nhập Google phải là điều hướng của trình duyệt (link thường hoặc window.location), không phải fetch.
export const googleStartUrl = (returnTo?: string): string => {
  const url = new URL('/api/v1/auth/google/start', API_URL);
  if (returnTo) url.searchParams.set('returnTo', returnTo);
  return url.toString();
};

export const meQueryKey = ['auth', 'me'] as const;
