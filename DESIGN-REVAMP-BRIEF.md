# Transfera B2C Website — Design Revamp Brief

> **Audience:** an AI (or human) design agent tasked with **revamping the visual design** of the
> Transfera public booking website. This document is everything you need to understand *what the
> product is, how it's built, what it currently looks like, and the constraints you must respect*.
> You are redesigning the **UI/UX and styling** — not the business logic, the API contract, or the
> routing structure.

---

## 1. What this product is

**Transfera** (`transfera.ae`) is the **public B2C booking website** for **iTour Transport &
Traffic**, a production-grade enterprise transport/traffic/accounting system for **Egypt-based
airport-transfer operations**.

The website lets a traveller:
- Search and **book a private airport transfer** (e.g. Hurghada / Cairo / Sharm El Sheikh airport → hotel) with a fixed quoted price.
- Choose **one-way, return (2-way), or city-to-city** transfers.
- Add **extras** (booster seat, baby seat, wheelchair, and a managed catalogue of custom extras).
- Pay **online** or **cash on arrival** (both toggleable by admin).
- **Track an existing booking** and manage it via a **client account** (view, amend, cancel).
- Read **SEO content**: destination pages, route landing pages, and a blog.

It is the customer-facing front-end only. All data comes from an existing **NestJS backend** over
REST. The site is **read-mostly + a booking funnel** — it does not contain dispatch, finance, or
admin features (those live in a separate dashboard app).

**Brand:** single brand, `Transfera`. Logo is a yellow wordmark SVG (`public/logo.svg`,
`public/favicon.svg`). Tagline theme: *safe, comfortable, reliable, fixed-price, 24/7, free
cancellation.*

---

## 2. Tech stack (LOCKED — do not change framework choices)

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16.1.6** (App Router, `output: "standalone"`) |
| Language | **TypeScript 5.9** |
| React | **React 19.2** |
| Styling | **Tailwind CSS v4** (CSS-first config via `@theme inline` in `globals.css` — *no* `tailwind.config.js`) |
| UI primitives | **shadcn/ui** pattern over **Radix UI** (`@radix-ui/react-*`, `radix-ui`) |
| Component variants | **class-variance-authority** (`cva`) + **clsx** + **tailwind-merge** (via `cn()` in `src/lib/utils.ts`) |
| Icons | **lucide-react** |
| Toasts | **sonner** (`<Toaster position="top-center" richColors />`) |
| Animations | **tw-animate-css** |
| State | **zustand** (booking funnel + active locale) |
| Dates | **date-fns** |
| Maps | **Google Maps JS API** (place autocomplete for city-to-city / map selector) |
| Deploy | Standalone **Docker** + **nginx** reverse proxy on a dedicated VPS (`transfera.ae`) |

**Backend API:** `https://fulvago.itourtt.cloud/api` (consumed over REST; CORS-allowed).
Configured via `NEXT_PUBLIC_API_URL`. The site is otherwise **fully decoupled** from the backend
repo. Backend-served assets (vehicle photos, uploaded hero images) are reverse-proxied at
`/uploads/*` on this site's own origin — see `resolveAssetUrl()` in `src/lib/site-settings.ts`.

> **Constraint:** Keep the stack. Use Tailwind v4 + shadcn/Radix + lucide. Do **not** introduce a
> CSS-in-JS lib, a different icon set, or a UI kit like MUI/Chakra. New shadcn primitives are fine.

---

## 3. Styling system — how theming actually works

There are **two layers** of styling and you must understand both:

### 3a. Tailwind v4 theme tokens (`src/app/globals.css`)
The design tokens are CSS custom properties in **OKLCH**, exposed to Tailwind via `@theme inline`.
Key facts:
- `--radius: 0.625rem` (base; `sm/md/lg/xl/2xl…` derived from it).
- The public site is **forced light mode** via a `.website-root` class that re-declares the
  light token set (the dark `.dark` tokens exist but are not used on the public site).
