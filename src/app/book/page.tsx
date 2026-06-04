import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { BookNowClient } from './book-client';

export const metadata: Metadata = {
  title: 'Book Your Egypt Airport Transfer | Instant Price | Transfera',
  description:
    'Get an instant price & book your private Egypt airport transfer in 2 minutes. Fixed price, free cancellation, flight tracking, 24/7 support.',
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
