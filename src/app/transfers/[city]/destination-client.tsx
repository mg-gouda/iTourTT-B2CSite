'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SiteSettings } from '@/lib/site-settings';
import { resolveAssetUrl } from '@/lib/site-settings';
import type { Destination } from '@/lib/destinations';
import type { CityPage } from '@/lib/website-content';
import { fetchCityPage } from '@/lib/website-content';
import { BookingWidget } from '@/components/website/booking-widget';
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
  const primary = settings.primaryColor;

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
  const routes = dest?.routes ?? [];

  return (
    <>
      {/* ── Hero — two-column: text left, image right ── */}
      <section className="bg-[var(--background)] px-4 pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          {/* Text panel */}
          <div className="order-2 text-center lg:order-1 lg:text-start">
            {dest && (
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: primary }} />
                {dest.airportName} · {dest.iata}
              </div>
            )}
            <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
              {h1}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg lg:mx-0">
              {heroSubtitle}
            </p>

            {/* Trust strip — substantiated value-props */}
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground)]">
                  <Check className="h-4 w-4 shrink-0" style={{ color: primary }} />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="gap-2 font-semibold text-white"
                style={{ backgroundColor: primary }}
              >
                <a href="#book-widget">
                  {t('booking.bookNow')}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </a>
              </Button>
            </div>
          </div>

          {/* Image panel */}
          <div className="order-1 lg:order-2">
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={heroImage}
                alt={`${name} airport transfer`}
                width={720}
                height={520}
                className="h-60 w-full rounded-2xl object-cover sm:h-80 lg:h-[26rem]"
                style={{ boxShadow: 'var(--elevation-3)' }}
              />
            ) : (
              <div
                className="placeholder-gradient flex h-60 w-full items-center justify-center rounded-2xl sm:h-80 lg:h-[26rem]"
                style={{ boxShadow: 'var(--elevation-3)' }}
              >
                <span className="text-2xl font-bold tracking-wide text-white/90">{dest?.iata ?? name}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Inline booking widget — high-intent visitors book here ── */}
      <section id="book-widget" className="scroll-mt-24 bg-[var(--muted)] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <BookingWidget settings={settings} />
        </div>
      </section>

      {/* ── Body copy ── */}
      {(introParas.length > 0 || contentHtml || bodySections.length > 0) && (
        <section className="bg-[var(--background)] px-4 py-16">
          <div className="mx-auto max-w-3xl space-y-5">
            {introParas.map((para, i) => (
              <p key={i} className="text-base leading-relaxed text-[var(--muted-foreground)]">
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
                  <h2 className="text-xl font-bold text-[var(--foreground)]">{sec.heading}</h2>
                )}
                {sec.body && (
                  <p className="text-base leading-relaxed text-[var(--muted-foreground)]">{sec.body}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Popular routes → compact chips linking to route landing pages ── */}
      {routes.length > 0 && (
        <section className="bg-[var(--muted)] px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {fill('destination.popularRoutes', { city: name })}
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {routes.map((route) => (
                <Link
                  key={route.slug}
                  href={localePath(`/transfers/${slug}/${route.slug}`)}
                  className="group inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-all duration-200 hover:-translate-y-0.5"
                  style={{ boxShadow: 'var(--elevation-1)' }}
                >
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" style={{ color: primary }} />
                  <span>{name} → {route.to}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ (CMS only) ── */}
      {faq.length > 0 && (
        <section className="bg-[var(--background)] px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
              {t('destination.faqTitle') || 'Frequently Asked Questions'}
            </h2>
            <div
              className="mt-10 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
              style={{ boxShadow: 'var(--elevation-1)' }}
            >
              {faq.map((item, i) => (
                <div key={i} className="px-6 py-5">
                  <h3 className="font-semibold text-[var(--foreground)]">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Final CTA — editorial moment ── */}
      <section className="px-4 py-6">
        <div
          className="mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12 sm:py-20"
          style={{ background: `linear-gradient(135deg, ${primary}, ${settings.accentColor})` }}
        >
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {fill('destination.ctaTitle', { city: name })}
            </h2>
            <p className="mt-3 text-lg text-white/85">{t('destination.ctaDesc')}</p>
            <Button
              asChild
              size="lg"
              className="mt-8 gap-2 bg-white px-10 text-base font-semibold hover:bg-white/90"
              style={{ color: primary }}
            >
              <Link href={localePath('/book')}>
                {t('booking.getQuote')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
