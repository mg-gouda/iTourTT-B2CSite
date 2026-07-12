import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchBlogPost } from '@/lib/website-content';
import { resolveAssetUrl } from '@/lib/site-settings';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, BRAND_NAME, articleSchema } from '@/lib/seo';
import { BlogPostClient } from './blog-post-client';

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return {};
  const seo = post.seo ?? {};
  const title = post.metaTitle ?? `${post.title} | Transfera`;
  const description = post.metaDescription ?? post.excerpt ?? undefined;
  const canonical = seo.canonicalUrl || `/blog/${post.slug}`;
  const image = resolveAssetUrl(seo.ogImage || post.coverImageUrl);
  const twImage = resolveAssetUrl(seo.twitterImage || seo.ogImage || post.coverImageUrl);
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: !seo.robotsNoindex, follow: !seo.robotsNofollow },
    openGraph: {
      type: 'article',
      url: seo.canonicalUrl || `${SITE_URL}/blog/${post.slug}`,
      siteName: BRAND_NAME,
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: image ? [{ url: image, alt: seo.ogTitle || title }] : ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || title,
      description: seo.twitterDescription || description,
      images: [twImage ?? '/og-image.jpg'],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  // English post for SEO / first paint; the client swaps in the
  // translated post when a non-English locale is selected.
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  const canonical = `/blog/${post.slug}`;
  const image = resolveAssetUrl(post.coverImageUrl);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
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
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={article} />
      <BlogPostClient initial={post} />
    </>
  );
}
