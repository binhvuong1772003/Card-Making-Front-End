import { describe, expect, it, vi } from 'vitest';
import { createApiClient } from './client';
import { ApiError } from './errors';

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
  });

const apiError = (status: number, code: string) => json(status, { error: { code, message: code } });

// Mỗi lời gọi lấy một kết quả theo thứ tự; gọi quá số kết quả đã chuẩn bị là lỗi test.
function setup(...responses: Array<Response | ((url: string) => Response)>) {
  const queue = [...responses];
  const calls: string[] = [];
  const fetchMock = vi.fn<typeof fetch>(async (input) => {
    const url = String(input).replace('http://api.test/api/v1', '');
    calls.push(url);
    const next = queue.shift();
    if (!next) throw new Error(`unexpected call to ${url}`);
    return typeof next === 'function' ? next(url) : next;
  });
  const apiFetch = createApiClient({ baseUrl: 'http://api.test', fetch: fetchMock as unknown as typeof fetch });
  return { apiFetch, calls, fetchMock };
}

describe('apiFetch', () => {
  it('returns parsed JSON and always sends cookies', async () => {
    const { apiFetch, fetchMock } = setup(json(200, { user: { id: '1' } }));
    await expect(apiFetch('/auth/me')).resolves.toEqual({ user: { id: '1' } });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'GET', credentials: 'include' });
  });

  it('sends a JSON body as POST', async () => {
    const { apiFetch, fetchMock } = setup(json(200, {}));
    await apiFetch('/auth/login', { body: { email: 'a@b.c', password: 'x' } });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.c', password: 'x' }),
    });
  });

  it('returns undefined on 204', async () => {
    const { apiFetch } = setup(new Response(null, { status: 204 }));
    await expect(apiFetch('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();
  });

  it('throws ApiError carrying the backend code and details', async () => {
    const { apiFetch } = setup(json(400, { error: { code: 'VALIDATION', message: 'Invalid request', details: [{ path: 'email' }] } }));
    await expect(apiFetch('/auth/register', { body: {} })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'VALIDATION',
      details: [{ path: 'email' }],
    });
  });

  it('maps a non-JSON error page to a generic code', async () => {
    const { apiFetch } = setup(new Response('<html>bad gateway</html>', { status: 502 }));
    await expect(apiFetch('/auth/me')).rejects.toMatchObject({ status: 502, code: 'INTERNAL' });
  });

  it('maps a network failure to NETWORK', async () => {
    const apiFetch = createApiClient({
      baseUrl: 'http://api.test',
      fetch: (async () => {
        throw new TypeError('Failed to fetch');
      }) as unknown as typeof fetch,
    });
    await expect(apiFetch('/auth/me')).rejects.toMatchObject({ status: 0, code: 'NETWORK' });
  });
});

describe('refresh on 401', () => {
  it('refreshes once and retries the original request once', async () => {
    const { apiFetch, calls } = setup(apiError(401, 'UNAUTHENTICATED'), json(200, { refreshed: true }), json(200, { user: { id: '1' } }));
    await expect(apiFetch('/auth/me')).resolves.toEqual({ user: { id: '1' } });
    expect(calls).toEqual(['/auth/me', '/auth/refresh', '/auth/me']);
  });

  it('shares a single refresh between concurrent requests', async () => {
    const { apiFetch, calls } = setup(
      apiError(401, 'UNAUTHENTICATED'),
      apiError(401, 'UNAUTHENTICATED'),
      apiError(401, 'UNAUTHENTICATED'),
      json(200, { refreshed: true }),
      json(200, { n: 1 }),
      json(200, { n: 2 }),
      json(200, { n: 3 }),
    );
    await Promise.all([apiFetch('/auth/me'), apiFetch('/a'), apiFetch('/b')]);
    expect(calls.filter((url) => url === '/auth/refresh')).toHaveLength(1);
  });

  it('does not refresh again for a 401 whose request was sent before the last refresh finished', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    const calls: string[] = [];
    let slowOnce = true;
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = String(input).replace('http://api.test/api/v1', '');
      calls.push(url);
      if (url === '/slow' && slowOnce) {
        slowOnce = false;
        await gate; // phản hồi 401 đến muộn, sau khi lần refresh đã xong
        return apiError(401, 'UNAUTHENTICATED');
      }
      if (url === '/fast' && calls.filter((c) => c === '/fast').length === 1) return apiError(401, 'UNAUTHENTICATED');
      if (url === '/auth/refresh') return json(200, { refreshed: true });
      return json(200, { ok: url });
    });
    const apiFetch = createApiClient({ baseUrl: 'http://api.test', fetch: fetchMock as unknown as typeof fetch });

    const slow = apiFetch('/slow');
    await apiFetch('/fast');
    release();
    await expect(slow).resolves.toEqual({ ok: '/slow' });
    expect(calls.filter((url) => url === '/auth/refresh')).toHaveLength(1);
  });

  it('retries without a second refresh on 409 REFRESH_CONFLICT', async () => {
    const { apiFetch, calls } = setup(apiError(401, 'UNAUTHENTICATED'), apiError(409, 'REFRESH_CONFLICT'), json(200, { user: { id: '1' } }));
    await expect(apiFetch('/auth/me')).resolves.toEqual({ user: { id: '1' } });
    expect(calls).toEqual(['/auth/me', '/auth/refresh', '/auth/me']);
  });

  it('throws the original 401 and does not retry when the session is over', async () => {
    const { apiFetch, calls } = setup(apiError(401, 'UNAUTHENTICATED'), apiError(401, 'UNAUTHENTICATED'));
    await expect(apiFetch('/auth/me')).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
    expect(calls).toEqual(['/auth/me', '/auth/refresh']);
  });

  it('throws when the retry is rejected again, after a single refresh', async () => {
    const { apiFetch, calls } = setup(apiError(401, 'UNAUTHENTICATED'), json(200, { refreshed: true }), apiError(401, 'UNAUTHENTICATED'));
    await expect(apiFetch('/auth/me')).rejects.toBeInstanceOf(ApiError);
    expect(calls).toEqual(['/auth/me', '/auth/refresh', '/auth/me']);
  });

  it.each(['/auth/login', '/auth/register', '/auth/verify-email', '/auth/resend-verification'])(
    'never refreshes on a 401 from %s',
    async (path) => {
      const { apiFetch, calls } = setup(apiError(401, 'UNAUTHENTICATED'));
      await expect(apiFetch(path, { body: {} })).rejects.toMatchObject({ status: 401 });
      expect(calls).toEqual([path]);
    },
  );
});
