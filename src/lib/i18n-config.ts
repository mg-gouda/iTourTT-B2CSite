export const LOCALES = ['en', 'ar', 'de', 'fr', 'it', 'nl', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export function isValidLocale(s: string): s is Locale {
  return (LOCALES as readonly string[]).includes(s);
}

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
  de: 'Deutsch',
  fr: 'Français',
  it: 'Italiano',
  nl: 'Nederlands',
  ru: 'Русский',
};
