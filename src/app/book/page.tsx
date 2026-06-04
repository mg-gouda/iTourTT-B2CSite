import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { BookNowClient } from './book-client';

export const metadata: Metadata = {
  title: 'Book Airport Transfer Egypt | Instant Quote | Transfera',
  description:
    'Get an instant price and book your private Egypt airport transfer in under 2 minutes. Arrival and departure transfers from Hurghada, Cairo, Sharm El Sheikh and more.',
  alternates: { canonical: '/book' },
};

export default async function BookNowPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }

  return <BookNowClient settings={settings} />;
}
