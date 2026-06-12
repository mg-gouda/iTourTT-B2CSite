// Root layout — provides <html>/<body> and dynamic font/theme CSS.
// Site chrome (header, footer, schemas) lives in app/[locale]/layout.tsx.

import { headers } from 'next/headers';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { SITE_URL } from '@/lib/seo';
import './globals.css';

export const revalidate = 60;

export const metadata = {
  metadataBase: new URL(SITE_URL),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

const FONT_CSS_MAP: Record<string, string> = {
  Inter:
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=optional',
  'Open Sans':
    'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=optional',
  Poppins:
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=optional',
  Roboto:
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=optional',
  Lato: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=optional',
  Montserrat:
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=optional',
  'DM Sans':
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=optional',
  'Plus Jakarta Sans':
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=optional',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }

  const fontUrl = FONT_CSS_MAP[settings.fontFamily];

  // Active locale comes from the middleware-set request header so the correct
  // lang/dir is rendered server-side (crawler- and RTL-correct) rather than
  // only being patched in client-side by LocaleSetup.
  const locale = (await headers()).get('x-locale') ?? 'en';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    // suppressHydrationWarning: LocaleSetup may still re-assert lang/dir on the
    // client (e.g. after a client-side locale switch); the server value here is
    // already correct for the initial request.
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {fontUrl && (
          // eslint-disable-next-line @next/next/no-page-custom-font
          <link rel="stylesheet" href={fontUrl} />
        )}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .website-root {
                --website-primary: ${settings.primaryColor};
                --website-primary-dark: color-mix(in srgb, ${settings.primaryColor} 82%, black);
                --website-secondary: ${settings.heroGradientFrom};
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
