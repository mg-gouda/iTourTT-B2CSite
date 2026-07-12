'use client';

import { Check } from 'lucide-react';
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

  // Short, substantiated value-props (no fabricated metrics). All keys are
  // already translated across the 7 locales.
  const trustTicks = [
    t('features.noFeesTitle'),   // No Hidden Fees
    t('features.flightTitle'),   // Flight Monitoring
    t('features.supportTitle'),  // 24/7 Customer Support
  ];

  // On an image hero the text sits on a dark overlay → white. On a plain hero
  // (no image) keep the warm-dark foreground for contrast on the off-white bg.
  const onImage = hasImage;
  const headingColor = onImage ? 'text-white' : 'text-[var(--foreground)]';
  const subColor = onImage ? 'text-white/85' : 'text-[var(--muted-foreground)]';

  return (
    <section className="relative overflow-hidden bg-[var(--background)]">
      {/* Hero background image — rendered as <img> so the browser's preload
          scanner can discover it immediately and we can set fetchpriority=high.
          CSS background-image is invisible to the scanner and delays LCP. */}
      {hasImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.heroImageUrl!}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            loading="eager"
            width={1920}
            height={1080}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Warm readability overlay — sibling div, never on the img itself. */}
          <div className="hero-overlay absolute inset-0" aria-hidden="true" />
        </>
      )}

      {/* Content */}
      <div className="relative px-4 pb-16 pt-16 sm:pb-20 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl text-center sm:text-start">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm backdrop-blur-sm"
              style={{
                borderColor: onImage ? 'rgba(255,255,255,0.35)' : 'var(--border)',
                background: onImage ? 'rgba(255,255,255,0.12)' : '#fff',
                color: onImage ? '#fff' : 'var(--muted-foreground)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: settings.primaryColor }}
              />
              {t('landing.heroBadge')}
            </div>
            <h1 className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${headingColor}`}>
              {heroTitle}
            </h1>
            <p className={`mt-4 max-w-2xl text-base font-medium leading-relaxed sm:text-lg ${subColor}`}>
              {heroSubtitle}
            </p>

            {/* Value-prop trust line — honest claims, not fabricated numbers. */}
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-start">
              {trustTicks.map((tick) => (
                <li
                  key={tick}
                  className={`flex items-center gap-1.5 text-sm font-semibold ${onImage ? 'text-white/90' : 'text-[var(--foreground)]'}`}
                >
                  <Check className="h-4 w-4 shrink-0" style={{ color: onImage ? '#fff' : settings.primaryColor }} />
                  {tick}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Booking Widget slot — floats below, slightly overlapping next section. */}
        {children && (
          <div className="mx-auto mt-10 w-full max-w-5xl sm:mt-12">{children}</div>
        )}
      </div>
    </section>
  );
}
