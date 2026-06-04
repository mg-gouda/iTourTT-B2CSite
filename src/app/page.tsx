import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/site-settings';
import { JsonLd } from '@/components/JsonLd';
import { serviceSchema, faqSchema } from '@/lib/seo';
import { WebsiteLandingClient } from './landing-client';

export default async function WebsiteLandingPage() {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    settings = await fetchSiteSettings();
  } catch {
    // Use defaults
  }

  return (
    <>
      <JsonLd data={serviceSchema()} />
      <JsonLd data={faqSchema()} />
      <WebsiteLandingClient settings={settings} />
    </>
  );
}