- Semantic tokens: `background`, `foreground`, `card`, `popover`, `primary`, `secondary`,
  `muted`, `accent`, `destructive`, `border`, `input`, `ring`, plus `chart-*` and `sidebar-*`
  (sidebar tokens are legacy from the dashboard and unused here).
- Token `--primary` is currently a **blue** (`oklch(0.45 0.18 250)`).

### 3b. Runtime, admin-configurable brand variables (`src/app/layout.tsx`)
The **root layout fetches site settings from the backend** and injects a `<style>` block that sets:
```
--website-primary, --website-accent, --website-nav-bg,
--website-footer-bg, --website-hero-from, --website-hero-to
```
plus the **font-family** (Google Font chosen by admin — Inter, Poppins, Montserrat, DM Sans, Plus
Jakarta Sans, etc.; default **Inter**). These come from `WebsiteSettings` (see §6) and are applied
to `.website-root`. **Many components read these live colours via inline `style={{}}`** (e.g. the
booking-widget tab colour `pc = settings.primaryColor`), so a redesign must keep them
working — *the brand colour is data, not a hard-coded value.*

### 3c. ⚠️ The current inconsistency (a key thing to fix)
There are effectively **three competing colour sources** today:
1. Tailwind `--primary` token = **blue**.
2. Admin `settings.primaryColor` default = `#3b82f6` (blue), `accentColor` = `#8b5cf6` (purple).
3. Components hard-code **emerald** (`emerald-500/600/700`) as the de-facto accent — hover states,
   the hero "live" dot, destination/route menu links, blog links (`#047857`).

Color-usage audit across `src/**`:
```
gray-900 ×90   gray-500 ×89   gray-400 ×60   gray-50 ×58   gray-100 ×54
gray-200 ×50   emerald-600 ×17  emerald-700 ×14  emerald-500 ×9  amber ×8  blue ×6
```
**Takeaway:** the palette is **grayscale + emerald accent**, but the "brand" token says blue/purple.
Part of the revamp should be to **unify the accent** — ideally drive it from `settings.primaryColor`
consistently instead of scattered hard-coded `emerald-*`, or formally adopt emerald as the brand and
align the tokens + admin defaults to match. Confirm the intended brand colour before mass-editing.

---

## 4. Routing & page inventory

App Router with a **`[locale]` segment** wrapping everything. Middleware redirects `/` → `/en`
(or the Accept-Language match) with a 308, and sets `<html lang>`/`dir` (Arabic = RTL). There is
**both** a `src/app/[locale]/**` tree (the live, locale-aware routes) and a legacy non-locale
`src/app/**` tree of the same pages — the `[locale]` versions are canonical.

| Route | Purpose | Key client component |
|-------|---------|----------------------|
| `/[locale]` | **Landing page**: hero + booking widget + features + how-it-works | `landing-client.tsx` |
| `/[locale]/book` | Step 1 — pick vehicle (results list) | `book/book-client.tsx` |
| `/[locale]/book/flight` | Step 2 — flight details | `book/flight/flight-client.tsx` |
| `/[locale]/book/details` | Step 3 — passenger details + extras + pay | `book/details/details-client.tsx` |
| `/[locale]/booking/lookup` | Track a booking by reference | `booking/lookup/track-client.tsx` |
| `/[locale]/login` | B2C client login | `login/login-client.tsx` |
| `/[locale]/account` | Account dashboard + bookings list | `account/...` |
| `/[locale]/account/booking/[ref]` | Booking detail | `booking-detail-client.tsx` |
| `/[locale]/account/booking/[ref]/amend` | Amend a booking | `amend-client.tsx` |
| `/[locale]/payment/success` `/cancel` | Online-payment return pages | `payment/...` |
| `/[locale]/destinations` | Destinations index (SEO) | `destination-client.tsx` |
| `/[locale]/transfers/[city]` | City landing page (SEO) | — |
| `/[locale]/transfers/[city]/[route]` | Route long-tail landing page (SEO) | — |
| `/[locale]/blog` + `/blog/[slug]` | Blog index + post | `blog-*-client.tsx` |
| `/[locale]/[slug]` | Generic CMS page | `cms-page-content.tsx` |

