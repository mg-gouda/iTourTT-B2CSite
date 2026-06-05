import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { BookNowClient } from '@/app/book/book-client';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata('book', {
    canonical: `/${locale}/book`,
    path: '/book',
    locale,
    fallbackTitle: 'Book Your Egypt Airport Transfer | Instant Price | Transfera',
    fallbackDescription:
      'Get an instant price & book your private Egypt airport transfer in 2 minutes. Fixed price, free cancellation, flight tracking, 24/7 support.',
  });
}

export default async function LocaleBookPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return <BookNowClient settings={settings} />;
}
