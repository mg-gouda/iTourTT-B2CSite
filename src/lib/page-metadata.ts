// Centralised per-page metadata builder.
// Fetches GET /public/seo/<pageKey> from the backend and builds the full
// Next.js Metadata object (title, description, Open Graph, Twitter, hreflang).

import type { Metadata } from 'next';
import { fetchPageSeo } from './website-content';
import { SITE_URL, OG_IMAGE, BRAND_NAME } from './seo';
import { LOCALES } from './i18n-config';

interface PageMetadataOpts {
  /** Full locale-aware canonical, e.g. /en/book */
  canonical: string;
  /** Non-locale base path for hreflang generation, e.g. /book.
   *  When provided, alternates for all 7 locales are added. */
  path?: string;
  /** Current locale for this page. Required when path is set. */
  locale?: string;
  fallbackTitle: string;
  fallbackDescription: string;
  /** Override og:image — defaults to the generated /opengraph-image. */
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

  // Build hreflang alternates when a base path is supplied.
  let languages: Record<string, string> | undefined;
  if (opts.path) {
    languages = { 'x-default': `${SITE_URL}/en${opts.path}` };
    LOCALES.forEach((loc) => {
      languages![loc] = `${SITE_URL}/${loc}${opts.path}`;
    });
  }

  return {
    title,
    description,
    alternates: {
      canonical: opts.canonical,
      ...(languages ? { languages } : {}),
    },
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