**Layout chrome** (`src/app/[locale]/layout.tsx` → `website-shell.tsx`):
`SiteHeader` + `<main>` + `SiteFooter`, plus `<Toaster>`, a **cookie-consent banner**, and
JSON-LD structured data. `WebsiteShell` carries `className="website-root … bg-white"` and the `dir`.

---

## 5. Current visual design — component-by-component

This is the **"before" state** you are revamping. Overall aesthetic: **clean, light, modern SaaS**,
white backgrounds, soft gray borders, rounded-2xl cards, subtle shadows, emerald accents.

### Header (`components/website/site-header.tsx`)
- Bar background uses `settings.navBgColor` (default dark navy `#1a1a2e`); links are **white/80 →
  white on hover**.
- Logo left (yellow SVG wordmark). Nav: Home, Book Now, Track Booking, plus a **Destinations
  mega-menu** (2-col grid of cities) and a **Routes mega-menu** (airport→resort routes), Blog, and
  any admin-defined nav links.
- Right side: **language switcher** (Globe icon, 7 locales) and account/login.
- Has 4 admin presets conceptually (`default | centered | transparent | minimal`).

### Hero (`components/website/hero-section.tsx`)
- White section; optional full-bleed background `<img>` (LCP-optimised, `fetchpriority=high`).
- Centered: a pill **badge** (`border + emerald dot + uppercase tracking-widest`), an
  `text-4xl→6xl font-extrabold` H1, a bold subtitle, then the **booking widget slot** below
  (`w-[85vw]`, centered).

### Booking widget (`components/website/booking-widget.tsx`) — the centrepiece
- The most complex component (~800 lines). Tabbed: **Airport Transfer** (always on) and
  **City-to-City** (toggleable). One-Way / **Return Transfer** is a radio inside the Airport tab.
- Tab buttons use the **live brand colour** (`backgroundColor: settings.primaryColor`, inactive at
  0.4 opacity). The form panel is a **dark translucent card** (`rgba(25,25,25,0.75)`, `rounded-2xl`,
  `ring-1 ring-white/10`, `shadow-xl`) sitting over the hero.
- Custom popovers for **date** (calendar grid) and **time**, a passenger **counter**, location
  selects, and Google **place autocomplete** for city-to-city / map mode.

### Features section (`components/website/features-section.tsx`)
- `bg-gray-50/60` section, centered heading, **3-col responsive grid** of cards.
- Each card: `rounded-2xl border bg-white shadow-sm`, hover `-translate-y-1 + shadow-lg`, an icon
  in a **gradient-tinted rounded square** (8 colour presets: blue/green/purple/red/amber/indigo/
  teal/pink, each a from→to→text triple), title + description. Content is admin-configurable
  (`featuresJson`) or falls back to 6 defaults (24/7 support, meet & greet, vetted drivers, flight
  tracking, no hidden fees, easy payment).

### How-it-works (in `landing-client.tsx`)
- White section, 3 steps (Search → Pay → Travel) with lucide icons and a dashed connecting line on
  desktop.

### Footer (`components/website/site-footer.tsx`)
- Background `settings.footerBgColor` (default dark navy). Multi-column: brand/quick links/contact/
  social, with 4 presets (`default | minimal | expanded | centered`).

### Booking funnel pages (`/book`, `/book/flight`, `/book/details`)
- List-style vehicle results (light theme), form-heavy steps, a **step indicator**.

### Blog
- Custom typography via the **`.blog-content` CSS** in `globals.css` (no `@tailwindcss/typography`
  plugin): gray-700 body, gray-900 headings, emerald (`#047857`) links, styled lists/blockquotes/
  tables/images.

---

## 6. Admin-configurable settings (`SiteSettings`)

The backend `/api/public/website-settings` drives a lot of the look. The full shape lives in
`src/lib/site-settings.ts`. **A redesign must keep these honoured** (they're edited by a separate
admin dashboard, out of scope here):

