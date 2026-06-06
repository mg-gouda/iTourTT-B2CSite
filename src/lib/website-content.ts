// ─── B2C Website Content (CMS) fetchers ──────────────────────────
// Reads city landing pages, blog posts and per-page SEO from the
// backend public API. All fetchers fail soft (return null/empty) so
// the site keeps rendering if the backend is unreachable.

import { API_BASE } from './site-settings';

const PUBLIC_API = `${API_BASE}/api/public`;

async function getJson<T>(url: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}

// ── City / Destination pages ──

export interface CityMenuItem {
  slug: string;
  name: string;
}

export interface CityPageBodySection {
  heading?: string;
  body?: string;
}
export interface CityPageFaq {
  question?: string;
  answer?: string;
}
export interface CityPage {
  slug: string;
  heroHeadline: string | null;
  heroImageUrl: string | null;
  introText: string | null;
  contentHtml: string | null;
  bodyJson: CityPageBodySection[] | null;
  faqJson: CityPageFaq[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  city: { name: string } | null;
}

export function fetchCityMenu(): Promise<CityMenuItem[] | null> {
  return getJson<CityMenuItem[]>(`${PUBLIC_API}/city-pages`);
}

export function fetchCityPage(slug: string, locale?: string): Promise<CityPage | null> {
  const qs = locale && locale !== 'en' ? `?locale=${encodeURIComponent(locale)}` : '';
  return getJson<CityPage>(`${PUBLIC_API}/city-pages/${encodeURIComponent(slug)}${qs}`);
}

// ── Blog ──

export interface BlogCategoryRef {
  name: string;
  slug: string;
}
export interface BlogListItem {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  tags: string[];
  categories: BlogCategoryRef[];
}
export interface BlogListResponse {
  items: BlogListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface BlogPost extends BlogListItem {
  contentHtml: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export function fetchBlogList(opts: {
  page?: number;
  category?: string;
  tag?: string;
  locale?: string;
} = {}): Promise<BlogListResponse | null> {
  const qs = new URLSearchParams();
  if (opts.page) qs.set('page', String(opts.page));
  if (opts.category) qs.set('category', opts.category);
  if (opts.tag) qs.set('tag', opts.tag);
  if (opts.locale && opts.locale !== 'en') qs.set('locale', opts.locale);
  const q = qs.toString();
  return getJson<BlogListResponse>(`${PUBLIC_API}/blog${q ? `?${q}` : ''}`, 120);
}

export function fetchBlogPost(slug: string, locale?: string): Promise<BlogPost | null> {
  const q = locale && locale !== 'en' ? `?locale=${encodeURIComponent(locale)}` : '';
  return getJson<BlogPost>(`${PUBLIC_API}/blog/${encodeURIComponent(slug)}${q}`, 120);
}

export function fetchBlogCategories(): Promise<BlogCategoryRef[] | null> {
  return getJson<BlogCategoryRef[]>(`${PUBLIC_API}/blog/categories`);
}

// ── CMS Static Pages ──

export interface CmsPageMenuItem {
  slug: string;
  title: string;
}

export interface CmsMenus {
  nav: CmsPageMenuItem[];
  footer: CmsPageMenuItem[];
}

export interface CmsPage {
  slug: string;
  title: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
}

export function fetchCmsMenus(locale?: string): Promise<CmsMenus | null> {
  const qs = locale && locale !== 'en' ? `?locale=${encodeURIComponent(locale)}` : '';
  return getJson<CmsMenus>(`${PUBLIC_API}/pages${qs}`, 60);
}

export function fetchCmsPage(slug: string, locale?: string): Promise<CmsPage | null> {
  const qs = locale && locale !== 'en' ? `?locale=${encodeURIComponent(locale)}` : '';
  return getJson<CmsPage>(`${PUBLIC_API}/pages/${encodeURIComponent(slug)}${qs}`, 60);
}

// ── Per-page SEO ──

export interface PageSeo {
  pageKey: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

export function fetchPageSeo(pageKey: string): Promise<PageSeo | null> {
  return getJson<PageSeo>(`${PUBLIC_API}/seo/${encodeURIComponent(pageKey)}`);
}
