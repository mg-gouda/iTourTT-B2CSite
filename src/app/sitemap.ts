import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { DESTINATIONS } from '@/lib/destinations';
import { allRoutes } from '@/lib/routes';
import { LOCALES } from '@/lib/i18n-config';
import { fetchBlogList } from '@/lib/website-content';

export const revalidate = 3600;

// Core paths (excluding locale-invariant routes like /login, /account).
const CORE_PATHS = [
  { path: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/book', changeFrequency: 'monthly' as const, priority: 0.9 },
  { path: '/destinations', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/booking/lookup', changeFrequency: 'monthly' as const, priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Blog posts fetched from API (fail-soft).
  let blogSlugs: { slug: string; publishedAt: string | null }[] = [];
  try {
    const data = await fetchBlogList({ page: 1 });
    blogSlugs = data?.items?.map((p) => ({ slug: p.slug, publishedAt: p.publishedAt })) ?? [];
  } catch {
    // Sitemap still valid without blog posts
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    // Core pages
    for (const { path, changeFrequency, priority } of CORE_PATHS) {
      entries.push({
        url: `${SITE_URL}/${locale}${path === '/' ? '' : path}`,
        lastModified: now,
        changeFrequency,
        priority: locale === 'en' ? priority : priority * 0.8, // slightly lower for non-primary
      });
    }

    // Destination pages
    for (const dest of DESTINATIONS) {
      entries.push({
        url: `${SITE_URL}/${locale}/transfers/${dest.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.8 : 0.65,
      });
    }

    // Route-level long-tail pages (/transfers/[city]/[route])
    for (const { city, route } of allRoutes()) {
      entries.push({
        url: `${SITE_URL}/${locale}/transfers/${city}/${route}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.7 : 0.55,
      });
    }

    // Blog posts
    for (const post of blogSlugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.6 : 0.5,
      });
    }
  }

  return entries;
}
