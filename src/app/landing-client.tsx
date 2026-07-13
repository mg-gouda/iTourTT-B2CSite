'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Search,
  CreditCard,
  Plane,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSection } from '@/components/website/hero-section';
import { BookingWidget } from '@/components/website/booking-widget';
import { FeaturesSection } from '@/components/website/features-section';
import { TrustBar } from '@/components/website/trust-bar';
import { resolveAssetUrl, type SiteSettings } from '@/lib/site-settings';
import type { CityMenuItem } from '@/lib/website-content';
import { useWT, useLocalePath } from '@/lib/website-i18n';
import { AIRPORTS } from '@/lib/seo';

interface LandingClientProps {
  settings: SiteSettings;
  destinations?: CityMenuItem[];
}

export function WebsiteLandingClient({ settings, destinations = [] }: LandingClientProps) {
  const t = useWT();
  const localePath = useLocalePath();
  const primary = settings.primaryColor;

  // Map each airport's slug → the hero image set on its destination page (admin).
  const destImage = new Map(
    destinations
      .filter((d) => d.heroImageUrl)
      .map((d) => [d.slug, resolveAssetUrl(d.heroImageUrl)!]),
  );

  return (
    <>
      {/* ── Hero with Booking Widget ── */}
      <HeroSection settings={settings}>
        <BookingWidget settings={settings} />
      </HeroSection>

      {/* ── Trust value-props ── */}
      <TrustBar settings={settings} />

      {/* ── Features Section ── */}
      <FeaturesSection settings={settings} />

      {/* ── How It Works ── */}
      <section className="bg-[var(--muted)] px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
              {t('landing.howItWorks')}
            </h2>
            <p className="mt-3 text-[var(--muted-foreground)]">
              {t('landing.threeSteps')}
            </p>
          </div>

          <div className="relative mt-14 grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Connecting line – desktop only */}
            <div className="absolute left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] top-8 hidden border-t-2 border-dashed border-[var(--border)] md:block" />

            {[
              { Icon: Search,   step: '1', title: t('landing.step1Title'), desc: t('landing.step1Desc') },
              { Icon: CreditCard, step: '2', title: t('landing.step2Title'), desc: t('landing.step2Desc') },
              { Icon: Plane,    step: '3', title: t('landing.step3Title'), desc: t('landing.step3Desc') },
            ].map(({ Icon, step, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div
                  className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-white"
                  style={{
                    backgroundColor: primary,
                    boxShadow: `0 8px 24px ${primary}35`,
                  }}
                >
                  <Icon className="h-7 w-7" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold shadow-sm" style={{ color: primary }}>
                    {step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[var(--foreground)]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Book With Us ── */}
      <section className="bg-[var(--background)] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {settings.siteName} — {t('landing.theDifference')}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              t('landing.noHiddenFees'),
              t('landing.freeCancellation'),
              t('landing.flightTracking'),
              t('landing.proDrivers'),
              t('landing.modernVehicles'),
              t('landing.doorToDoor'),
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3.5"
                style={{ boxShadow: 'var(--elevation-1)' }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${primary}15` }}
                >
                  <CheckCircle2 className="h-4 w-4" style={{ color: primary }} />
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Airport Coverage — destination card grid ── */}
      <section className="bg-[var(--muted)] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {t('landing.airportCoverage')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--muted-foreground)]">
              {t('landing.airportCoverageDesc')}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AIRPORTS.map((airport) => {
              const img = airport.slug ? destImage.get(airport.slug) : undefined;
              const card = (
                <div
                  className={`group relative flex h-44 flex-col justify-end overflow-hidden rounded-2xl p-5 transition-transform duration-200 hover:-translate-y-1${img ? '' : ' placeholder-gradient'}`}
                  style={{ boxShadow: 'var(--elevation-2)' }}
                >
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-black/35 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    {airport.iata}
                  </span>
                  <div className="relative flex items-center justify-between">
                    <span className="text-lg font-semibold text-white">{airport.name}</span>
                    <ArrowRight className="h-5 w-5 text-white/90 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180" />
                  </div>
                </div>
              );
              return airport.slug ? (
                <Link key={airport.iata} href={localePath(`/transfers/${airport.slug}`)}>
                  {card}
                </Link>
              ) : (
                <div key={airport.iata}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[var(--background)] px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {t('landing.faq')}
          </h2>
          <div
            className="mt-10 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
            style={{ boxShadow: 'var(--elevation-1)' }}
          >
            {([1,2,3,4,5] as const).map((n) => (
              <details key={n} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-[var(--foreground)]">
                  {t(`faq.q${n}`)}
                  <Plus
                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-45"
                    style={{ color: primary }}
                  />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {t(`faq.a${n}`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA — editorial moment ── */}
      <section className="px-4 py-6">
        <div
          className="mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12 sm:py-20"
          style={{ background: `linear-gradient(135deg, ${primary}, ${settings.accentColor})` }}
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
              {t('landing.readyToBook')}
            </h2>
            <p className="mt-3 text-lg text-white/85">
              {t('landing.instantQuote')}
            </p>
            <Button
              asChild
              size="lg"
              className="mt-8 gap-2 bg-white px-10 text-base font-semibold hover:bg-white/90"
              style={{ color: primary }}
            >
              <Link href={localePath('/book')}>
                {t('booking.bookNow')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
