import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { DESTINATIONS } from '@/lib/destinations';
import { fetchBlogList } from '@/lib/website-content';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/book`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/destinations`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/booking/lookup`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const destinations: MetadataRoute.Sitemap = DESTINATIONS.map((d) => ({
    url: `${SITE_URL}/transfers/${d.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Include published blog posts (fail-soft — skip on API error).
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const data = await fetchBlogList({ page: 1 });
    if (data?.items) {
      blogPosts = data.items.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // Not critical — sitemap still works without blog posts.
  }

  return [...core, ...destinations, ...blogPosts];
}
