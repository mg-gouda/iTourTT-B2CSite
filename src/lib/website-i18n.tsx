"use client";

import { create } from "zustand";
import { createContext, useCallback, useContext } from "react";
// Dictionary lives in a non-client module so Server Components can use
// translate() too; useWT() below is the client/hook wrapper over it.
import { translations } from "./website-translations";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Locale = "en" | "ar" | "de" | "fr" | "it" | "nl" | "ru";

export interface Language {
  code: Locale;
  label: string;
  dir: "ltr" | "rtl";
}

/* ------------------------------------------------------------------ */
/*  LANGUAGES array                                                    */
/* ------------------------------------------------------------------ */

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "it", label: "Italiano", dir: "ltr" },
  { code: "nl", label: "Nederlands", dir: "ltr" },
  { code: "ru", label: "Русский", dir: "ltr" },
];

/* ------------------------------------------------------------------ */
/*  Zustand store                                                      */
/* ------------------------------------------------------------------ */

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// No persistence — the URL segment is the source of truth.
// LocaleSetup (in app/[locale]/layout.tsx) initialises this from the URL on
// every page load, overriding any previous in-memory value.
export const useLocaleStore = create<LocaleStore>()((set) => ({
  locale: "en",
  setLocale: (locale: Locale) => set({ locale }),
}));

/* ------------------------------------------------------------------ */
/*  Locale context (SSR-correct source of truth)                       */
/* ------------------------------------------------------------------ */

// The zustand store defaults to "en" and is only corrected client-side by
// LocaleSetup (after hydration), so during SSR every translation rendered
// "en". This context is seeded server-side from the URL locale in
// app/[locale]/layout.tsx, so useWT()/useLocale() return the right language
// on the server too — giving crawlers fully localized hero/body copy.
const LocaleContext = createContext<Locale | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

// Active locale: prefer the server-seeded context, fall back to the store
// (and ultimately "en") for any usage rendered outside the provider.
export function useLocale(): Locale {
  const ctx = useContext(LocaleContext);
  const store = useLocaleStore((s) => s.locale);
  return ctx ?? store;
}

/* ------------------------------------------------------------------ */
/*  useWT hook                                                         */
/* ------------------------------------------------------------------ */

export function useWT(): (key: string) => string {
  const locale = useLocale();

  return useCallback(
    (key: string): string => {
      const dict = translations[locale];
      if (dict && key in dict) return dict[key];

      // Fallback to English
      const en = translations.en;
      if (en && key in en) return en[key];

      // Fallback to key itself
      return key;
    },
    [locale]
  );
}

// Note: the hook-free translate() lives in './website-translations' — import
// it from there in Server Components (this is a "use client" module, so its
// exports become client references and can't be called on the server).

/* ------------------------------------------------------------------ */
/*  Locale-aware path helper                                           */
/* ------------------------------------------------------------------ */

// Returns a function that prepends the current locale to any internal path.
// e.g. useLocalePath()('/book') → '/en/book'
// Use in client components instead of hard-coded href values.
export function useLocalePath(): (path: string) => string {
  const locale = useLocale();
  return (path: string) => {
    if (!path.startsWith('/')) return path; // External URL — leave as-is.
    return `/${locale}${path}`;
  };
}
