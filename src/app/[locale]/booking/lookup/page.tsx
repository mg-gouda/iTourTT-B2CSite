import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { TrackBookingClient } from '@/app/booking/lookup/track-client';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata('booking-lookup', {
    canonical: `/${locale}/booking/lookup`,
    path: '/booking/lookup',
    locale,
    fallbackTitle: 'Track Your Booking | Egypt Airport Transfers | Transfera',
    fallbackDescription:
      'Look up your Transfera Egypt transfer booking. View your confirmation, driver details, pickup time and vehicle information.',
  });
}

export default async function LocaleTrackPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return <TrackBookingClient settings={settings} />;
}
