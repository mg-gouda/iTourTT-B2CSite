import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { ForgotPasswordClient } from '@/app/forgot-password/forgot-password-client';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata('forgot-password', {
    canonical: `/${locale}/forgot-password`,
    fallbackTitle: 'Forgot Password | Transfera',
    fallbackDescription: 'Reset your Transfera account password.',
    noIndex: true,
  });
}

export default async function LocaleForgotPasswordPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return <ForgotPasswordClient settings={settings} />;
}
