import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Toaster } from 'sonner';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, BRAND_NAME, OG_IMAGE, localBusinessSchema } from '@/lib/seo';
import { isValidLocale, LOCALES, type Locale } from '@/lib/i18n-config';
import { LocaleSetup } from '@/components/website/locale-setup';
import { CookieConsentBanner } from '@/components/website/cookie-consent-banner';
import { WebsiteShell } from '../website-shell';

export const revalidate = 60;

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const settings = await fetchSiteSettings();
  const siteName = settings.siteName || BRAND_NAME;

  // Hreflang for the root route of each locale.
  const languages: Record<string, string> = { 'x-default': `${SITE_URL}/en` };
  LOCALES.forEach((loc) => { languages[loc] = `${SITE_URL}/${loc}`; });

  return {
    // No title template — every page's generateMetadata provides a complete
    // title already including the brand name. The layout default is used as
    // a last-resort fallback for routes that export no metadata of their own.
    title: { default: siteName, template: '%s' },
    description:
      settings.metaDescription ??
      'Book safe, private airport transfers across Egypt. Fixed price, free cancellation, 24/7 support.',
    icons: { icon: settings.siteFaviconUrl ?? '/favicon.svg' },
    alternates: { languages },
    openGraph: {
      type: 'website',
      siteName,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: siteName }],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Hard 404 for unrecognised locale segments (e.g. /xyz/book).
  if (!isValidLocale(locale)) notFound();

  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }

  return (
    <>
      {/* Syncs URL locale into Zustand + sets html[lang] and html[dir]. */}
      <LocaleSetup locale={locale as Locale} />

      {/* Site-wide structured data */}
      <JsonLd
        data={localBusinessSchema({
          name: settings.siteName,
          telephone: settings.contactPhone,
          email: settings.contactEmail,
        })}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: settings.siteName || BRAND_NAME,
          url: SITE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/en/book?q={search_term_string}` },
            'query-input': 'required name=search_term_string',
          },
        }}
      />

      <WebsiteShell settings={settings}>{children}</WebsiteShell>
      <Toaster position="top-center" richColors />
      <CookieConsentBanner />
    </>
  );
}
