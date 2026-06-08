// Centralised per-page metadata builder.
// Fetches GET /public/seo/<pageKey> from the backend and builds the full
// Next.js Metadata object (title, description, Open Graph, Twitter, hreflang).

import type { Metadata } from 'next';
import { fetchPageSeo } from './website-content';
import { SITE_URL, OG_IMAGE, BRAND_NAME } from './seo';
import { LOCALES } from './i18n-config';

// Map our locale codes to Open Graph locale format (language_TERRITORY).
// Arabic is territory-tagged to Egypt to reinforce the operating market.
const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  ar: 'ar_EG',
  de: 'de_DE',
  fr: 'fr_FR',
  it: 'it_IT',
  nl: 'nl_NL',
  ru: 'ru_RU',
};

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
  // Pull localized SEO for the current locale so non-English pages get a
  // localized <title>/<meta description> server-side (not just a client swap).
  const seo = await fetchPageSeo(pageKey, opts.locale);
  const title = seo?.metaTitle ?? opts.fallbackTitle;
  const description = seo?.metaDescription ?? opts.fallbackDescription;
  const image = opts.ogImage ?? OG_IMAGE;
  const absoluteUrl = `${SITE_URL}${opts.canonical}`;

  // og:locale (current) + og:locale:alternate (the others) so social shares
  // render in the right language. Falls back to en_US for an unknown locale.
  const ogLocale = OG_LOCALE[opts.locale ?? 'en'] ?? 'en_US';
  const ogAlternateLocales = Object.entries(OG_LOCALE)
    .filter(([code]) => code !== (opts.locale ?? 'en'))
    .map(([, og]) => og);

  // Build hreflang alternates when a base path is supplied. Normalise the root
  // path so home alternates are ".../en" (no trailing slash) to match the
  // canonical — mismatched hreflang/canonical URLs weaken the signal.
  let languages: Record<string, string> | undefined;
  if (opts.path) {
    const p = opts.path === '/' ? '' : opts.path;
    languages = { 'x-default': `${SITE_URL}/en${p}` };
    LOCALES.forEach((loc) => {
      languages![loc] = `${SITE_URL}/${loc}${p}`;
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
      locale: ogLocale,
      alternateLocale: ogAlternateLocales,
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
