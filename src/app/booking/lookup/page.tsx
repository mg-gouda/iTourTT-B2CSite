import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { TrackBookingClient } from './track-client';

export const metadata: Metadata = {
  title: 'Track Your Booking | Egypt Airport Transfers | Transfera',
  description:
    'Look up your Transfera Egypt transfer booking. View your confirmation, driver details, pickup time and vehicle information.',
  alternates: { canonical: '/booking/lookup' },
};

export default async function TrackBookingPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults on failure
  }

  return <TrackBookingClient settings={settings} />;
}
