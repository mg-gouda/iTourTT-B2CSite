import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { AccountClient } from '@/app/account/account-client';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata('account', {
    canonical: `/${locale}/account`,
    fallbackTitle: 'My Account | Transfera Egypt Airport Transfers',
    fallbackDescription: 'Manage your Transfera account, view past bookings, and update your personal details.',
    noIndex: true,
  });
}

export default async function LocaleAccountPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return <AccountClient settings={settings} />;
}
