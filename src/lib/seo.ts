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

// Social-share preview image. Asset must live at /public/og-image.jpg
// (1200×630). Resolved against SITE_URL via metadataBase.
export const OG_IMAGE = '/og-image.jpg';

// ── Airport coverage (homepage list + FAQ + landing pages) ──
export interface Airport {
  name: string;
  iata: string;
}

export const AIRPORTS: Airport[] = [
  { name: 'Hurghada International Airport', iata: 'HRG' },
  { name: 'Cairo International Airport', iata: 'CAI' },
  { name: 'Sharm El Sheikh International Airport', iata: 'SSH' },
  { name: 'Luxor International Airport', iata: 'LXR' },
  { name: 'Aswan International Airport', iata: 'ASW' },
  { name: 'Marsa Alam International Airport', iata: 'RMF' },
  { name: 'Alexandria Borg El Arab Airport', iata: 'HBE' },
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

export function localBusinessSchema(opts: {
  name?: string;
  telephone?: string | null;
  email?: string | null;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'TravelAgency'],
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '10000',
      bestRating: '5',
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
