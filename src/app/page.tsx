import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema, faqSchema } from '@/lib/seo';
import { buildPageMetadata } from '@/lib/page-metadata';
import { WebsiteLandingClient } from './landing-client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('home', {
    canonical: '/',
    fallbackTitle: 'Egypt Airport Transfers | Hurghada, Cairo & Sharm | Transfera',
    fallbackDescription:
      'Book safe, private airport transfers across Egypt. Arrival & departure service in Hurghada, Cairo, Sharm El Sheikh & more. Fixed price, free cancellation, 24/7 support.',
  });
}

export default async function WebsiteLandingPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }

  return (
    <>
      <JsonLd data={serviceSchema()} />
      <JsonLd data={faqSchema()} />
      <WebsiteLandingClient settings={settings} />
    </>
  );
}
