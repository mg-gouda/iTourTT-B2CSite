'use client';

import { Check } from 'lucide-react';
import { resolveAssetUrl, type SiteSettings } from '@/lib/site-settings';
import { useWT, useLocale } from '@/lib/website-i18n';

interface HeroSectionProps {
  settings: SiteSettings;
  children?: React.ReactNode; // Slot for the booking widget (kept as-is, rendered below)
}

/**
 * Two-column hero (altayran.com-style): left = headline/subheadline/value-props,
 * right = a large travel image (admin-uploadable via Settings → heroImageUrl).
 * Light background, partial height. The booking widget renders below, unchanged.
 * In RTL locales the grid naturally mirrors (text on the right, image on the left).
 */
export function HeroSection({ settings, children }: HeroSectionProps) {
  const t = useWT();
  const locale = useLocale();
  const heroTitle = locale === 'en' ? settings.heroTitle : t('site.heroTitle');
  const heroSubtitle = locale === 'en' ? settings.heroSubtitle : t('site.heroSubtitle');
  const primary = settings.primaryColor || '#2563eb';
  const heroImg = resolveAssetUrl(settings.heroImageUrl);
  const hasImage = !!heroImg;

  const trustTicks = [
    t('features.noFeesTitle'),   // No Hidden Fees
    t('features.flightTitle'),   // Flight Monitoring
    t('features.supportTitle'),  // 24/7 Customer Support
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          {/* ── Text column ── */}
          <div className="max-w-xl text-center lg:text-start">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ borderColor: 'var(--border)', background: '#fff', color: 'var(--muted-foreground)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primary }} />
              {t('landing.heroBadge')}
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.25rem]">
              {heroTitle}
            </h1>

            <p className="mt-5 text-base font-medium leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
              {heroSubtitle}
            </p>

            <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {trustTicks.map((tick) => (
                <li key={tick} className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
                  <Check className="h-4 w-4 shrink-0" style={{ color: primary }} />
                  {tick}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Image column ── */}
          <div className="relative">
            {/* soft accent glow behind the image */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] opacity-20 blur-2xl"
              style={{ background: `radial-gradient(60% 60% at 70% 30%, ${primary}, transparent)` }}
            />
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImg!}
                alt=""
                fetchPriority="high"
                loading="eager"
                width={1200}
                height={900}
                className="aspect-[4/3] w-full rounded-3xl object-cover shadow-xl ring-1 ring-black/5"
              />
            ) : (
              <div
                className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl text-white/90 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}
              >
                <span className="px-6 text-center text-sm font-medium opacity-80">
                  Upload a hero image in the admin (Settings → Hero image)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Booking widget (unchanged), below the hero ── */}
        {children && (
          <div className="mx-auto mt-10 w-full max-w-5xl pb-4 sm:mt-12">{children}</div>
        )}
      </div>
    </section>
  );
}
