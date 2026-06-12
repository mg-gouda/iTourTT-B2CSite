// /service-catalog.json — machine-readable schema.org OfferCatalog of the
// full transfer product range, including per-route offerings with distance
// and duration. Valid JSON-LD so it can be consumed as structured data.

import { SITE_URL, BRAND_NAME } from '@/lib/seo';
import { AI_SERVICES, aiRoutes } from '@/lib/ai-catalog';

export const revalidate = 3600;

export async function GET() {
  const serviceOffers = AI_SERVICES.map((s) => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: s.name,
      serviceType: s.name,
      description: s.description,
    },
  }));

  const routeOffers = aiRoutes().map((r) => ({
    '@type': 'Offer',
    url: r.url,
    itemOffered: {
      '@type': 'Service',
      name: `${r.from} to ${r.to} Transfer`,
      serviceType: 'Airport transfer',
      areaServed: r.to,
    },
    // Custom but harmless properties — useful to AI agents reading the file.
    distanceKm: r.distanceKm,
    durationMin: r.durationMin,
  }));

  const catalog = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': `${SITE_URL}/service-catalog.json#catalog`,
    name: `${BRAND_NAME} Transfer Service Catalog`,
    provider: { '@type': 'TravelAgency', '@id': `${SITE_URL}/#organization`, name: BRAND_NAME },
    url: `${SITE_URL}/en/book`,
    itemListElement: [
      {
        '@type': 'OfferCatalog',
        name: 'Service types',
        itemListElement: serviceOffers,
      },
      {
        '@type': 'OfferCatalog',
        name: 'Routes',
        itemListElement: routeOffers,
      },
    ],
  };

  return new Response(JSON.stringify(catalog, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
