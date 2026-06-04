import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema, SITE_URL } from '@/lib/seo';
import { DESTINATIONS, getDestination } from '@/lib/destinations';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
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
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: 'website', url: `${SITE_URL}${canonical}`, title, description },
    twitter: { card: 'summary_large_image', title, description },
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

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `${name} Airport Transfer Service`,
          areaServed: name,
        })}
      />
      <DestinationClient dest={dest ?? null} cms={cms} settings={settings} />
    </>
  );
}
