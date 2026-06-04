import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { DESTINATIONS } from '@/lib/destinations';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    {
      url: `${SITE_URL}/book`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/booking/lookup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const destinations: MetadataRoute.Sitemap = DESTINATIONS.map((d) => ({
    url: `${SITE_URL}/transfers/${d.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...core, ...destinations];
}
