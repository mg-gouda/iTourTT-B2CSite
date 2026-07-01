import Link from 'next/link';
import { headers } from 'next/headers';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { notFoundCopy } from '@/lib/not-found-copy';

// Global 404 boundary. Catches routes with no matching segment and notFound()
// thrown from app/[locale]/layout.tsx (invalid locale) — cases that bubble
// above the locale-scoped not-found. Returns HTTP 404.
export default async function RootNotFound() {
  const locale = (await headers()).get('x-locale') ?? 'en';
  const t = notFoundCopy(locale);

  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }
  const primary = settings.primaryColor;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-6xl font-extrabold tracking-tight sm:text-7xl" style={{ color: primary }}>
        {t.code}
      </p>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {t.title}
      </h1>
      <p className="mt-4 max-w-md text-base text-gray-600">{t.description}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/${locale}`}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: primary }}
        >
          {t.home}
        </Link>
        <Link
          href={`/${locale}/book`}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          {t.book}
        </Link>
      </div>
    </main>
  );
}
