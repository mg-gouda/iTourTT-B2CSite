import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { AmendClient } from '@/app/account/booking/[ref]/amend/amend-client';

interface Props { params: Promise<{ locale: string; ref: string }> }

export default async function LocaleAmendPage({ params }: Props) {
  const { ref } = await params;
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return <AmendClient settings={settings} bookingRef={ref} />;
}
