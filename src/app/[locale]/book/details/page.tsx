import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { DetailsClient } from '@/app/book/details/details-client';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata('book-details', {
    canonical: `/${locale}/book/details`,
    path: '/book/details',
    locale,
    fallbackTitle: 'Booking Details | Egypt Airport Transfers | Transfera',
    fallbackDescription:
      'Review and complete your Egypt airport transfer booking. Enter passenger details and confirm your private transfer.',
  });
}

export default async function LocaleDetailsPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return <DetailsClient settings={settings} />;
}
