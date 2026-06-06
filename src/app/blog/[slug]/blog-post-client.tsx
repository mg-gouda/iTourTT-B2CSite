'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';
import { fetchBlogPost, type BlogPost } from '@/lib/website-content';
import { resolveAssetUrl } from '@/lib/site-settings';
import { useLocaleStore, type Locale } from '@/lib/website-i18n';

interface Props {
  initial: BlogPost;
}

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function BlogPostClient({ initial }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const [override, setOverride] = useState<{ locale: Locale; post: BlogPost } | null>(null);

  // Server-rendered `initial` is English. Re-fetch the translated post
  // when a non-English locale is selected.
  useEffect(() => {
    if (locale === 'en') return;
    let active = true;
    fetchBlogPost(initial.slug, locale).then((res) => {
      if (active && res) setOverride({ locale, post: res });
    });
    return () => {
      active = false;
    };
  }, [locale, initial]);

  // Only use the fetched translation if it matches the current locale,
  // otherwise fall back to the English `initial`.
  const post = override && override.locale === locale ? override.post : initial;

  return (
    <article className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>

        {post.categories?.length > 0 && (
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {post.categories[0].name}
          </span>
        )}

        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          {post.author && (
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" /> {post.author}
            </span>
          )}
          {post.publishedAt && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" /> {formatDate(post.publishedAt)}
            </span>
          )}
        </div>

        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolveAssetUrl(post.coverImageUrl)}
            alt={post.title}
            className="mt-8 w-full rounded-2xl object-cover"
          />
        )}

        {post.contentHtml ? (
          <div
            className="blog-content mt-8"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        ) : (
          post.excerpt && <p className="mt-8 text-gray-600">{post.excerpt}</p>
        )}

        {post.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
