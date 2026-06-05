import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { TrackBookingClient } from './track-client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('booking-lookup', {
    canonical: '/booking/lookup',
    fallbackTitle: 'Track Your Booking | Egypt Airport Transfers | Transfera',
    fallbackDescription:
      'Look up your Transfera Egypt transfer booking. View your confirmation, driver details, pickup time and vehicle information.',
  });
}

export default async function TrackBookingPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults on failure
  }

  return <TrackBookingClient settings={settings} />;
}
