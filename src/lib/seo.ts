// ─── SEO constants & shared structured-data content ──────────────
// Single source of truth for the public-facing SEO copy, canonical
// domain, FAQ entries and airport coverage. Imported by metadata,
// JSON-LD schemas and the visible homepage UI so the on-page content
// and structured data never drift apart.

// Canonical production domain. Used for sitemap, robots, canonical
// tags and Open Graph URLs. Override at build time if needed.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://transfera.ae';

// Brand fallbacks (used when the backend site-settings don't provide
// a value — production pulls these from the admin panel).
export const BRAND_NAME = 'Transfera';
export const BRAND_PHONE = '+201002805139';
export const BRAND_EMAIL = 'info@transfera.ae';

// Default per-page metadata. Backend metaTitle/metaDescription take
// priority; these are the static fallbacks (per product decision).
export const HOME_TITLE =
  'Egypt Airport Transfers | Hurghada, Cairo & Sharm | Transfera';
export const HOME_DESCRIPTION =
  'Book safe, private airport transfers across Egypt. Arrival & departure service in Hurghada, Cairo, Sharm El Sheikh & more. Fixed price, free cancellation, 24/7 support.';

export const OG_DESCRIPTION =
  'Book safe, private airport transfers across Egypt. Fixed price, free cancellation, 24/7 support.';

// Social-share preview image — generated dynamically at /opengraph-image
// via app/opengraph-image.tsx (Next.js ImageResponse, 1200×630).
export const OG_IMAGE = '/opengraph-image';

// ── Airport coverage (homepage list + FAQ + landing pages) ──
export interface Airport {
  name: string;
  iata: string;
  /** /transfers/[slug] destination page slug — undefined if no page exists yet. */
  slug?: string;
}

export const AIRPORTS: Airport[] = [
  { name: 'Hurghada International Airport', iata: 'HRG', slug: 'hurghada' },
  { name: 'Cairo International Airport', iata: 'CAI', slug: 'cairo' },
  { name: 'Sharm El Sheikh International Airport', iata: 'SSH', slug: 'sharm-el-sheikh' },
  { name: 'Luxor International Airport', iata: 'LXR', slug: 'luxor' },
  { name: 'Aswan International Airport', iata: 'ASW', slug: 'aswan' },
  { name: 'Marsa Alam International Airport', iata: 'RMF', slug: 'marsa-alam' },
  { name: 'Alexandria Borg El Arab Airport', iata: 'HBE', slug: 'alexandria' },
];

// ── FAQ (visible accordion + FAQPage JSON-LD) ──
export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I book an airport transfer in Egypt?',
    answer:
      'Enter your pickup airport, destination, date, and number of passengers on our homepage. You will receive an instant price. Book and pay securely online, or choose to pay on arrival.',
  },
  {
    question: 'What happens if my flight is delayed?',
    answer:
      "We track all flights in real time. If your flight is delayed, we automatically adjust your driver's pickup time at no extra charge.",
  },
  {
    question: 'Can I cancel my transfer?',
    answer:
      'Yes. Free cancellation is available up to 24 hours before your scheduled transfer.',
  },
  {
    question: 'Which airports in Egypt do you cover?',
    answer:
      'We cover all major Egyptian airports: Hurghada (HRG), Cairo (CAI), Sharm El Sheikh (SSH), Luxor (LXR), Aswan (ASW), Marsa Alam (RMF), and Alexandria (HBE).',
  },
  {
    question: 'Are there any hidden fees?',
    answer:
      'No. The price you see at booking is the price you pay. No surge pricing, no airport surcharges, no hidden extras.',
  },
];

// ── Structured-data builders ──

// Collect non-empty social-profile URLs into a schema.org `sameAs` array.
export function socialSameAs(opts: {
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
}): string[] {
  return [opts.facebook, opts.instagram, opts.twitter].filter(
    (u): u is string => Boolean(u && u.trim()),
  );
}

export function localBusinessSchema(opts: {
  name?: string;
  telephone?: string | null;
  email?: string | null;
  sameAs?: string[];
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'TravelAgency'],
    '@id': `${SITE_URL}/#organization`,
    ...(opts.sameAs && opts.sameAs.length ? { sameAs: opts.sameAs } : {}),
    name: opts.name || BRAND_NAME,
    description:
      'Professional private airport transfer services across Egypt.',
    url: SITE_URL,
    telephone: opts.telephone || BRAND_PHONE,
    email: opts.email || BRAND_EMAIL,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG',
      addressLocality: 'Hurghada',
      addressRegion: 'Red Sea',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 27.1809,
      longitude: 33.8116,
    },
    areaServed: [
      'Hurghada',
      'Cairo',
      'Sharm El Sheikh',
      'Luxor',
      'Aswan',
      'Marsa Alam',
      'Alexandria',
    ],
    openingHours: 'Mo-Su 00:00-24:00',
    priceRange: '$$',
    // NOTE: aggregateRating intentionally omitted. Google's review-snippet
    // policy requires ratings to be backed by verifiable, on-site reviews;
    // emitting an unverifiable 4.9/10000 risks a manual action. Re-add only
    // when wired to a real review source (e.g. Google Business / Trustpilot).
  };
}

