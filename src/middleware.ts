import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Inlined to stay edge-safe (no Node.js module imports).
const LOCALES = ['en', 'ar', 'de', 'fr', 'it', 'nl', 'ru'] as const;
const DEFAULT_LOCALE = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Pass through paths that should never be locale-prefixed.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.(svg|ico|png|jpg|jpeg|webp|woff2?|txt|xml)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Already locale-prefixed — surface the active locale to the server tree
  // (root layout) via a request header so it can set <html lang>/<dir>.
  const active = LOCALES.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (active) {
    const headers = new Headers(request.headers);
    headers.set('x-locale', active);
    return NextResponse.next({ request: { headers } });
  }

  // Detect preferred locale from Accept-Language header.
  // Parse segments in the browser's preference order (first = highest quality).
  // Strip quality values and region tags: "ar-EG;q=0.9" → "ar".
  const accept = request.headers.get('accept-language') ?? '';
  const acceptLocales = accept
    .toLowerCase()
    .split(',')
    .map((s) => s.trim().split(';')[0].trim().split('-')[0].trim());
  const preferred =
    acceptLocales.find((l) => (LOCALES as readonly string[]).includes(l)) ??
    DEFAULT_LOCALE;

  // Redirect to locale-prefixed URL (308 Permanent).
  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, { status: 308 });
}

export const config = {
  // Match all paths except Next.js internals, static files and special routes.
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.svg|logo\\.svg|opengraph-image|sitemap\\.xml|robots\\.txt|[a-f0-9]{32}\\.txt).*)',
  ],
};
