// /ai-services.json — compact, machine-readable company + services summary
// for AI agents that prefer JSON over the markdown /llms.txt.

import { SITE_URL, BRAND_NAME } from '@/lib/seo';
import {
  AI_SERVICES,
  aiDestinations,
  aiRoutes,
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
    // fall back to constants
  }

  const payload = {
    company: BRAND_NAME,
    description:
      'Private airport-transfer and ground-transportation service operating across Egypt. Fixed-price, pre-booked private transfers between airports and hotels, resorts and city destinations, with flight tracking, meet-and-greet and 24/7 support.',
    url: `${SITE_URL}/en`,
    languages: ['en', 'ar', 'de', 'fr', 'it', 'nl', 'ru'],
    services: AI_SERVICES,
    destinations: aiDestinations(),
    routes: aiRoutes(),
    contact: aiContact({ telephone: phone, email }),
    booking_url: `${SITE_URL}/en/book`,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