- **Identity:** `siteName`, `siteLogoUrl`, `siteFaviconUrl`.
- **Typography:** `fontFamily` (one of ~8 Google Fonts).
- **Colour:** `primaryColor`, `accentColor`, `heroGradientFrom/To`, `navBgColor`, `footerBgColor`.
- **Presets:** `headerPreset` (default/centered/transparent/minimal), `footerPreset`
  (default/minimal/expanded/centered).
- **Hero content:** `heroTitle`, `heroSubtitle`, `heroCta1Text`, `heroCta2Text`, `heroImageUrl`.
- **Features:** `featuresEnabled`, `featuresTitle`, `featuresJson` (array of `{icon,title,description,color}`).
- **Contact/social:** email, phone, whatsapp, facebook, instagram, twitter.
- **Payments:** `onlinePaymentEnabled`, `cashOnArrivalEnabled`, `bankPaymentEnabled`+message.
- **Booking widget switches:** `enableTwoWayTab`, `enableCityToCityTab`, `enableMapSelector`, `bookingTabsOrder`.
- **Nav:** `navLinksJson` (array of `{label,href,external}`).
- **SEO:** `metaTitle`, `metaDescription`.

> Treat every one of these as a **design variable**. If you redesign the hero, it must still render
> an admin-supplied `heroImageUrl`/title/subtitle and brand colours. If you redesign features, it
> must still map `featuresJson` + the 8 colour presets + lucide icon names.

---

## 7. Internationalisation & RTL (must not break)

- **7 locales:** `en, ar, de, fr, it, nl, ru`. URL is the source of truth (`/[locale]/...`).
- **Arabic is RTL** — `dir="rtl"` is set on `<html>` and on `WebsiteShell`. **Every layout you
  design must work mirrored.** Avoid hard-coded left/right; prefer logical properties / Tailwind
  `ms-/me-/ps-/pe-/start-/end-` and flex order that flips cleanly.
- Translation via `useWT()` / `useLocale()` (`src/lib/website-i18n.tsx`), seeded server-side from
  the URL for SSR-correct localized copy. Use the `t('key')` helper for all visible strings — do
  **not** hard-code English in new markup.
- Use `useLocalePath()` to build locale-prefixed `href`s (never bare `/book`).

---

## 8. SEO / structured data / AI-readiness (do not regress)

This site is **heavily SEO- and AI-crawler-optimised** (see `AI-READINESS-REPORT.md`,
`SEO-ACTION-PLAN.md`). Preserve these when restyling:

- Per-page `generateMetadata` with titles, descriptions, **hreflang** alternates for all locales,
  and OpenGraph (`opengraph-image.tsx`, 1200×630).
- **JSON-LD** schemas: `LocalBusiness`/`TravelAgency`, `WebSite` + `SearchAction`, `Article` (blog),
  route/destination schemas. Injected via `<JsonLd>` (`src/lib/seo.ts`, `src/lib/ai-catalog.ts`).
- `robots.ts`, `sitemap.ts`, `llms.txt`, `ai-services.json`, `service-catalog.json` routes.
- **LCP discipline:** hero image is a real `<img>` with `fetchpriority="high"` so the preload
  scanner finds it. Keep this pattern — don't move the hero image to a CSS `background-image`.
- Semantic HTML & real headings matter for ranking; keep proper `<h1>/<h2>` hierarchy.

---

## 9. Security / infra constraints that affect design

- **Strict CSP** (`next.config.ts`): scripts from self + `maps.googleapis.com`; styles from self +
  `fonts.googleapis.com`; fonts from `fonts.gstatic.com`; images from self + the backend host +
  Google Maps. **Any new asset domain (CDN, font host, image host, analytics, embed) must be added
  to the CSP** or it will be blocked. Prefer self-hosted assets and the already-allowed Google Fonts.
- HSTS, `X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'self'`, `Referrer-Policy`,
  `Permissions-Policy` (camera/mic off, geolocation self).
- Images come back as `/uploads/...` and are normalised by `resolveAssetUrl()` — always run
  backend-served image URLs through it.
