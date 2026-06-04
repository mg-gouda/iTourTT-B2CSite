import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { TrackBookingClient } from './track-client';

export const metadata: Metadata = {
  title: 'Track Your Booking | Transfera Egypt Transfers',
  description:
    'Look up and manage your Transfera airport transfer booking. View confirmation, driver details, and pickup information.',
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
