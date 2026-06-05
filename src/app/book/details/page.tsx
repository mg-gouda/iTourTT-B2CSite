import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { DetailsClient } from './details-client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('book-details', {
    canonical: '/book/details',
    fallbackTitle: 'Booking Details | Egypt Airport Transfers | Transfera',
    fallbackDescription:
      'Review and complete your Egypt airport transfer booking. Enter passenger details and confirm your private transfer.',
  });
}

export default async function DetailsPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch { /* use defaults */ }
  return <DetailsClient settings={settings} />;
}
