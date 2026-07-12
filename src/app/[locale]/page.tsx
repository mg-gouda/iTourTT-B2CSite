import type { Metadata } from 'next';
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { fetchCityMenu, type CityMenuItem } from '@/lib/website-content';
import { JsonLd } from '@/components/JsonLd';
import { organizationSchema, faqSchema, transportationServiceSchema, socialSameAs } from '@/lib/seo';
import { buildPageMetadata } from '@/lib/page-metadata';
import { WebsiteLandingClient } from '../landing-client';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata('home', {
    canonical: `/${locale}`,
    path: '/',
    locale,
    fallbackTitle: 'Egypt Airport Transfers | Hurghada, Cairo & Sharm | Transfera',
    fallbackDescription:
      'Book safe, private airport transfers across Egypt. Arrival & departure service in Hurghada, Cairo, Sharm El Sheikh & more. Fixed price, free cancellation, 24/7 support.',
  });
}

export default async function LocaleHomePage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try { settings = await fetchSiteSettings(); } catch {}
  let destinations: CityMenuItem[] = [];
  try { destinations = (await fetchCityMenu()) ?? []; } catch {}
  return (
    <>
      <JsonLd
        data={organizationSchema({
          name: settings.siteName,
          telephone: settings.contactPhone,
          email: settings.contactEmail,
          sameAs: socialSameAs({
            facebook: settings.socialFacebook,
            instagram: settings.socialInstagram,
            twitter: settings.socialTwitter,
          }),
        })}
      />
      <JsonLd data={transportationServiceSchema()} />
      <JsonLd data={faqSchema()} />
      <WebsiteLandingClient settings={settings} destinations={destinations} />
    </>
  );
}
