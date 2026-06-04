import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema, SITE_URL } from '@/lib/seo';
import { DESTINATIONS, getDestination } from '@/lib/destinations';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { DestinationClient } from './destination-client';

interface Props {
  params: Promise<{ city: string }>;
}

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ city: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const dest = getDestination(city);
  if (!dest) return {};

  const canonical = `/transfers/${dest.slug}`;
  return {
    title: dest.title,
    description: dest.metaDescription,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${canonical}`,
      title: dest.title,
      description: dest.metaDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: dest.title,
      description: dest.metaDescription,
    },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { city } = await params;
  const dest = getDestination(city);
  if (!dest) notFound();

  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `${dest.city} Airport Transfer Service`,
          areaServed: dest.city,
        })}
      />
      <DestinationClient dest={dest} settings={settings} />
    </>
  );
}
