// ─── Shared data for AI-agent endpoints ──────────────────────────
// Single source of truth for /llms.txt, /ai-services.json and
// /service-catalog.json. Derives services, destinations and routes from
// the same data that drives the SEO landing pages so the machine-readable
// surfaces never drift from the human-facing site.

import { SITE_URL, AIRPORTS } from './seo';
import { DESTINATIONS } from './destinations';

export interface AiService {
  name: string;
  description: string;
}

export const AI_SERVICES: AiService[] = [
  {
    name: 'Airport Transfers',
    description:
      'Private meet-and-greet transfers between Egyptian airports (HRG, CAI, SSH, LXR, ASW, RMF, HBE) and your hotel, resort or address, with real-time flight tracking.',
  },
  {
    name: 'Private Transfers',
    description:
      'Door-to-door private vehicle hire for individuals, families and groups across Egypt — no shared shuttles, fixed price per vehicle.',
  },
  {
    name: 'Hotel Transfers',
    description:
      'Transfers between hotels, resorts and city destinations across Egypt, including Red Sea and Sinai resort areas such as El Gouna, Makadi Bay, Sahl Hasheesh, Soma Bay, Naama Bay and Nabq Bay.',
  },
  {
    name: 'Chauffeur Service',
    description:
      'Professional English-speaking drivers for airport runs, day trips and inter-city journeys throughout Egypt.',
  },
];

export interface AiDestination {
  name: string;
  iata: string;
  airport: string;
  url: string;
}

export function aiDestinations(): AiDestination[] {
  return DESTINATIONS.map((d) => ({
    name: d.city,
    iata: d.iata,
    airport: d.airportName,
    url: `${SITE_URL}/en/transfers/${d.slug}`,
  }));
}

export interface AiRoute {
  from: string;
  to: string;
  distanceKm: number;
  durationMin: number;
  url: string;
}

export function aiRoutes(): AiRoute[] {
  return DESTINATIONS.flatMap((d) =>
    d.routes.map((r) => ({
      from: `${d.city} Airport (${d.iata})`,
      to: r.to,
      distanceKm: r.distanceKm,
      durationMin: r.durationMin,
      url: `${SITE_URL}/en/transfers/${d.slug}/${r.slug}`,
    })),
  );
}

export interface AiContact {
  telephone: string;
  email: string;
  availableLanguage: string[];
  hoursAvailable: string;
}

export function aiContact(opts?: {
  telephone?: string | null;
  email?: string | null;
}): AiContact {
  return {
    telephone: opts?.telephone || '+201002805139',
    email: opts?.email || 'support@transfera.ae',
    availableLanguage: ['English', 'Russian'],
    hoursAvailable: 'Mo-Su 00:00-24:00',
  };
}

// Key entry-point URLs surfaced to AI agents.
export function aiKeyPages() {
  return {
    home: `${SITE_URL}/en`,
    book: `${SITE_URL}/en/book`,
    destinations: `${SITE_URL}/en/destinations`,
    blog: `${SITE_URL}/en/blog`,
    trackBooking: `${SITE_URL}/en/booking/lookup`,
  };
}

// Airports list reused by llms.txt (name, IATA, landing-page URL).
export function aiAirports() {
  return AIRPORTS.map((a) => ({
    name: a.name,
    iata: a.iata,
    url: a.slug ? `${SITE_URL}/en/transfers/${a.slug}` : undefined,
  }));
}
