// Loader for the unique, per-route landing-page copy. English is authored by
// hand in route-content.en.json; the other locales are produced from it by
// scripts/translate-route-content.mjs into route-content.generated.json. This
// per-route content is what makes each /transfers/[city]/[route] page unique
// (instead of one template with the destination name swapped in), which is
// required for Google to index them individually rather than collapsing them
// as duplicates.
import enContent from './route-content.en.json';
import generated from './route-content.generated.json';

export interface RouteContent {
  body: string[]; // 2 destination-specific paragraphs
  faqQ: string; // destination-specific FAQ question
  faqA: string; // destination-specific FAQ answer
}

const EN = enContent as Record<string, RouteContent>;
const GEN = generated as Record<string, Record<string, RouteContent>>;

// Returns the unique copy for a route in the requested locale, falling back to
// English when a locale or route is missing. Undefined only if the route has
// no authored content at all (callers then keep the generic template copy).
export function getRouteContent(
  locale: string,
  citySlug: string,
  routeSlug: string,
): RouteContent | undefined {
  const key = `${citySlug}/${routeSlug}`;
  if (locale === 'en') return EN[key];
  return GEN[locale]?.[key] ?? EN[key];
}
