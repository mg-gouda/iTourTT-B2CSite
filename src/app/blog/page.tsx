import type { Metadata } from 'next';
import { fetchBlogList } from '@/lib/website-content';
import { buildPageMetadata } from '@/lib/page-metadata';
import { BlogIndexClient } from './blog-index-client';

export const revalidate = 120;

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams;
  const base = await buildPageMetadata('blog', {
    canonical: '/blog',
    fallbackTitle: 'Blog | Travel Tips & Egypt Transfer Guides | Transfera',
    fallbackDescription:
      'Travel tips, destination guides and airport transfer advice for your trip to Egypt.',
  });
  // Paginated variants (?page=2, ?page=3 …) canonicalise back to /blog so
  // they don't compete with the main listing page in search results.
  if (page && parseInt(page, 10) > 1) {
    return { ...base, alternates: { canonical: '/blog' } };
  }
  return base;
}

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const { page, category } = await searchParams;
  const pageNum = page ? parseInt(page, 10) : 1;
  // English list for SEO / first paint; the client swaps in the
  // translated list when a non-English locale is selected.
  const data = await fetchBlogList({ page: pageNum, category });

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
      <BlogIndexClient initial={data} page={pageNum} category={category} />
    </div>
  );
}
