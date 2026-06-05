import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { AccountClient } from './account-client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('account', {
    canonical: '/account',
    fallbackTitle: 'My Account | Transfera Egypt Airport Transfers',
    fallbackDescription:
      'Manage your Transfera account, view past bookings, and update your personal details.',
    noIndex: true,
  });
}

export default async function B2CAccountPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch { /* use defaults */ }
  return <AccountClient settings={settings} />;
}