- `next/font` is **not** used; fonts load via `<link rel="stylesheet">` to Google Fonts chosen at
  runtime. If you want `next/font`, coordinate — it changes the runtime-font mechanism.

---

## 10. Responsiveness & accessibility expectations

- **Mobile-first.** Tailwind breakpoints `sm/md/lg`. The booking widget and headers already have
  distinct mobile layouts; keep them first-class — the bulk of B2C traffic is mobile.
- iOS safe-area handled via `.safe-bottom` (`env(safe-area-inset-bottom)`); `viewport-fit=cover`.
- Maintain **WCAG AA** contrast — note white-on-navy nav and dark translucent booking panel are
  contrast-sensitive; verify any palette change.
- Keep focus states (`--ring` token, `outline-ring/50`), keyboard nav on the custom date/time/select
  popovers, and `aria-*` on icon-only buttons.

---

## 11. Where to work — file map for a redesign

```
src/app/globals.css                     ← design tokens, .website-root light theme, .blog-content, utilities
src/app/layout.tsx                      ← root <html>/<body>, runtime brand-colour + font injection
src/app/[locale]/layout.tsx             ← site chrome wiring, JSON-LD, Toaster, cookie banner
src/app/website-shell.tsx               ← header + main + footer wrapper (carries .website-root, dir)
src/app/landing-client.tsx              ← landing composition (hero + widget + features + how-it-works)
src/components/website/
  site-header.tsx                       ← nav, mega-menus, language switcher
  site-footer.tsx                       ← footer (4 presets)
  hero-section.tsx                      ← hero
  features-section.tsx                  ← features grid (icon/colour presets)
  booking-widget.tsx                    ← the booking funnel entry (most complex — touch carefully)
  place-autocomplete.tsx                ← Google Maps place picker
  contact-form.tsx, cms-page-content.tsx, cookie-consent-banner.tsx
src/components/ui/                       ← shadcn primitives: button, input, label, select, popover, card, badge
src/lib/
  site-settings.ts                      ← SiteSettings shape + defaults + resolveAssetUrl()
  website-i18n.tsx, i18n-config.ts, website-translations.ts  ← i18n (t(), locales, RTL)
  utils.ts (cn)                          ← className merge helper
  seo.ts, ai-catalog.ts, page-metadata.ts, routes.ts, destinations.ts  ← SEO/structured data (don't regress)
src/stores/booking-store.ts             ← zustand booking funnel state (logic — leave intact)
```

### Do / Don't for the design agent
**Do**
- Restyle markup, spacing, typography scale, colour application, card/shadow/radius language,
  micro-interactions, empty/loading states, and responsive behaviour.
- Add new shadcn/ui primitives and lucide icons as needed.
- Unify the accent colour and resolve the blue-token vs emerald-usage inconsistency (§3c).
- Reuse the `cn()` helper, semantic Tailwind tokens, and `t()` for all strings.

**Don't**
- Change the framework, routing structure, `[locale]` scheme, API contract, or `booking-store` logic.
- Hard-code brand colours where `settings.*Color` is meant to flow through (keep admin theming live).
- Break RTL, SSR-localized copy, JSON-LD/metadata, the hero `<img>` LCP pattern, or the CSP
  (no new un-allow-listed asset domains).
- Hard-code English text or non-locale-prefixed links.

---

## 12. Quick-start for the agent

```bash
cd /opt/iTourTT-B2CSite      # this repo (transfera.ae standalone B2C site)
cp .env.example .env         # set NEXT_PUBLIC_API_URL=https://fulvago.itourtt.cloud
npm install
npm run dev                  # http://localhost:3000 → redirects to /en
npm run build                # must stay clean (output: standalone)
```
Live API powers settings/quotes/bookings, so dev renders real content. Start at `/en` (landing),
then walk the funnel `/en/book → /book/flight → /book/details`, and check `/ar` to verify RTL.

---

*Generated as a design-revamp brief. Authoritative source files are under `src/`; this document
summarises them and the constraints around them.*
