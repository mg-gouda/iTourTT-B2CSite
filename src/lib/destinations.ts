// ─── Destination landing-page content ────────────────────────────
// Data for the /transfers/[city] SEO landing pages. Each entry drives
// the page metadata, H1, body copy, popular routes and Service schema.

// A single airport→destination route, used to generate the long-tail
// /transfers/[city]/[route] landing pages. distanceKm/durationMin drive the
// route-specific copy, info cards and FAQ so every page is genuinely unique.
export interface RouteInfo {
  slug: string; // destination part of the URL, e.g. 'el-gouna'
  to: string; // human label, e.g. 'El Gouna'
  distanceKm: number;
  durationMin: number;
}

export interface Destination {
  slug: string;
  city: string;
  iata: string;
  airportName: string;
  title: string; // <title>
  h1: string;
  metaDescription: string;
  // 2–3 paragraphs of body copy (200+ words total).
  intro: string[];
  routes: RouteInfo[];
}

export const DESTINATIONS: Destination[] = [
  {
    slug: 'hurghada',
    city: 'Hurghada',
    iata: 'HRG',
    airportName: 'Hurghada International Airport',
    title: 'Hurghada Airport Transfer | HRG Private Transfers | Transfera',
    h1: 'Hurghada Airport Transfers — HRG Private Transfer Service',
    metaDescription:
      'Private Hurghada Airport (HRG) transfers to El Gouna, Makadi Bay, Soma Bay & Sahl Hasheesh. Fixed price, flight tracking, free cancellation.',
    intro: [
      'Book a private airport transfer from Hurghada International Airport (HRG) to your hotel or resort with Transfera. Our professional, English-speaking drivers meet you in the arrivals hall, help with your luggage and take you directly to your destination — no shared shuttles, no waiting, no haggling over the fare.',
      'Hurghada is the gateway to the Red Sea Riviera, and we cover every popular resort area: El Gouna, Makadi Bay, Soma Bay, Sahl Hasheesh and the Hurghada city hotels. We track your flight in real time, so if you land early or late your driver is always there waiting at no extra charge.',
      'Every transfer is a fixed price confirmed at the time of booking — what you see is what you pay, with no hidden surcharges and free cancellation up to 24 hours before pickup. Modern, air-conditioned vehicles, child seats on request, and 24/7 customer support make Transfera the reliable choice for your Hurghada arrival and departure.',
    ],
    routes: [
      { slug: 'el-gouna', to: 'El Gouna', distanceKm: 35, durationMin: 30 },
      { slug: 'makadi-bay', to: 'Makadi Bay', distanceKm: 35, durationMin: 30 },
      { slug: 'soma-bay', to: 'Soma Bay', distanceKm: 60, durationMin: 45 },
      { slug: 'sahl-hasheesh', to: 'Sahl Hasheesh', distanceKm: 25, durationMin: 25 },
      { slug: 'safaga', to: 'Safaga', distanceKm: 55, durationMin: 50 },
      { slug: 'hurghada-city', to: 'Hurghada City & Marina', distanceKm: 15, durationMin: 20 },
    ],
  },
  {
    slug: 'cairo',
    city: 'Cairo',
    iata: 'CAI',
    airportName: 'Cairo International Airport',
    title: 'Cairo Airport Transfer | CAI Private Transfers | Transfera',
    h1: 'Cairo Airport Transfers — CAI Private Transfer Service',
    metaDescription:
      'Private Cairo Airport (CAI) transfers to Downtown, Giza Pyramids, Zamalek & New Cairo. Fixed price, flight tracking, free cancellation, 24/7.',
    intro: [
      'Arrive in the Egyptian capital stress-free with a private transfer from Cairo International Airport (CAI). Your Transfera driver greets you on arrival, assists with luggage and drives you directly to your hotel or apartment in a comfortable, air-conditioned vehicle.',
      'We serve every part of Greater Cairo: Downtown Cairo, Zamalek, Garden City, Heliopolis, Nasr City, New Cairo, and the Giza and Pyramids area. Whether you are in town for business, a Nile cruise connection, or to see the Pyramids of Giza and the Grand Egyptian Museum, we get you there on time.',
      'Cairo traffic is unpredictable — that is exactly why a fixed-price private transfer makes sense. Your fare is locked in at booking with no meter and no surge pricing, we monitor your flight for delays, and free cancellation is available up to 24 hours before pickup. Friendly 24/7 support is on hand for any change of plan.',
    ],
    routes: [
      { slug: 'downtown-cairo', to: 'Downtown Cairo', distanceKm: 25, durationMin: 45 },
      { slug: 'giza-pyramids', to: 'Giza & the Pyramids', distanceKm: 40, durationMin: 60 },
      { slug: 'zamalek', to: 'Zamalek', distanceKm: 22, durationMin: 40 },
      { slug: 'new-cairo', to: 'New Cairo', distanceKm: 25, durationMin: 35 },
      { slug: 'heliopolis', to: 'Heliopolis', distanceKm: 12, durationMin: 25 },
    ],
  },
  {
    slug: 'sharm-el-sheikh',
    city: 'Sharm El Sheikh',
    iata: 'SSH',
    airportName: 'Sharm El Sheikh International Airport',
    title: 'Sharm El Sheikh Airport Transfer | SSH Transfers | Transfera',
    h1: 'Sharm El Sheikh Airport Transfers — SSH Private Transfers',
    metaDescription:
      'Private Sharm El Sheikh Airport (SSH) transfers to Naama Bay, Nabq Bay, Sharks Bay & Ras Um Sid. Fixed price, flight tracking, free cancellation.',
    intro: [
      'Start your Red Sea holiday the easy way with a private transfer from Sharm El Sheikh International Airport (SSH). A professional Transfera driver meets you at arrivals, takes care of your bags and drives you straight to your resort — no shared minibuses and no waiting around.',
      'We cover all of Sharm El Sheikh and the surrounding bays: Naama Bay, Nabq Bay, Sharks Bay, Ras Um Sid, Hadaba and Sharm El Maya. From all-inclusive resorts to diving hotels, your driver knows the area and delivers you door to door.',
      'Each transfer is a fixed, all-in price agreed at booking with no hidden extras, and we track your flight so your driver is ready whenever you land. Free cancellation up to 24 hours before pickup, air-conditioned vehicles, child seats on request and round-the-clock support come as standard with Transfera.',
    ],
    routes: [
      { slug: 'naama-bay', to: 'Naama Bay', distanceKm: 15, durationMin: 20 },
      { slug: 'nabq-bay', to: 'Nabq Bay', distanceKm: 10, durationMin: 15 },
      { slug: 'sharks-bay', to: 'Sharks Bay', distanceKm: 8, durationMin: 12 },
      { slug: 'ras-um-sid', to: 'Ras Um Sid', distanceKm: 18, durationMin: 25 },
      { slug: 'hadaba', to: 'Hadaba', distanceKm: 20, durationMin: 28 },
    ],
  },
  {
    slug: 'luxor',
    city: 'Luxor',
    iata: 'LXR',
    airportName: 'Luxor International Airport',
    title: 'Luxor Airport Transfer | LXR Private Transfers | Transfera',
    h1: 'Luxor Airport Transfers — LXR Private Transfer Service',
    metaDescription:
      'Private Luxor Airport (LXR) transfers to East Bank, West Bank, Valley of the Kings & Nile cruise docks. Fixed price, free cancellation, 24/7.',
    intro: [
      "Explore the world's greatest open-air museum without the hassle of arranging transport on arrival. Transfera provides private transfers from Luxor International Airport (LXR) to your hotel, Nile cruise ship or guesthouse, with a friendly driver waiting for you in the arrivals hall.",
      'We serve both sides of the Nile — the East Bank with Luxor Temple and Karnak, and the West Bank with the Valley of the Kings, Hatshepsut Temple and the Colossi of Memnon — as well as the cruise docks for your Nile cruise departure. Your transfer is timed around your flight, which we track in real time.',
      'Prices are fixed at the moment you book, with no surprises on the day and free cancellation up to 24 hours in advance. Comfortable air-conditioned vehicles and 24/7 support make your Luxor arrival and departure smooth from start to finish.',
    ],
    routes: [
      { slug: 'east-bank', to: 'East Bank (Luxor & Karnak Temples)', distanceKm: 8, durationMin: 15 },
      { slug: 'west-bank', to: 'West Bank (Valley of the Kings)', distanceKm: 15, durationMin: 25 },
      { slug: 'nile-cruise-docks', to: 'Nile cruise docks', distanceKm: 7, durationMin: 15 },
      { slug: 'luxor-city', to: 'Luxor city centre', distanceKm: 6, durationMin: 12 },
    ],
  },
  {
    slug: 'marsa-alam',
    city: 'Marsa Alam',
    iata: 'RMF',
    airportName: 'Marsa Alam International Airport',
    title: 'Marsa Alam Airport Transfer | RMF Transfers | Transfera',
    h1: 'Marsa Alam Airport Transfers — RMF Private Transfers',
    metaDescription:
      'Private Marsa Alam Airport (RMF) transfers to Port Ghalib, Abu Dabbab, Coraya Bay & El Quseir. Fixed price, flight tracking, free cancellation.',
    intro: [
      'Reach your Red Sea resort in comfort with a private transfer from Marsa Alam International Airport (RMF). Your Transfera driver meets you at arrivals, loads your luggage and drives you directly to your hotel — ideal after a long flight to this remote stretch of coast.',
      'We cover the whole Marsa Alam region, including Port Ghalib, Abu Dabbab, Coraya Bay, Marsa Alam town and the beach resorts along the coast, and El Quseir to the north. Many resorts are a long drive from the airport, so a reliable private car with a fixed price is the comfortable, predictable way to travel.',
      'Your fare is confirmed at booking with no hidden extras, we track your flight so your driver is always there on time, and free cancellation is available up to 24 hours before pickup. Air-conditioned vehicles, child seats on request and 24/7 support are included with every Marsa Alam transfer.',
    ],
    routes: [
      { slug: 'port-ghalib', to: 'Port Ghalib', distanceKm: 7, durationMin: 10 },
      { slug: 'abu-dabbab', to: 'Abu Dabbab', distanceKm: 30, durationMin: 30 },
      { slug: 'coraya-bay', to: 'Coraya Bay', distanceKm: 12, durationMin: 15 },
      { slug: 'el-quseir', to: 'El Quseir', distanceKm: 80, durationMin: 70 },
    ],
  },
  {
    slug: 'aswan',
    city: 'Aswan',
    iata: 'ASW',
    airportName: 'Aswan International Airport',
    title: 'Aswan Airport Transfer | ASW Private Transfers | Transfera',
    h1: 'Aswan Airport Transfers — ASW Private Transfer Service',
    metaDescription:
      'Private Aswan Airport (ASW) transfers to city hotels, Nile cruise docks, Philae & Abu Simbel routes. Fixed price, flight tracking, free cancellation.',
    intro: [
      'Begin your Nile journey the relaxed way with a private transfer from Aswan International Airport (ASW). Your English-speaking Transfera driver meets you in the arrivals hall, helps with your luggage and drives you directly to your hotel or Nile cruise ship — no shared shuttles and no waiting in the heat.',
      'We cover all of Aswan: the Corniche and city-centre hotels, the Nile cruise docks for your Lake Nasser or Luxor-bound cruise, and the islands and west-bank resorts. We also handle the long road transfers many visitors need — including the route to Abu Simbel — and connections for Philae Temple and the High Dam.',
      'Every fare is fixed at the time of booking with no hidden extras, and we track your flight so your driver is ready whenever you land. Free cancellation up to 24 hours before pickup, air-conditioned vehicles, child seats on request and round-the-clock support come as standard with every Aswan transfer.',
    ],
    routes: [
      { slug: 'aswan-city', to: 'Corniche & city hotels', distanceKm: 25, durationMin: 35 },
      { slug: 'nile-cruise-docks', to: 'Nile cruise docks', distanceKm: 20, durationMin: 30 },
      { slug: 'philae-high-dam', to: 'Philae Temple & High Dam', distanceKm: 30, durationMin: 40 },
      { slug: 'abu-simbel', to: 'Abu Simbel', distanceKm: 280, durationMin: 210 },
    ],
  },
  {
    slug: 'alexandria',
    city: 'Alexandria',
    iata: 'HBE',
    airportName: 'Borg El Arab Airport',
    title: 'Alexandria Airport Transfer | HBE Private Transfers | Transfera',
    h1: 'Alexandria Airport Transfers — HBE Private Transfer Service',
    metaDescription:
      'Private Alexandria Borg El Arab Airport (HBE) transfers to the Corniche, downtown, North Coast & Marina. Fixed price, flight tracking, free cancellation.',
    intro: [
      'Arrive in the Mediterranean city stress-free with a private transfer from Alexandria Borg El Arab Airport (HBE). Your Transfera driver greets you at arrivals, takes care of your bags and drives you straight to your hotel in a comfortable, air-conditioned vehicle — Borg El Arab sits well outside the city, so a reliable private car makes all the difference.',
      'We serve the whole of Alexandria and the coast: the Corniche and downtown hotels, Stanley, Smouha, San Stefano and Montazah, as well as the North Coast (Sahel) resorts and Marina to the west. Whether you are here for business, a seaside break or a Mediterranean cruise connection, we get you there on time.',
      'Your price is locked in at booking with no meter and no surprises, we monitor your flight for delays, and free cancellation is available up to 24 hours before pickup. Air-conditioned vehicles, child seats on request and 24/7 support are included with every Alexandria transfer.',
    ],
    routes: [
      { slug: 'downtown-alexandria', to: 'Corniche & downtown', distanceKm: 45, durationMin: 50 },
      { slug: 'san-stefano-montazah', to: 'San Stefano & Montazah', distanceKm: 55, durationMin: 60 },
      { slug: 'north-coast', to: 'North Coast (Sahel) resorts', distanceKm: 80, durationMin: 70 },
      { slug: 'marina', to: 'Marina', distanceKm: 95, durationMin: 85 },
    ],
  },
];

export function getDestination(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

// Routes surfaced in the header "Routes" mega-menu. Defaults to the Hurghada
// (HRG) resort routes, the highest-demand transfers. Returns ready-to-render
// link data: locale-agnostic path + human label "City → Destination".
export const FEATURED_ROUTE_CITY = 'hurghada';

export interface FeaturedRoute {
  /** locale-agnostic path, e.g. /transfers/hurghada/el-gouna */
  path: string;
  /** human label, e.g. "Hurghada → El Gouna" */
  label: string;
  to: string;
  distanceKm: number;
  durationMin: number;
}

export function featuredRoutes(citySlug: string = FEATURED_ROUTE_CITY): FeaturedRoute[] {
  const dest = getDestination(citySlug);
  if (!dest) return [];
  return dest.routes.map((r) => ({
    path: `/transfers/${dest.slug}/${r.slug}`,
    label: `${dest.city} → ${r.to}`,
    to: r.to,
    distanceKm: r.distanceKm,
    durationMin: r.durationMin,
  }));
}
