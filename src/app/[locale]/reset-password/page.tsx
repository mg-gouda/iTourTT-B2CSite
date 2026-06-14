import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { ResetPasswordClient } from '@/app/reset-password/reset-password-client';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata('reset-password', {
    canonical: `/${locale}/reset-password`,
    fallbackTitle: 'Reset Password | Transfera',
    fallbackDescription: 'Set a new password for your Transfera account.',
    noIndex: true,
  });
}

export default async function LocaleResetPasswordPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient settings={settings} />
    </Suspense>
  );
}
