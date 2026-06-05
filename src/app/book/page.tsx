import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { BookNowClient } from './book-client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('book', {
    canonical: '/book',
    fallbackTitle: 'Book Your Egypt Airport Transfer | Instant Price | Transfera',
    fallbackDescription:
      'Get an instant price & book your private Egypt airport transfer in 2 minutes. Fixed price, free cancellation, flight tracking, 24/7 support.',
  });
}

export default async function BookNowPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }

  return <BookNowClient settings={settings} />;
}
