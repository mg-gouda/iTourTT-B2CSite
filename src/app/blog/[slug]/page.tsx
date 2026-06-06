import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchBlogPost } from '@/lib/website-content';
import { resolveAssetUrl } from '@/lib/site-settings';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, BRAND_NAME } from '@/lib/seo';
import { BlogPostClient } from './blog-post-client';

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return {};
  const title = post.metaTitle ?? `${post.title} | Transfera`;
  const description = post.metaDescription ?? post.excerpt ?? undefined;
  const canonical = `/blog/${post.slug}`;
  const image = resolveAssetUrl(post.coverImageUrl);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}${canonical}`,
      siteName: BRAND_NAME,
      title,
      description,
      images: image ? [{ url: image, alt: title }] : ['/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image ?? '/og-image.jpg'],
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
      { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}${canonical}` },
    ],
  };

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: image ? [image] : undefined,
    author: post.author
      ? { '@type': 'Person', name: post.author }
      : { '@type': 'Organization', name: BRAND_NAME },
    publisher: { '@type': 'Organization', name: BRAND_NAME, url: SITE_URL },
    datePublished: post.publishedAt ?? undefined,
    url: `${SITE_URL}${canonical}`,
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={article} />
      <BlogPostClient initial={post} />
    </>
  );
}