// Canonical TravelAgency "organization" node for the homepage. Carries a
// stable @id (#organization) so search/AI crawlers reconcile it with the
// other org references, plus a ContactPoint for support discovery.
export function organizationSchema(opts?: {
  name?: string;
  telephone?: string | null;
  email?: string | null;
  sameAs?: string[];
}): Record<string, unknown> {
  const telephone = opts?.telephone || BRAND_PHONE;
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    name: opts?.name || BRAND_NAME,
    url: `${SITE_URL}/en`,
    logo: `${SITE_URL}/logo.svg`,
    description:
      'Private airport transfer service across Egypt — Hurghada, Cairo, Sharm El Sheikh, Luxor, Aswan, Marsa Alam and Alexandria.',
    telephone,
    email: opts?.email || 'support@transfera.ae',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone,
      contactType: 'customer support',
      availableLanguage: ['English', 'Russian'],
      hoursAvailable: 'Mo-Su 00:00-24:00',
    },
    areaServed: [
      'Hurghada',
      'Cairo',
      'Sharm El Sheikh',
      'Luxor',
      'Aswan',
      'Marsa Alam',
      'Alexandria',
    ],
    sameAs: opts?.sameAs ?? [],
  };
}

// Catalog of the transportation services we offer, modelled as a schema.org
// Service with an OfferCatalog. Gives LLMs / AI search a single, explicit
// node describing the full product range (airport, private, hotel & chauffeur
// transfers) linked back to the organization node.
export function transportationServiceSchema(): Record<string, unknown> {
  const offering = (name: string, description: string) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name, description, serviceType: name },
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/#transportation-service`,
    name: 'Egypt Airport Transfer & Private Transportation',
    serviceType: 'Airport transfer',
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'Egypt' },
    description:
      'Fixed-price private ground transportation across Egypt: airport pickups and drop-offs, point-to-point private transfers, hotel and resort transfers, and chauffeur-driven service with flight tracking and 24/7 support.',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Transfer services',
      itemListElement: [
        offering(
          'Airport Transfers',
          'Private meet-and-greet transfers between Egyptian airports (HRG, CAI, SSH, LXR, ASW, RMF, HBE) and your hotel, resort or address, with real-time flight tracking.',
        ),
        offering(
          'Private Transfers',
          'Door-to-door private vehicle hire for individuals, families and groups — no shared shuttles, fixed price per vehicle.',
        ),
        offering(
          'Hotel Transfers',
          'Transfers between hotels, resorts and city destinations across Egypt, including Red Sea and Sinai resort areas.',
        ),
        offering(
          'Chauffeur Service',
          'Professional English-speaking drivers for airport runs, day trips and inter-city journeys throughout Egypt.',
        ),
      ],
    },
  };
}

export function serviceSchema(opts?: {
  name?: string;
  areaServed?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts?.name || 'Egypt Airport Transfer Service',
    provider: { '@type': 'LocalBusiness', name: BRAND_NAME },
    serviceType: 'Airport Transfer',
    areaServed: opts?.areaServed || 'Egypt',
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceSpecification: {
        '@type': 'PriceSpecification',
        priceCurrency: 'USD',
      },
    },
  };
}

export function faqSchema(items: FaqItem[] = FAQ_ITEMS): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

// Article schema for blog posts. `url` must be the full canonical URL of the
// post. `modifiedAt` falls back to `publishedAt` when no separate edit date
// is available.
export function articleSchema(opts: {
  title: string;
  description?: string | null;
  image?: string | null;
  author?: string | null;
  url: string;
  publishedAt?: string | null;
  modifiedAt?: string | null;
  type?: string | null;
}): Record<string, unknown> {
  const published = opts.publishedAt ?? undefined;
  const t = opts.type && opts.type !== 'none' ? opts.type : 'Article';
  return {
    '@context': 'https://schema.org',
    '@type': ['Article', 'BlogPosting', 'NewsArticle'].includes(t) ? t : 'Article',
    headline: opts.title,
    description: opts.description ?? undefined,
    image: opts.image ? [opts.image] : undefined,
    datePublished: published,
    dateModified: opts.modifiedAt ?? published,
    author: opts.author
      ? { '@type': 'Person', name: opts.author }
      : { '@type': 'Organization', name: BRAND_NAME, url: `${SITE_URL}/en` },
    publisher: {
      '@type': 'Organization',
      name: BRAND_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
  };
}
