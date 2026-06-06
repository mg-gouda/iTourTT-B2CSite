'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SiteSettings } from '@/lib/site-settings';
import { resolveAssetUrl } from '@/lib/site-settings';
import type { Destination } from '@/lib/destinations';
import type { CityPage } from '@/lib/website-content';
import { fetchCityPage } from '@/lib/website-content';
import { useWT, useLocalePath, useLocaleStore } from '@/lib/website-i18n';

interface DestinationClientProps {
  dest: Destination | null;
  cms: CityPage | null;
  settings: SiteSettings;
}

export function DestinationClient({ dest, cms, settings }: DestinationClientProps) {
  const t = useWT();
  const localePath = useLocalePath();
  const locale = useLocaleStore((s) => s.locale);

  const [override, setOverride] = useState<{ locale: string; cms: CityPage } | null>(null);

  const slug = cms?.slug ?? dest?.slug ?? '';

  useEffect(() => {
    if (locale === 'en' || !slug) return;
    let active = true;
    fetchCityPage(slug, locale).then((res) => {
      if (active && res) setOverride({ locale, cms: res });
    });
    return () => { active = false; };
  }, [locale, slug]);

  const activeCms = override && override.locale === locale ? override.cms : cms;

  const fill = (key: string, vars: Record<string, string>) =>
    Object.entries(vars).reduce((s, [k, v]) => s.replace(`{${k}}`, v), t(key));

  const perks = [
    t('destination.fixedPrice'),
    t('destination.freeCancellation'),
    t('destination.flightTracking'),
  ];

  // ── Merge CMS content over the hardcoded fallback ──
  const name = activeCms?.city?.name ?? dest?.city ?? '';
  const h1 = activeCms?.heroHeadline || dest?.h1 || `${name} Airport Transfers`;
  const heroImage = resolveAssetUrl(activeCms?.heroImageUrl);
  const heroSubtitle = dest
    ? fill('destination.heroDesc', { airport: dest.airportName, iata: dest.iata })
    : `Private airport transfers in ${name}.`;
  const introParas = activeCms?.introText ? [activeCms.introText] : dest?.intro ?? [];
  const contentHtml = activeCms?.contentHtml?.trim() || '';
  const bodySections = activeCms?.bodyJson?.filter((s) => s.heading || s.body) ?? [];
  const faq = activeCms?.faqJson?.filter((f) => f.question || f.answer) ?? [];
  const popularRoutes = dest?.popularRoutes ?? [];

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-white px-4 pt-14 pb-10 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          {dest && (
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {dest.airportName} · {dest.iata}
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {h1}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
            {heroSubtitle}
          </p>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="gap-2 text-white font-semibold"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <Link href={localePath('/book')}>
                {t('booking.bookNow')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {heroImage && (
          <div className="mx-auto mt-10 max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={`${name} airport transfer`}
              className="h-64 w-full rounded-2xl object-cover sm:h-80"
            />
          </div>
        )}
      </section>

      {/* ── Body copy ── */}
      {(introParas.length > 0 || contentHtml || bodySections.length > 0) && (
        <section className="bg-white px-4 pb-16">
          <div className="mx-auto max-w-3xl space-y-5">
            {introParas.map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-gray-600">
                {para}
              </p>
            ))}
            {contentHtml && (
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            )}
            {bodySections.map((sec, i) => (
              <div key={i} className="space-y-2">
                {sec.heading && (
                  <h2 className="text-xl font-bold text-gray-900">{sec.heading}</h2>
                )}
                {sec.body && (
                  <p className="text-base leading-relaxed text-gray-600">{sec.body}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Popular routes (hardcoded destinations only) ── */}
      {popularRoutes.length > 0 && (
        <section className="bg-gray-50/60 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              {fill('destination.popularRoutes', { city: name })}
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {popularRoutes.map((route) => (
                <li
                  key={route}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
                >
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: settings.primaryColor }} />
                  <span className="text-sm font-medium text-gray-700">{route}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {perks.map((perk) => (
                <div
                  key={perk}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: settings.primaryColor }} />
                  <span className="text-sm font-medium text-gray-700">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ (CMS only) ── */}
      {faq.length > 0 && (
        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              {t('destination.faqTitle') || 'Frequently Asked Questions'}
            </h2>
            <div className="mt-10 space-y-4">
              {faq.map((item, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-5">
                  <h3 className="font-semibold text-gray-900">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section
        className="px-4 py-16 text-center sm:py-20"
        style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            {fill('destination.ctaTitle', { city: name })}
          </h2>
          <p className="mt-3 text-lg text-white/80">{t('destination.ctaDesc')}</p>
          <Button
            asChild
            size="lg"
            className="mt-8 gap-2 bg-white px-10 text-base font-semibold hover:bg-gray-100"
            style={{ color: settings.primaryColor }}
          >
            <Link href={localePath('/book')}>
              {t('booking.getQuote')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
