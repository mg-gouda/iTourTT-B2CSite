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
import type { SiteSettings } from '@/lib/site-settings';
import { useWT, useLocalePath } from '@/lib/website-i18n';
import { AIRPORTS } from '@/lib/seo';

interface LandingClientProps {
  settings: SiteSettings;
}

export function WebsiteLandingClient({ settings }: LandingClientProps) {
  const t = useWT();
  const localePath = useLocalePath();

  return (
    <>
      {/* ── Hero with Booking Widget ── */}
      <HeroSection settings={settings}>
        <BookingWidget settings={settings} />
      </HeroSection>

      {/* ── Features Section ── */}
      <FeaturesSection settings={settings} />

      {/* ── How It Works ── */}
      <section className="bg-white px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              {t('landing.howItWorks')}
            </h2>
            <p className="mt-3 text-gray-500">
              {t('landing.threeSteps')}
            </p>
          </div>

          <div className="relative mt-14 grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Connecting line – desktop only */}
            <div className="absolute left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] top-8 hidden border-t-2 border-dashed border-gray-200 md:block" />

            {[
              { Icon: Search,   step: '1', title: t('landing.step1Title'), desc: t('landing.step1Desc') },
              { Icon: CreditCard, step: '2', title: t('landing.step2Title'), desc: t('landing.step2Desc') },
              { Icon: Plane,    step: '3', title: t('landing.step3Title'), desc: t('landing.step3Desc') },
            ].map(({ Icon, step, title, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                <div
                  className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: settings.primaryColor,
                    boxShadow: `0 8px 24px ${settings.primaryColor}35`,
                  }}
                >
                  <Icon className="h-7 w-7" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold shadow-sm" style={{ color: settings.primaryColor }}>
                    {step}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust-stats and testimonials removed: the figures (10,000+ / 99% /
          4.9) and named testimonials were not backed by a verifiable source.
          Re-introduce as a real social-proof block once Google Business /
          Trustpilot reviews are wired in. The substantiated value props live
          in the "Why Book With Us" section below. */}

      {/* ── Why Book With Us ── */}
      <section className="bg-gray-50/60 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
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
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${settings.primaryColor}15` }}
                >
                  <CheckCircle2
                    className="h-4 w-4"
                    style={{ color: settings.primaryColor }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Airport Coverage ── */}
      <section className="bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {t('landing.airportCoverage')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              {t('landing.airportCoverageDesc')}
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {AIRPORTS.map((airport) => (
              <li
                key={airport.iata}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 shadow-sm"
              >
                <Plane
                  className="h-4 w-4 shrink-0"
                  style={{ color: settings.primaryColor }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {airport.slug ? (
                    <Link
                      href={localePath(`/transfers/${airport.slug}`)}
                      className="hover:underline"
                      style={{ color: 'inherit' }}
                    >
                      {airport.name}{' '}
                      <span className="text-gray-400">({airport.iata})</span>
                    </Link>
                  ) : (
                    <>
                      {airport.name}{' '}
                      <span className="text-gray-400">({airport.iata})</span>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50/60 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            {t('landing.faq')}
          </h2>
          <div className="mt-10 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            {([1,2,3,4,5] as const).map((n) => (
              <details key={n} className="group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-gray-900">
                  {t(`faq.q${n}`)}
                  <Plus className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {t(`faq.a${n}`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        className="px-4 py-16 text-center sm:py-20"
        style={{
          background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})`,
        }}
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {t('landing.readyToBook')}
          </h2>
          <p className="mt-3 text-lg text-white/80">
            {t('landing.instantQuote')}
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 gap-2 bg-white px-10 text-base font-semibold hover:bg-gray-100"
            style={{ color: settings.primaryColor }}
          >
            <Link href={localePath('/book')}>
              {t('booking.bookNow')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
