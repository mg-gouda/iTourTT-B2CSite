// Admin API client → B2C backend (:3002). Separate from the public site's fetch
// helpers and from the guest `b2c_token`. Admin session lives under `b2c_admin_token`.
'use client';

const API_BASE =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3002';

const TOKEN_KEY = 'b2c_admin_token';
const REFRESH_KEY = 'b2c_admin_refresh';

export const adminToken = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  getRefresh: () =>
    typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh?: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  opts: { auth?: boolean; raw?: boolean } = { auth: true },
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.auth !== false) {
    const t = adminToken.get();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && opts.auth !== false) {
    // Session expired — bounce to login.
    if (typeof window !== 'undefined') {
      adminToken.clear();
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    throw new ApiError(401, 'Session expired');
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, Array.isArray(msg) ? msg.join(', ') : msg);
  }
  // Backend wraps some responses in { data }, others return raw. Unwrap when present.
  return (data && typeof data === 'object' && 'data' in data ? data.data : data) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown, opts?: { auth?: boolean }) =>
    request<T>('POST', path, body, { auth: opts?.auth ?? true }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  del: <T>(path: string) => request<T>('DELETE', path),
};
