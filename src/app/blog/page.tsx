import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { fetchBlogList, fetchPageSeo } from '@/lib/website-content';
import { resolveAssetUrl } from '@/lib/site-settings';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchPageSeo('blog');
  const title = seo?.metaTitle ?? 'Blog | Travel Tips & Egypt Transfer Guides | Transfera';
  const description =
    seo?.metaDescription ??
    'Travel tips, destination guides and airport transfer advice for your trip to Egypt.';
  return {
    title,
    description,
    alternates: { canonical: '/blog' },
    openGraph: { type: 'website', url: `${SITE_URL}/blog`, title, description },
  };
}

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>;
}

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const { page, category } = await searchParams;
  const data = await fetchBlogList({
    page: page ? parseInt(page, 10) : 1,
    category,
  });
  const items = data?.items ?? [];

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="border-b border-gray-100 bg-gray-50/60 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            The Transfera Blog
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
            Travel tips, destination guides and everything you need for a smooth
            airport transfer in Egypt.
          </p>
        </div>
      </section>

      {/* Posts */}
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
    </div>
  );
}
