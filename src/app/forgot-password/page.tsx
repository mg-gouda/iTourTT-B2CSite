import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { ForgotPasswordClient } from './forgot-password-client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('forgot-password', {
    canonical: '/forgot-password',
    fallbackTitle: 'Forgot Password | Transfera',
    fallbackDescription: 'Reset your Transfera account password.',
    noIndex: true,
  });
}

export default async function ForgotPasswordPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch { /* use defaults */ }
  return <ForgotPasswordClient settings={settings} />;
}
