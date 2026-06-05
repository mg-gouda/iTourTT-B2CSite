import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema, faqSchema, SITE_URL } from '@/lib/seo';
import type { FaqItem } from '@/lib/seo';
import { DESTINATIONS, getDestination } from '@/lib/destinations';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS, resolveAssetUrl } from '@/lib/site-settings';
import { fetchCityPage } from '@/lib/website-content';
import { DestinationClient } from './destination-client';

interface Props {
  params: Promise<{ city: string }>;
}

// Pre-render the known hardcoded destinations; CMS-only slugs render on demand.
export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ city: d.slug }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cms = await fetchCityPage(city);
  const dest = getDestination(city);
  if (!cms && !dest) return {};

  const name = cms?.city?.name ?? dest?.city ?? city;
  const title =
    cms?.metaTitle ?? dest?.title ?? `${name} Airport Transfers | Transfera`;
  const description =
    cms?.metaDescription ??
    dest?.metaDescription ??
    cms?.introText ??
    `Private airport transfers in ${name}. Fixed price, flight tracking, free cancellation, 24/7 support.`;
  const canonical = `/transfers/${cms?.slug ?? dest?.slug ?? city}`;
  const heroImage = resolveAssetUrl(cms?.heroImageUrl);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${canonical}`,
      siteName: 'Transfera',
      title,
      description,
      images: heroImage
        ? [{ url: heroImage, width: 1200, height: 630, alt: title }]
        : [{ url: '/og-image.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [heroImage ?? '/og-image.jpg'],
    },
  };
}

function breadcrumbSchema(name: string, slug: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${SITE_URL}/destinations` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${name} Airport Transfers`,
        item: `${SITE_URL}/transfers/${slug}`,
      },
    ],
  };
}

export default async function DestinationPage({ params }: Props) {
  const { city } = await params;
  const cms = await fetchCityPage(city);
  const dest = getDestination(city);
  if (!cms && !dest) notFound();

  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }

  const name = cms?.city?.name ?? dest?.city ?? city;
  const slug = cms?.slug ?? dest?.slug ?? city;

  // Build FAQ items for JSON-LD from CMS data (fall back to site-wide FAQ).
  const cmsFaqs = cms?.faqJson?.filter((f) => f.question && f.answer) ?? [];
  const faqItems: FaqItem[] =
    cmsFaqs.length > 0
      ? cmsFaqs.map((f) => ({ question: f.question!, answer: f.answer! }))
      : [];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `${name} Airport Transfer Service`,
          areaServed: name,
        })}
      />
      <JsonLd data={breadcrumbSchema(name, slug)} />
      {faqItems.length > 0 && <JsonLd data={faqSchema(faqItems)} />}
      <DestinationClient dest={dest ?? null} cms={cms} settings={settings} />
    </>
  );
}
