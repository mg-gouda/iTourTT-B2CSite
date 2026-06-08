// ─── B2C Website Settings ─────────────────────────────────────
// Fetches configurable site settings from the public API.
// Falls back to sensible defaults when the API is unreachable.

// Backend base URL. Set NEXT_PUBLIC_API_URL at build time (client bundle) and
// runtime (SSR) — e.g. https://fulvago.itourtt.cloud.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const PUBLIC_API = `${API_BASE}/api/public`;

// Same-origin base for backend-served assets (e.g. "/uploads/x.jpg"). Empty in
// production so images load from THIS site's own domain — the B2C nginx reverse-
// proxies /uploads to the backend — instead of the third-party backend host.
// Set NEXT_PUBLIC_ASSET_BASE in local dev to point at the backend (e.g.
// http://localhost:3001) where there's no such proxy.
export const ASSET_BASE = process.env.NEXT_PUBLIC_ASSET_BASE ?? '';

// Normalise any backend-served asset to a same-origin /uploads path so images
// never load from the backend host. Handles both bare "/uploads/..." paths and
// absolute backend URLs (e.g. "https://fulvago.itourtt.cloud/uploads/..."),
// rewriting them to "${ASSET_BASE}/uploads/...". Leaves data: URIs and other
// absolute URLs (and local public assets like "/favicon.svg") untouched.
export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('data:')) return path;
  const abs = path.match(/^https?:\/\/[^/]+(\/uploads\/.*)$/);
  if (abs) return `${ASSET_BASE}${abs[1]}`;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/uploads')) return `${ASSET_BASE}${path}`;
  return path;
}

// The logo SVG has been downloaded locally. Map the CDN upload path to the
// local public asset so we don't depend on the fulvago.itourtt.cloud CDN.
const CDN_LOGO_PATH = '/uploads/1780605779569-Transfera-Logo-Yellow-w-v1.svg';
function normalizeLogo(url: string | null): string | null {
  if (!url) return url;
  // Matches both the absolute CDN URL and the bare /uploads path.
  if (url.endsWith(CDN_LOGO_PATH)) return '/logo.svg';
  return url;
}

// ── TypeScript interface matching the WebsiteSettings model ──

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FeatureItem {
  icon: string; // lucide icon name
  title: string;
  description: string;
  color?: string; // tailwind color class, e.g. "blue"
}

export interface SiteSettings {
  // Site Identity
  siteName: string;
  siteLogoUrl: string | null;
  siteFaviconUrl: string | null;

  // Typography
  fontFamily: string;

  // Color Theme
  primaryColor: string;
  accentColor: string;
  heroGradientFrom: string;
  heroGradientTo: string;
  navBgColor: string;
  footerBgColor: string;

  // Header/Footer Presets
  headerPreset: 'default' | 'centered' | 'transparent' | 'minimal';
  footerPreset: 'default' | 'minimal' | 'expanded' | 'centered';

  // Hero Section Content
  heroTitle: string;
  heroSubtitle: string;
  heroCta1Text: string;
  heroCta2Text: string;
  heroImageUrl: string | null;

  // Features Section
  featuresEnabled: boolean;
  featuresTitle: string;
  featuresJson: FeatureItem[] | null;

  // Contact Info
  contactEmail: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialTwitter: string | null;

  // Bank Payment
  bankPaymentEnabled: boolean;
  bankPaymentMessage: string;

  // Payment method master switches
  onlinePaymentEnabled: boolean;
  cashOnArrivalEnabled: boolean;

  // SEO
  metaTitle: string | null;
  metaDescription: string | null;

  // Menu Links
  navLinksJson: NavLink[] | null;
}

// ── Defaults (used when API call fails) ──

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'Transfera',
  siteLogoUrl: null,
  siteFaviconUrl: null,
  fontFamily: 'Inter',
  primaryColor: '#3b82f6',
  accentColor: '#8b5cf6',
  heroGradientFrom: '#1a1a2e',
  heroGradientTo: '#0f3460',
  navBgColor: '#1a1a2e',
  footerBgColor: '#1a1a2e',
  headerPreset: 'default',
  footerPreset: 'default',
  heroTitle: 'Egypt Airport Transfers — Hurghada, Cairo & Sharm El Sheikh',
  heroSubtitle:
    'Safe, comfortable, and reliable private transfers across Egypt. From the airport to your hotel, we have got you covered.',
  heroCta1Text: 'Book Now',
  heroCta2Text: 'Track a Booking',
  heroImageUrl: null,
  featuresEnabled: true,
  featuresTitle: 'Why Choose Us?',
  featuresJson: null,
  contactEmail: 'info@transfera.ae',
  contactPhone: '+20 123 456 7890',
  contactWhatsapp: null,
  socialFacebook: null,
  socialInstagram: null,
  socialTwitter: null,
  bankPaymentEnabled: false,
  bankPaymentMessage: 'Bank payment integration coming soon!',
  onlinePaymentEnabled: true,
  cashOnArrivalEnabled: true,
  metaTitle: null,
  metaDescription: null,
  navLinksJson: null,
};

// ── Fetch function ──

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${PUBLIC_API}/website-settings`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60s
      signal: AbortSignal.timeout(5000), // 5s timeout to prevent SSR hangs
    });

    if (!res.ok) {
      return DEFAULT_SITE_SETTINGS;
    }

    const json = await res.json();
    const data = json.data ?? json;

    // Keep backend-served assets same-origin (loaded from this site's own
    // domain via the nginx /uploads proxy) — same normalisation as
    // resolveAssetUrl, so hero/logo/favicon never depend on the backend host.
    const prefixUrl = (url: string | null): string | null => {
      if (!url) return url;
      const abs = url.match(/^https?:\/\/[^/]+(\/uploads\/.*)$/);
      if (abs) return `${ASSET_BASE}${abs[1]}`;
      return url.startsWith('/uploads/') ? `${ASSET_BASE}${url}` : url;
    };

    // Normalize contact email — replace old brand email if backend still has it.
    const contactEmail: string | null =
      (data.contactEmail ?? DEFAULT_SITE_SETTINGS.contactEmail) === 'info@fulvago.com'
        ? 'info@transfera.ae'
        : (data.contactEmail ?? DEFAULT_SITE_SETTINGS.contactEmail);

    // Normalize heroTitle — the backend admin has a non-geo-targeted default;
    // replace it with the SEO-correct copy so the H1 contains Egypt + city names.
    const heroTitle: string =
      !data.heroTitle || data.heroTitle === 'Book Your Airport Transfer'
        ? DEFAULT_SITE_SETTINGS.heroTitle
        : data.heroTitle;

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...data,
      contactEmail,
      heroTitle,
      siteLogoUrl: normalizeLogo(prefixUrl(data.siteLogoUrl ?? null)),
      siteFaviconUrl: prefixUrl(data.siteFaviconUrl ?? null),
      heroImageUrl: prefixUrl(data.heroImageUrl ?? null),
      // Normalize presets to valid values
      headerPreset: (['default', 'centered', 'transparent', 'minimal'].includes(
        data.headerPreset,
      )
        ? data.headerPreset
        : 'default') as SiteSettings['headerPreset'],
      footerPreset: (['default', 'minimal', 'expanded', 'centered'].includes(
        data.footerPreset,
      )
        ? data.footerPreset
        : 'default') as SiteSettings['footerPreset'],
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
