// /llms.txt — concise, LLM-friendly site map and company description.
// Follows the llmstxt.org convention: H1 name, blockquote summary, then
// curated sections of links. Generated from the same data as the SEO pages.

import { SITE_URL, BRAND_NAME } from '@/lib/seo';
import {
  AI_SERVICES,
  aiAirports,
  aiRoutes,
  aiKeyPages,
  aiContact,
} from '@/lib/ai-catalog';
import { fetchSiteSettings } from '@/lib/site-settings';

export const revalidate = 3600;

export async function GET() {
  let phone: string | null = null;
  let email: string | null = null;
  try {
    const s = await fetchSiteSettings();
    phone = s.contactPhone;
    email = s.contactEmail;
  } catch {
    // fall back to constants below
  }
  const contact = aiContact({ telephone: phone, email });
  const pages = aiKeyPages();

  const lines: string[] = [];
  lines.push(`# ${BRAND_NAME}`);
  lines.push('');
  lines.push(
    `> ${BRAND_NAME} is a private airport-transfer and ground-transportation service operating across Egypt. We provide fixed-price, pre-booked private transfers between Egyptian airports and hotels, resorts and city destinations, with real-time flight tracking, meet-and-greet arrival service, free cancellation up to 24 hours before pickup, and 24/7 support.`,
  );
  lines.push('');

  lines.push('## About');
  lines.push(`- Service: Private airport transfers and chauffeur-driven ground transportation in Egypt`);
  lines.push(
    `- Coverage: Hurghada, Cairo, Sharm El Sheikh, Luxor, Aswan, Marsa Alam, Alexandria and Red Sea / Sinai resort areas (El Gouna, Makadi Bay, Soma Bay, Sahl Hasheesh, Safaga, Naama Bay, Nabq Bay)`,
  );
  lines.push(`- Booking: Instant online quote; pay online or pay on arrival; free cancellation up to 24h before pickup`);
  lines.push(`- Pricing: Fixed price per vehicle shown at booking — no surge pricing, airport surcharges or hidden extras`);
  lines.push(`- Contact: ${contact.email} · ${contact.telephone} (24/7, English & Russian)`);
  lines.push('');

  lines.push('## Services');
  for (const s of AI_SERVICES) {
    lines.push(`- **${s.name}**: ${s.description}`);
  }
  lines.push('');

  lines.push('## Airports covered');
  for (const a of aiAirports()) {
    lines.push(`- ${a.name} (${a.iata})${a.url ? `: ${a.url}` : ''}`);
  }
  lines.push('');

  lines.push('## Popular routes');
  for (const r of aiRoutes()) {
    lines.push(
      `- ${r.from} → ${r.to} (~${r.distanceKm} km, ~${r.durationMin} min): ${r.url}`,
    );
  }
  lines.push('');

  lines.push('## Key pages');
  lines.push(`- Book a transfer: ${pages.book}`);
  lines.push(`- Destinations: ${pages.destinations}`);
  lines.push(`- Travel guides / blog: ${pages.blog}`);
  lines.push(`- Track a booking: ${pages.trackBooking}`);
  lines.push('');

  lines.push('## Machine-readable');
  lines.push(`- AI services summary: ${SITE_URL}/ai-services.json`);
  lines.push(`- Service catalog (schema.org): ${SITE_URL}/service-catalog.json`);
  lines.push(`- Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
