import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';
import { fetchCityMenu } from '@/lib/website-content';
import { buildPageMetadata } from '@/lib/page-metadata';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 300;

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata('destinations', {
    canonical: `/${locale}/destinations`,
    path: '/destinations',
    locale,
    fallbackTitle: 'Egypt Destinations | Airport Transfers | Transfera',
    fallbackDescription:
      'Explore all Egypt destinations served by Transfera. Private airport transfers in Hurghada, Cairo, Sharm El Sheikh, Luxor, Marsa Alam and more.',
  });
}

export default async function LocaleDestinationsPage({ params }: Props) {
  const { locale } = await params;
  const cities = (await fetchCityMenu()) ?? [];

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${SITE_URL}/${locale}/destinations` },
    ],
  };

  return (
    <div className="bg-white">
      <JsonLd data={breadcrumb} />
      <section className="border-b border-gray-100 bg-gray-50/60 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Egypt Airport Transfer Destinations
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-500 sm:text-lg">
            Private transfers to and from every major Egyptian airport. Fixed price, flight tracking, free cancellation.
          </p>
        </div>
      </section>
      <section className="px-4 py-14">
        <div className="mx-auto max-w-5xl">
          {cities.length === 0 ? (
            <p className="py-16 text-center text-gray-500">Destinations coming soon.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${locale}/transfers/${city.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 shrink-0 text-emerald-500" />
                    <span className="font-semibold text-gray-900 group-hover:text-emerald-700">{city.name}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
