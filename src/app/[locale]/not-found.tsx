import Link from 'next/link';
import { headers } from 'next/headers';
import { notFoundCopy } from '@/lib/not-found-copy';

// 404 boundary for missing content inside a locale route (bad blog / CMS /
// destination slug, etc.). Rendered within app/[locale]/layout.tsx, so it
// appears inside the full site chrome (header + footer) and returns HTTP 404.
// not-found.tsx cannot receive route params, so the active locale is read from
// the x-locale request header set by middleware.
export default async function LocaleNotFound() {
  const locale = (await headers()).get('x-locale') ?? 'en';
  const t = notFoundCopy(locale);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-6xl font-extrabold tracking-tight text-[var(--website-primary)] sm:text-7xl">
        {t.code}
      </p>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {t.title}
      </h1>
      <p className="mt-4 max-w-md text-base text-gray-600">{t.description}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={`/${locale}`}
          className="rounded-lg bg-[var(--website-primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--website-primary-dark)]"
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
