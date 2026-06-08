'use client';

import type { SiteSettings } from '@/lib/site-settings';
import { useWT, useLocale } from '@/lib/website-i18n';

interface HeroSectionProps {
  settings: SiteSettings;
  children?: React.ReactNode; // Slot for the booking widget
}

export function HeroSection({ settings, children }: HeroSectionProps) {
  const t = useWT();
  const locale = useLocale();
  const heroTitle    = locale === 'en' ? settings.heroTitle    : t('site.heroTitle');
  const heroSubtitle = locale === 'en' ? settings.heroSubtitle : t('site.heroSubtitle');
  const hasImage = !!settings.heroImageUrl;

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Hero background image — rendered as <img> so the browser's preload
          scanner can discover it immediately and we can set fetchpriority=high.
          CSS background-image is invisible to the scanner and delays LCP. */}
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.heroImageUrl!}
          alt=""
          aria-hidden="true"
          // @ts-expect-error — fetchpriority is valid HTML; React 19 forwards it
          fetchpriority="high"
          loading="eager"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Content */}
      <div className="relative px-4 pb-16 pt-16 sm:pb-20 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t('landing.heroBadge')}
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base font-bold leading-relaxed text-black sm:text-lg">
            {heroSubtitle}
          </p>
        </div>

        {/* Booking Widget slot */}
        {children && (
          <div className="mx-auto mt-10 sm:mt-12 w-[85vw]">{children}</div>
        )}
      </div>

    </section>
  );
}
