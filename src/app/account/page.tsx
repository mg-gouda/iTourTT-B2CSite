import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { AccountClient } from './account-client';

export const metadata: Metadata = {
  title: 'My Account | Transfera Egypt Airport Transfers',
  description:
    'Manage your Transfera account, view past bookings, and update your personal details.',
  alternates: { canonical: '/account' },
  // Private user area — kept out of the index (also disallowed in robots).
  robots: { index: false, follow: false },
};

export default async function B2CAccountPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch { /* use defaults */ }
  return <AccountClient settings={settings} />;
}
