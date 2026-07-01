import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { DESTINATIONS } from '@/lib/destinations';
import { allRoutes } from '@/lib/routes';
import { LOCALES } from '@/lib/i18n-config';
import { fetchBlogList } from '@/lib/website-content';

export const revalidate = 3600;

// Content-revision date for the programmatic pages (core, destinations, transfer
// routes). Their copy is defined in code and changes rarely, so lastmod MUST be
// a stable date — NOT the sitemap generation time. An always-"now" lastmod
// (which changed on every hourly revalidate and every deploy) teaches Google the
// signal is unreliable, so it stops using lastmod for crawl prioritization —
// hurting exactly the pages still waiting in "Discovered – currently not
// indexed". Bump this only when that programmatic copy actually changes.
const CONTENT_REVISION = new Date('2026-07-01T00:00:00Z');

// Core paths (excluding locale-invariant routes like /login, /account).
const CORE_PATHS = [
  { path: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
  { path: '/book', changeFrequency: 'monthly' as const, priority: 0.9 },
  { path: '/destinations', changeFrequency: 'weekly' as const, priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/booking/lookup', changeFrequency: 'monthly' as const, priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
        lastModified: CONTENT_REVISION,
        changeFrequency,
        priority: locale === 'en' ? priority : priority * 0.8, // slightly lower for non-primary
      });
    }

    // Destination pages
    for (const dest of DESTINATIONS) {
      entries.push({
        url: `${SITE_URL}/${locale}/transfers/${dest.slug}`,
        lastModified: CONTENT_REVISION,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.8 : 0.65,
      });
    }

    // Route-level long-tail pages (/transfers/[city]/[route])
    for (const { city, route } of allRoutes()) {
      entries.push({
        url: `${SITE_URL}/${locale}/transfers/${city}/${route}`,
        lastModified: CONTENT_REVISION,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.7 : 0.55,
      });
    }

    // Blog posts — real publish date is a trustworthy per-URL lastmod.
    for (const post of blogSlugs) {
      entries.push({
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : CONTENT_REVISION,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.6 : 0.5,
      });
    }
  }

  return entries;
}
