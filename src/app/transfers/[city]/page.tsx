import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema, SITE_URL } from '@/lib/seo';
import { DESTINATIONS, getDestination } from '@/lib/destinations';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';

interface Props {
  params: Promise<{ city: string }>;
}

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ city: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const dest = getDestination(city);
  if (!dest) return {};

  const canonical = `/transfers/${dest.slug}`;
  return {
    title: dest.title,
    description: dest.metaDescription,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${canonical}`,
      title: dest.title,
      description: dest.metaDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: dest.title,
      description: dest.metaDescription,
    },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { city } = await params;
  const dest = getDestination(city);
  if (!dest) notFound();

  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: `${dest.city} Airport Transfer Service`,
          areaServed: dest.city,
        })}
      />

      {/* ── Hero ── */}
      <section className="bg-white px-4 pt-14 pb-10 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {dest.airportName} · {dest.iata}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {dest.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-500 sm:text-lg">
            Fixed-price private transfers from {dest.airportName} ({dest.iata})
            to your hotel — flight tracking, free cancellation and 24/7 support.
          </p>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="gap-2 text-white font-semibold"
              style={{ backgroundColor: settings.primaryColor }}
            >
              <Link href="/book">
                Book Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Body copy ── */}
      <section className="bg-white px-4 pb-16">
        <div className="mx-auto max-w-3xl space-y-5">
          {dest.intro.map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-gray-600">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* ── Popular routes ── */}
      <section className="bg-gray-50/60 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Popular {dest.city} Transfer Routes
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dest.popularRoutes.map((route) => (
              <li
                key={route}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm"
              >
                <MapPin
                  className="h-4 w-4 shrink-0"
                  style={{ color: settings.primaryColor }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {route}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              'Fixed price — no hidden fees',
              'Free cancellation up to 24h',
              'Real-time flight tracking',
            ].map((perk) => (
              <div
                key={perk}
                className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0"
                  style={{ color: settings.primaryColor }}
                />
                <span className="text-sm font-medium text-gray-700">{perk}</span>
              </div>
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
            Book your {dest.city} airport transfer
          </h2>
          <p className="mt-3 text-lg text-white/80">
            Instant price, secure booking, and a driver waiting when you land.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 gap-2 bg-white px-10 text-base font-semibold hover:bg-gray-100"
            style={{ color: settings.primaryColor }}
          >
            <Link href="/book">
              Get an Instant Quote
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
