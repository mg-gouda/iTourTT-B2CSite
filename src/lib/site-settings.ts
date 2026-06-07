// ─── B2C Website Settings ─────────────────────────────────────
// Fetches configurable site settings from the public API.
// Falls back to sensible defaults when the API is unreachable.

// Backend base URL. Set NEXT_PUBLIC_API_URL at build time (client bundle) and
// runtime (SSR) — e.g. https://fulvago.itourtt.cloud.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const PUBLIC_API = `${API_BASE}/api/public`;

// Prefix backend-served asset paths (e.g. "/uploads/x.jpg") with the API host
// so they resolve from this standalone site's own origin. Leaves absolute URLs
// and local public assets (e.g. "/favicon.svg") untouched.
export function resolveAssetUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path) || path.startsWith('data:')) return path;
  if (path.startsWith('/uploads')) return `${API_BASE}${path}`;
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

    // For /uploads/ URLs: in production the ingress serves them from the same
    // domain, so keep them as relative paths. Only prefix in local dev where
    // the backend runs on a different port.
    const PUBLIC_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
    const prefixUrl = (url: string | null): string | null =>
      url && url.startsWith('/uploads/') ? `${PUBLIC_URL}${url}` : url;

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
