import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { LoginClient } from './login-client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('login', {
    canonical: '/login',
    fallbackTitle: 'Login | Transfera Egypt Airport Transfers',
    fallbackDescription: 'Sign in to your Transfera account to manage bookings and access your transfer history.',
    noIndex: true,
  });
}

export default async function B2CLoginPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch { /* use defaults */ }
  return <LoginClient settings={settings} />;
}
