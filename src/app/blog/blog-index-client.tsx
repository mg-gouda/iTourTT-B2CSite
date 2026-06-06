'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import {
  fetchBlogList,
  type BlogListResponse,
} from '@/lib/website-content';
import { resolveAssetUrl } from '@/lib/site-settings';
import { useLocaleStore, type Locale } from '@/lib/website-i18n';

interface Props {
  initial: BlogListResponse | null;
  page: number;
  category?: string;
}

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function BlogIndexClient({ initial, page, category }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const [override, setOverride] = useState<{
    locale: Locale;
    data: BlogListResponse | null;
  } | null>(null);

  // Server-rendered `initial` is English. When a non-English locale is
  // selected, re-fetch the translated list and swap it in.
  useEffect(() => {
    if (locale === 'en') return;
    let active = true;
    fetchBlogList({ page, category, locale }).then((res) => {
      if (active && res) setOverride({ locale, data: res });
    });
    return () => {
      active = false;
    };
  }, [locale, page, category, initial]);

  // Only use the fetched translation if it matches the current locale,
  // otherwise fall back to the English `initial`.
  const data = override && override.locale === locale ? override.data : initial;
  const items = data?.items ?? [];

  return (
    <section className="px-4 py-14">
      <div className="mx-auto max-w-5xl">
        {items.length === 0 ? (
          <p className="py-16 text-center text-gray-500">
            No articles published yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {post.coverImageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveAssetUrl(post.coverImageUrl)}
                    alt={post.title}
                    className="h-44 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-5">
                  {post.categories?.length > 0 && (
                    <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                      {post.categories[0].name}
                    </span>
                  )}
                  <h2 className="text-lg font-bold leading-snug text-gray-900 group-hover:text-emerald-700">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-500">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-emerald-600">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/blog?page=${p}${category ? `&category=${category}` : ''}`}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === data.page
                    ? 'bg-gray-900 text-white'
                    : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
