import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { FlightClient } from '@/app/book/flight/flight-client';

export default async function LocaleFlightPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return <FlightClient settings={settings} />;
}
