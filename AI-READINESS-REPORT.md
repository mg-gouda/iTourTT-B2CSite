# Transfera — AI Readiness / GEO / AEO Report

Scope: technical changes to make https://transfera.ae understandable and
citable by LLMs and AI search engines (ChatGPT, Perplexity, Gemini, Claude,
Google AI Overviews) and future AI agents. **No visible UI, copy, styling or
functionality was changed** — every change is metadata, structured data or a
new machine-readable endpoint.

---

## What was already in place (verified, not rebuilt)

The codebase already had a strong technical-SEO/GEO foundation. These were
audited and confirmed working rather than reimplemented:

- **Structured data**: site-wide `LocalBusiness`+`TravelAgency` and `WebSite`
  (with `SearchAction`); `Service` + `BreadcrumbList` + `FAQPage` on every
  destination and route page; `Article` + `BreadcrumbList` on blog posts;
  `TravelAgency`+`ContactPoint` + `FAQPage` on the homepage.
- **Destination data model** (`src/lib/destinations.ts`): 7 airport
  destinations (Hurghada, Cairo, Sharm El Sheikh, Luxor, Aswan, Marsa Alam,
  Alexandria) with unique intro copy + popular routes.
- **Route data model** (`src/lib/routes.ts`): ~31 long-tail route landing pages
  (`/transfers/[city]/[route]`) — each with **distance, duration, FAQs and
  unique copy**, covering El Gouna, Makadi Bay, Soma Bay, Sahl Hasheesh, Naama
  Bay, Nabq Bay, Giza/Pyramids, Downtown Cairo, etc.
- **Technical SEO**: dynamic `sitemap.xml` (all locales, all destinations +
  routes + blog), `robots.txt`, canonical URLs, full Open Graph + Twitter
  cards, structured titles/descriptions, dynamic `opengraph-image`.
- **Multi-language**: 7 locales (en/ar/de/fr/it/nl/ru) with `hreflang`
  alternates, localized metadata and a CMS translation pipeline.
- **CMS**: destination ("city pages"), blog and generic content pages
  (`/[locale]/[slug]`) are editable in the admin with per-page SEO + FAQ JSON.

---

## What this change set added

### 1. AI-bot crawl access (`src/app/robots.ts`)
Explicit `Allow: /` rules for **GPTBot, PerplexityBot, ClaudeBot,
anthropic-ai**, so the site is eligible for citation in AI-generated answers.
The `*` rule keeps its `/account`, `/login`, `/api/` disallows.

### 2. Homepage organization + service schema
- `organizationSchema()` — `TravelAgency` with stable `@id` `#organization`,
  `ContactPoint` (24/7, EN/RU), logo, email, `areaServed`, and `sameAs`
  social profiles wired from site settings.
- `transportationServiceSchema()` — a `Service` + `OfferCatalog` node
  enumerating the four product lines (Airport / Private / Hotel / Chauffeur
  transfers), linked to `#organization` via `provider`.

### 3. Org identity reconciliation
The site-wide `LocalBusiness`+`TravelAgency` node now shares the same `@id`
(`#organization`) and carries `sameAs` social profiles, so crawlers merge all
references into one entity.

### 4. Richer blog `Article` schema (`articleSchema()`)
Added `dateModified`, `publisher.logo` (`ImageObject`) and `mainEntityOfPage`;
shared builder used by both blog routes.

### 5. AI-agent machine-readable endpoints (new)
All generated from the live destination/route data, so they never drift:
- **`/llms.txt`** — llmstxt.org-style markdown: company summary, services,
  airports, all routes (with distance/duration), key pages, and pointers to
  the JSON endpoints + sitemap.
- **`/ai-services.json`** — `{ company, description, url, languages, services,
  destinations, routes, contact, booking_url }`.
- **`/service-catalog.json`** — a valid schema.org `OfferCatalog` of service
  types and every route offering (with distance/duration), provider-linked to
  `#organization`.

New shared data module: `src/lib/ai-catalog.ts`.

---

## Deliberately NOT done (and why)

These items from the brief are **content/editorial or policy decisions**, not
code gaps. Implementing them in code would mean fabricating facts — which is
counterproductive for AI citation (AI engines reward verifiable accuracy, and
fabricated ratings risk a Google manual action).

- **`AggregateRating` / `Review` schema** — intentionally omitted (documented
  in `src/lib/seo.ts`). Google's review-snippet policy requires ratings backed
  by verifiable on-site reviews. **Action:** wire to a real source (Google
  Business Profile / Trustpilot / TripAdvisor) before emitting, then add an
  `aggregateRating` to `organizationSchema()`.
- **Trust pages** (About, Why Choose Us, Fleet, Safety, Meet & Greet, Child
  Seat / Cancellation / Baggage policy) — the generic CMS page route
  `/[locale]/[slug]` already renders these with per-page SEO; they should be
  authored in the admin with **real company facts**, not hard-coded.
- **New standalone resort destination pages** (El Gouna, Makadi Bay, etc.) —
  already covered as **route pages** under their airport
  (`/transfers/hurghada/el-gouna`, …). Creating duplicate standalone pages
  would risk keyword cannibalization. Promote to full destination pages via
  the CMS only if they warrant unique, deeper content.
- **Knowledge Hub / guides** — use the existing **blog** + categories; author
  the Airport Guides / Transportation Guides / Travel Info articles in the CMS.
- **Performance (Core Web Vitals targets)** — not addressed here; the site is a
  Next.js standalone build behind nginx with brotli + image proxy caching.
  Recommend a separate Lighthouse-driven pass (image `sizes`/priority audit,
  font-display, route-level bundle check).

---

## Validation checklist

- [x] `robots.txt` contains GPTBot/PerplexityBot/ClaudeBot/anthropic-ai rules
- [x] Homepage emits `TravelAgency`+`ContactPoint`, `Service`/`OfferCatalog`, `FAQPage`
- [x] `/llms.txt` lists company, services, airports, routes, key pages
- [x] `/ai-services.json` has company/services/destinations/contact/booking_url
- [x] `/service-catalog.json` is a valid schema.org `OfferCatalog`
- [x] Blog posts emit enriched `Article` schema
- [x] `sitemap.xml` lists all key URLs; `tsc`, `eslint`, `next build` all green
