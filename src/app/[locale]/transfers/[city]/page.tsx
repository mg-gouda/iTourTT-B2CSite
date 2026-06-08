import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema, faqSchema, SITE_URL } from '@/lib/seo';
import type { FaqItem } from '@/lib/seo';
import { DESTINATIONS, getDestination } from '@/lib/destinations';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS, resolveAssetUrl } from '@/lib/site-settings';
import { fetchCityPage } from '@/lib/website-content';
import { buildPageMetadata } from '@/lib/page-metadata';
import { DestinationClient } from '@/app/transfers/[city]/destination-client';

interface Props {
  params: Promise<{ locale: string; city: string }>;
}

// Pre-render English × known cities; all other locale/city combos are ISR.
export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ locale: 'en', city: d.slug }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, city } = await params;
  const [cms, dest] = await Promise.all([fetchCityPage(city, locale), Promise.resolve(getDestination(city))]);
  if (!cms && !dest) return {};

  const name = cms?.city?.name ?? dest?.city ?? city;
  const title = cms?.metaTitle ?? dest?.title ?? `${name} Airport Transfers | Transfera`;
  const description =
    cms?.metaDescription ??
    dest?.metaDescription ??
    cms?.introText ??
    `Private airport transfers in ${name}. Fixed price, flight tracking, free cancellation, 24/7 support.`;
  const slug = cms?.slug ?? dest?.slug ?? city;
  const heroImage = resolveAssetUrl(cms?.heroImageUrl);

  return buildPageMetadata(`transfers-${city}`, {
    canonical: `/${locale}/transfers/${slug}`,
    path: `/transfers/${slug}`,
    locale,
    fallbackTitle: title,
    fallbackDescription: description,
    ogImage: heroImage,
  });
}

function breadcrumbSchema(locale: string, name: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${SITE_URL}/${locale}/destinations` },
      { '@type': 'ListItem', position: 3, name: `${name} Airport Transfers`, item: `${SITE_URL}/${locale}/transfers/${slug}` },
    ],
  };
}

export default async function LocaleDestinationPage({ params }: Props) {
  const { locale, city } = await params;
  const [cms, dest] = await Promise.all([fetchCityPage(city, locale), Promise.resolve(getDestination(city))]);
  if (!cms && !dest) notFound();

  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}

  const name = cms?.city?.name ?? dest?.city ?? city;
  const slug = cms?.slug ?? dest?.slug ?? city;

  const cmsFaqs = cms?.faqJson?.filter((f) => f.question && f.answer) ?? [];
  const faqItems: FaqItem[] = cmsFaqs.map((f) => ({ question: f.question!, answer: f.answer! }));

  return (
    <>
      <JsonLd data={serviceSchema({ name: `${name} Airport Transfer Service`, areaServed: name })} />
      <JsonLd data={breadcrumbSchema(locale, name, slug)} />
      {faqItems.length > 0 && <JsonLd data={faqSchema(faqItems)} />}
      <DestinationClient dest={dest ?? null} cms={cms} settings={settings} />
    </>
  );
}
