import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { JsonLd } from '@/components/JsonLd';
import {
  SITE_URL,
  HOME_TITLE,
  HOME_DESCRIPTION,
  OG_DESCRIPTION,
  OG_IMAGE,
  BRAND_NAME,
  localBusinessSchema,
} from '@/lib/seo';
import { WebsiteShell } from './website-shell';
import './globals.css';

export const dynamic = 'force-dynamic';

// ── Dynamic metadata from site settings ──
// Backend metaTitle/metaDescription win; the geo-targeted strings in
// @/lib/seo are the static fallbacks.

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();

  const title = settings.metaTitle ?? HOME_TITLE;
  const description = settings.metaDescription ?? HOME_DESCRIPTION;
  const siteName = settings.siteName || BRAND_NAME;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName,
      title,
      description: OG_DESCRIPTION,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'Transfera — Egypt Airport Transfers',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: OG_DESCRIPTION,
      images: [OG_IMAGE],
    },
    icons: {
      icon: settings.siteFaviconUrl ?? '/favicon.svg',
    },
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

// ── Google Font CSS URLs for dynamic loading ──

const FONT_CSS_MAP: Record<string, string> = {
  Inter:
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'Open Sans':
    'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap',
  Poppins:
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap',
  Roboto:
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap',
  Lato: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap',
  Montserrat:
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap',
  'DM Sans':
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
  'Plus Jakarta Sans':
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults on failure
  }

  const fontUrl = FONT_CSS_MAP[settings.fontFamily];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dynamic Google Font */}
        {fontUrl && (
          // eslint-disable-next-line @next/next/no-page-custom-font
          <link rel="stylesheet" href={fontUrl} />
        )}
        {/* CSS custom properties for dynamic theming */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .website-root {
                --website-primary: ${settings.primaryColor};
                --website-accent: ${settings.accentColor};
                --website-nav-bg: ${settings.navBgColor};
                --website-footer-bg: ${settings.footerBgColor};
                --website-hero-from: ${settings.heroGradientFrom};
                --website-hero-to: ${settings.heroGradientTo};
                font-family: '${settings.fontFamily}', system-ui, -apple-system, sans-serif;
              }
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {/* Site-wide LocalBusiness / TravelAgency structured data */}
        <JsonLd
          data={localBusinessSchema({
            name: settings.siteName,
            telephone: settings.contactPhone,
            email: settings.contactEmail,
          })}
        />
        <WebsiteShell settings={settings}>{children}</WebsiteShell>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
