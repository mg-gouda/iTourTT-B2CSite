import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';
import { fetchBlogPost } from '@/lib/website-content';
import { resolveAssetUrl } from '@/lib/site-settings';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, BRAND_NAME, OG_IMAGE, articleSchema } from '@/lib/seo';
import { LOCALES } from '@/lib/i18n-config';
import { translate } from '@/lib/website-translations';

export const revalidate = 120;

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await fetchBlogPost(slug, locale);
  if (!post) return {};

  const seo = post.seo ?? {};
  const title = post.metaTitle ?? `${post.title} | Transfera`;
  const description = post.metaDescription ?? post.excerpt ?? undefined;
  const canonical = seo.canonicalUrl || `/${locale}/blog/${post.slug}`;
  const image = resolveAssetUrl(seo.ogImage || post.coverImageUrl);
  const twImage = resolveAssetUrl(seo.twitterImage || seo.ogImage || post.coverImageUrl);

  const languages: Record<string, string> = { 'x-default': `${SITE_URL}/en/blog/${post.slug}` };
  LOCALES.forEach((loc) => { languages[loc] = `${SITE_URL}/${loc}/blog/${post.slug}`; });

  return {
    title,
    description,
    alternates: { canonical, languages },
    robots: { index: !seo.robotsNoindex, follow: !seo.robotsNofollow },
    openGraph: {
      type: 'article',
      url: seo.canonicalUrl || `${SITE_URL}${canonical}`,
      siteName: BRAND_NAME,
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: [{ url: image ?? OG_IMAGE, alt: seo.ogTitle || title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || title,
      description: seo.twitterDescription || description,
      images: [twImage ?? OG_IMAGE],
    },
  };
}

export default async function LocaleBlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = await fetchBlogPost(slug, locale);
  if (!post) notFound();

  const canonical = `/${locale}/blog/${post.slug}`;
  const image = resolveAssetUrl(post.coverImageUrl);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/${locale}/blog` },
      { '@type': 'ListItem', position: 3, name: post.seo?.breadcrumbTitle || post.title, item: `${SITE_URL}${canonical}` },
    ],
  };

  const article = articleSchema({
    title: post.title,
    description: post.excerpt,
    image,
    author: post.author,
    url: `${SITE_URL}${canonical}`,
    publishedAt: post.publishedAt,
    type: post.seo?.schemaType,
  });

  return (
    <article className="bg-white">
      <JsonLd data={breadcrumb} />
      <JsonLd data={article} />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <Link href={`/${locale}/blog`} className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> {translate(locale, 'blog.backToBlog')}
        </Link>
        {post.categories?.length > 0 && (
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {post.categories[0].name}
          </span>
        )}
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-4xl">{post.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          {post.author && <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>}
          {post.publishedAt && <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {formatDate(post.publishedAt)}</span>}
        </div>
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={post.title} className="mt-8 w-full rounded-2xl object-cover" />
        )}
        {post.contentHtml ? (
          <div className="blog-content mt-8" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        ) : (
          post.excerpt && <p className="mt-8 text-gray-600">{post.excerpt}</p>
        )}
        {post.tags?.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-gray-100 pt-6">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
