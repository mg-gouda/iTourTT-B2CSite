// Centralised per-page metadata builder.
// Fetches GET /public/seo/<pageKey> from the backend and builds the full
// Next.js Metadata object (title, description, Open Graph, Twitter).
// Fall back to the supplied static strings when the API returns null.

import type { Metadata } from 'next';
import { fetchPageSeo } from './website-content';
import { SITE_URL, OG_IMAGE, BRAND_NAME } from './seo';

interface PageMetadataOpts {
  canonical: string;
  fallbackTitle: string;
  fallbackDescription: string;
  /** Override og:image — defaults to the site-wide OG_IMAGE. */
  ogImage?: string;
  /** Set robots noindex/nofollow (private pages). */
  noIndex?: boolean;
}

export async function buildPageMetadata(
  pageKey: string,
  opts: PageMetadataOpts,
): Promise<Metadata> {
  const seo = await fetchPageSeo(pageKey);
  const title = seo?.metaTitle ?? opts.fallbackTitle;
  const description = seo?.metaDescription ?? opts.fallbackDescription;
  const image = opts.ogImage ?? OG_IMAGE;
  const absoluteUrl = `${SITE_URL}${opts.canonical}`;

  return {
    title,
    description,
    alternates: { canonical: opts.canonical },
    ...(opts.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      url: absoluteUrl,
      siteName: BRAND_NAME,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
