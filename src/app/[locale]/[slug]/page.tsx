import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchCmsPage } from '@/lib/website-content';
import { CmsPageContent } from '@/components/website/cms-page-content';
import { SITE_URL } from '@/lib/seo';
import { LOCALES } from '@/lib/i18n-config';

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await fetchCmsPage(slug, locale);
  if (!page) return {};

  const title = page.metaTitle ?? page.title;
  const description = page.metaDescription ?? undefined;

  const languages: Record<string, string> = { 'x-default': `${SITE_URL}/en/${slug}` };
  LOCALES.forEach((loc) => { languages[loc] = `${SITE_URL}/${loc}/${slug}`; });

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}/${slug}`,
      languages,
    },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `${SITE_URL}/${locale}/${slug}`,
    },
  };
}

export default async function CmsPageRoute({ params }: Props) {
  const { locale, slug } = await params;
  const page = await fetchCmsPage(slug, locale);
  if (!page) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {page.title}
      </h1>
      {page.content && <CmsPageContent html={page.content} />}
    </main>
  );
}
