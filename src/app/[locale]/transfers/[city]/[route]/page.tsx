import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, MapPin, Clock, Route as RouteIcon, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema, faqSchema, SITE_URL } from '@/lib/seo';
import type { FaqItem } from '@/lib/seo';
import { getRoute, allRoutes, buildRouteCopy } from '@/lib/routes';
import { buildPageMetadata } from '@/lib/page-metadata';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';

interface Props {
  params: Promise<{ locale: string; city: string; route: string }>;
}

// Pre-render English × every known route; other locales are ISR on demand.
export function generateStaticParams() {
  return allRoutes().map(({ city, route }) => ({ locale: 'en', city, route }));
}
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, city, route } = await params;
  const resolved = getRoute(city, route);
  if (!resolved) return {};
  const copy = buildRouteCopy(locale, resolved.dest, resolved.route);

  return buildPageMetadata(`route-${city}-${route}`, {
    canonical: `/${locale}/transfers/${city}/${route}`,
    path: `/transfers/${city}/${route}`,
    locale,
    fallbackTitle: copy.title,
    fallbackDescription: copy.metaDescription,
  });
}

function breadcrumbSchema(locale: string, dest: { city: string; slug: string }, route: { to: string; slug: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: `${dest.city} Airport Transfers`, item: `${SITE_URL}/${locale}/transfers/${dest.slug}` },
      { '@type': 'ListItem', position: 3, name: route.to, item: `${SITE_URL}/${locale}/transfers/${dest.slug}/${route.slug}` },
    ],
  };
}

const ICONS = [RouteIcon, Clock, BadgeCheck];

export default async function RoutePage({ params }: Props) {
  const { locale, city, route } = await params;
  const resolved = getRoute(city, route);
  if (!resolved) notFound();
  const { dest, route: r } = resolved;
  const copy = buildRouteCopy(locale, dest, r);

  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}

  const bookHref = `/${locale}/book`;
  const faqItems: FaqItem[] = copy.faqs.map((f) => ({ question: f.question, answer: f.answer }));
  const otherRoutes = dest.routes.filter((x) => x.slug !== r.slug);

  return (
    <>
      <JsonLd data={serviceSchema({ name: `${dest.city} Airport to ${r.to} Transfer`, areaServed: r.to })} />
      <JsonLd data={breadcrumbSchema(locale, dest, r)} />
      <JsonLd data={faqSchema(faqItems)} />

      {/* ── Hero ── */}
      <section className="bg-white px-4 pt-14 pb-10 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: settings.primaryColor }} />
            {copy.kicker} · {dest.iata}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {copy.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
            {copy.subtitle}
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="gap-2 text-white font-semibold" style={{ backgroundColor: settings.primaryColor }}>
              <Link href={bookHref}>
                {copy.bookCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Info cards: distance · duration · pricing */}
        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {copy.info.map((item, i) => {
            const Icon = ICONS[i] ?? RouteIcon;
            return (
              <div key={item.label} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3.5 shadow-sm">
                <Icon className="h-5 w-5 shrink-0" style={{ color: settings.primaryColor }} />
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-400">{item.label}</div>
                  <div className="text-sm font-semibold text-gray-800">{item.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Body copy ── */}
      <section className="bg-white px-4 pb-16">
        <div className="mx-auto max-w-3xl space-y-5">
          {copy.intro.map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-gray-600">{para}</p>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-gray-50/60 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">{copy.faqTitle}</h2>
          <div className="mt-10 space-y-4">
            {copy.faqs.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other routes (internal links) ── */}
      {otherRoutes.length > 0 && (
        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">{copy.otherRoutesTitle}</h2>
            <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {otherRoutes.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/${locale}/transfers/${dest.slug}/${o.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3.5 shadow-sm transition-colors hover:bg-gray-100"
                  >
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: settings.primaryColor }} />
                    <span className="text-sm font-medium text-gray-700">{dest.city} → {o.to}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center">
              <Link href={`/${locale}/transfers/${dest.slug}`} className="text-sm font-semibold" style={{ color: settings.primaryColor }}>
                {dest.city} Airport Transfers →
              </Link>
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
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{copy.ctaTitle}</h2>
          <p className="mt-3 text-lg text-white/80">{copy.ctaDesc}</p>
          <Button
            asChild
            size="lg"
            className="mt-8 gap-2 bg-white px-10 text-base font-semibold hover:bg-gray-100"
            style={{ color: settings.primaryColor }}
          >
            <Link href={bookHref}>
              {copy.bookCta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
