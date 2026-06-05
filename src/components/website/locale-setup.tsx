'use client';

import { useEffect } from 'react';
import { useLocaleStore } from '@/lib/website-i18n';
import type { Locale } from '@/lib/i18n-config';

interface Props {
  locale: Locale;
}

// Runs on the client immediately after hydration.
// 1. Syncs the URL locale into the Zustand store (so useWT() returns correct translations).
// 2. Sets html[lang] and html[dir] so the browser renders RTL correctly for Arabic.
export function LocaleSetup({ locale }: Props) {
  const { setLocale } = useLocaleStore();

  useEffect(() => {
    setLocale(locale);
    const el = document.documentElement;
    el.lang = locale;
    el.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale, setLocale]);

  return null;
}
