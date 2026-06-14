import type { Metadata } from 'next';
import { Suspense } from 'react';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { buildPageMetadata } from '@/lib/page-metadata';
import { ResetPasswordClient } from './reset-password-client';

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('reset-password', {
    canonical: '/reset-password',
    fallbackTitle: 'Reset Password | Transfera',
    fallbackDescription: 'Set a new password for your Transfera account.',
    noIndex: true,
  });
}

export default async function ResetPasswordPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch { /* use defaults */ }
  return (
    <Suspense fallback={null}>
      <ResetPasswordClient settings={settings} />
    </Suspense>
  );
}
