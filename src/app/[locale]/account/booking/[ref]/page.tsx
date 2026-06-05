import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { BookingDetailClient } from '@/app/account/booking/[ref]/booking-detail-client';

interface Props { params: Promise<{ locale: string; ref: string }> }

export default async function LocaleBookingDetailPage({ params }: Props) {
  const { ref } = await params;
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return <BookingDetailClient settings={settings} bookingRef={ref} />;
}
