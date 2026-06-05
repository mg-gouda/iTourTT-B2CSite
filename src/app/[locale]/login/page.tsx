import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { LoginClient } from '@/app/login/login-client';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata('login', {
    canonical: `/${locale}/login`,
    fallbackTitle: 'Login | Transfera Egypt Airport Transfers',
    fallbackDescription: 'Sign in to your Transfera account to manage bookings and access your transfer history.',
    noIndex: true,
  });
}

export default async function LocaleLoginPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return <LoginClient settings={settings} />;
}
