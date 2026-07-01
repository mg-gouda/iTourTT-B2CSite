import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Only block the API surface. Private pages (/account, /login, password
        // flows, /payment) are kept crawlable ON PURPOSE and rely on their
        // `noindex` meta tag: Google must be able to fetch a page to see its
        // noindex directive, so disallowing them in robots.txt would defeat the
        // tag and risk "Indexed, though blocked by robots.txt".
        disallow: ['/api/'],
      },
      // Explicitly welcome AI search / answer-engine crawlers so the site is
      // eligible for citation in AI-generated answers.
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
