'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  analyze, type Check, type Rating, type Group,
} from '@/lib/seo/analysis';
import { Field, Input, Textarea, Select, Switch, Label, cn } from './ui';
import {
  Search, BookOpen, Sparkles, Share2, SlidersHorizontal, Globe, Smartphone,
} from 'lucide-react';

export interface SeoMeta {
  focusKeyphrase?: string;
  canonicalUrl?: string;
  robotsNoindex?: boolean;
  robotsNofollow?: boolean;
  ogTitle?: string; ogDescription?: string; ogImage?: string;
  twitterTitle?: string; twitterDescription?: string; twitterImage?: string;
  schemaType?: string;
  cornerstone?: boolean;
  breadcrumbTitle?: string;
}

// ── pixel-width truncation (Google truncates by pixels, not chars) ──
let _canvas: HTMLCanvasElement | null = null;
function truncatePx(text: string, maxPx: number, font: string): string {
  if (typeof document === 'undefined') return text;
  _canvas ??= document.createElement('canvas');
  const ctx = _canvas.getContext('2d')!;
  ctx.font = font;
  if (ctx.measureText(text).width <= maxPx) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxPx) t = t.slice(0, -1);
  return t.trimEnd() + '…';
}

const DOT: Record<Rating, string> = {
  good: 'bg-emerald-500', ok: 'bg-amber-500', bad: 'bg-red-500',
};
const SCORE_LABEL: Record<Rating, string> = { good: 'Good', ok: 'OK', bad: 'Needs work' };

function analysisList(checks: Check[]) {
  return (
    <ul className="space-y-1.5">
      {checks.map((c) => (
        <li key={c.id} className="flex items-start gap-2 text-sm">
          <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', DOT[c.rating])} />
          <span className="text-slate-600 dark:text-slate-300">{c.text}</span>
        </li>
      ))}
    </ul>
  );
}

const SCHEMA_TYPES = ['BlogPosting', 'Article', 'NewsArticle', 'FAQPage', 'Organization', 'LocalBusiness', 'none'];

export function SeoPanel({
  content, metaTitle, metaDescription, slug, onMeta, seo, onSeo,
  baseUrl = 'https://transferra.ae', pathPrefix = '/blog/',
}: {
  content: { title: string; contentHtml?: string; author?: string; coverImageUrl?: string };
  metaTitle: string; metaDescription: string; slug: string;
  onMeta: (patch: { metaTitle?: string; metaDescription?: string; slug?: string }) => void;
  seo: SeoMeta;
  onSeo: (patch: Partial<SeoMeta>) => void;
  baseUrl?: string;
  pathPrefix?: string;
}) {
  const [tab, setTab] = useState<'seo' | 'readability' | 'ai' | 'social' | 'advanced'>('seo');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const result = useMemo(() => analyze({
    title: content.title,
    metaTitle, metaDescription, slug,
    contentHtml: content.contentHtml,
    focusKeyphrase: seo.focusKeyphrase,
    author: content.author,
    schemaType: seo.schemaType,
    coverImageUrl: content.coverImageUrl,
  }), [content, metaTitle, metaDescription, slug, seo.focusKeyphrase, seo.schemaType]);

  const previewTitle = (metaTitle || content.title || 'Your page title').trim();
  const previewDesc = (metaDescription || 'Write a meta description to control your search snippet.').trim();
  const url = `${baseUrl}${pathPrefix}${slug || 'your-post'}`;
  const titleFont = '20px arial, sans-serif';
  const descFont = '14px arial, sans-serif';
  const titlePx = device === 'desktop' ? 600 : 400;
  const descPx = device === 'desktop' ? 920 : 560;

  const TABS = [
    { k: 'seo', label: 'SEO', icon: Search, rating: result.score.seo.rating },
    { k: 'readability', label: 'Readability', icon: BookOpen, rating: result.score.readability.rating },
    { k: 'ai', label: 'AI readiness', icon: Sparkles, rating: result.score.ai.rating },
    { k: 'social', label: 'Social', icon: Share2 },
    { k: 'advanced', label: 'Advanced', icon: SlidersHorizontal },
  ] as const;

  return (
    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 p-2 dark:border-slate-800">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k as any)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                tab === t.k
                  ? 'bg-primary/10 text-primary dark:text-primary'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {'rating' in t && t.rating && (
                <span className={cn('h-1.5 w-1.5 rounded-full', DOT[t.rating as Rating])} />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4">
        {/* ── SEO tab: keyphrase + snippet + checks ── */}
        {tab === 'seo' && (
          <div className="space-y-4">
            <Field label="Focus keyphrase" hint="The term you want this post to rank for.">
              <Input
                value={seo.focusKeyphrase ?? ''}
                onChange={(e) => onSeo({ focusKeyphrase: e.target.value })}
                placeholder="e.g. Cairo airport transfer"
              />
            </Field>

            {/* Google snippet preview */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Google preview</Label>
                <div className="flex gap-1">
                  <button type="button" onClick={() => setDevice('desktop')}
                    className={cn('rounded p-1', device === 'desktop' ? 'text-primary' : 'text-slate-400')}><Globe className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setDevice('mobile')}
                    className={cn('rounded p-1', device === 'mobile' ? 'text-primary' : 'text-slate-400')}><Smartphone className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950">
                <div className="truncate text-xs text-[#4d5156] dark:text-slate-400">{url}</div>
                <div className="text-[18px] leading-tight text-[#1a0dab] dark:text-primary">
                  {truncatePx(previewTitle, titlePx, titleFont)}
                </div>
                <div className="mt-0.5 text-[13px] leading-snug text-[#4d5156] dark:text-slate-400">
                  {truncatePx(previewDesc, descPx, descFont)}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="SEO title" hint={`${(metaTitle || content.title).length} chars`}>
                <Input value={metaTitle} onChange={(e) => onMeta({ metaTitle: e.target.value })} placeholder={content.title} />
              </Field>
              <Field label="Slug">
                <Input value={slug} onChange={(e) => onMeta({ slug: e.target.value })} />
              </Field>
            </div>
            <Field label="Meta description" hint={`${metaDescription.length}/160`}>
              <Textarea value={metaDescription} maxLength={320} onChange={(e) => onMeta({ metaDescription: e.target.value })} />
            </Field>

            <ScoreBar label="SEO" s={result.score.seo} />
            {analysisList(result.seo)}
          </div>
        )}

        {tab === 'readability' && (
          <div className="space-y-3">
            <ScoreBar label="Readability" s={result.score.readability} />
            {analysisList(result.readability)}
          </div>
        )}

        {tab === 'ai' && (
          <div className="space-y-3">
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary dark:text-primary">
              Optimizes for AI answer engines (Google AI Overviews, ChatGPT, Perplexity): lead with a
              direct answer, pack in concrete facts, use question headings, and add author + schema.
            </p>
            <ScoreBar label="AI readiness" s={result.score.ai} />
            {analysisList(result.ai)}
          </div>
        )}

        {tab === 'social' && (
          <div className="space-y-5">
            <SocialEditor
              network="Open Graph (Facebook / LinkedIn)"
              title={seo.ogTitle ?? ''} desc={seo.ogDescription ?? ''} image={seo.ogImage ?? ''}
              fallbackTitle={previewTitle} fallbackDesc={previewDesc} fallbackImg={content.coverImageUrl}
              onChange={(p) => onSeo({ ogTitle: p.title, ogDescription: p.desc, ogImage: p.image })}
              variant="og"
            />
            <SocialEditor
              network="X / Twitter card"
              title={seo.twitterTitle ?? ''} desc={seo.twitterDescription ?? ''} image={seo.twitterImage ?? ''}
              fallbackTitle={previewTitle} fallbackDesc={previewDesc} fallbackImg={content.coverImageUrl}
              onChange={(p) => onSeo({ twitterTitle: p.title, twitterDescription: p.desc, twitterImage: p.image })}
              variant="twitter"
            />
          </div>
        )}

        {tab === 'advanced' && (
          <div className="space-y-4">
            <Field label="Canonical URL" hint="Leave blank to use the page's own URL.">
              <Input value={seo.canonicalUrl ?? ''} onChange={(e) => onSeo({ canonicalUrl: e.target.value })} placeholder={url} />
            </Field>
            <div className="flex flex-wrap gap-6">
              <Switch checked={!!seo.robotsNoindex} onChange={(v) => onSeo({ robotsNoindex: v })} label="noindex (hide from search)" />
              <Switch checked={!!seo.robotsNofollow} onChange={(v) => onSeo({ robotsNofollow: v })} label="nofollow links" />
              <Switch checked={!!seo.cornerstone} onChange={(v) => onSeo({ cornerstone: v })} label="Cornerstone content" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Schema type" hint="FAQ no longer shows rich results (May 2026) — still aids AI understanding.">
                <Select value={seo.schemaType ?? 'BlogPosting'} onChange={(e) => onSeo({ schemaType: e.target.value })}>
                  {SCHEMA_TYPES.map((t) => <option key={t} value={t}>{t === 'none' ? 'None' : t}</option>)}
                </Select>
              </Field>
              <Field label="Breadcrumb title" hint="Shown in the breadcrumb trail + BreadcrumbList schema.">
                <Input value={seo.breadcrumbTitle ?? ''} onChange={(e) => onSeo({ breadcrumbTitle: e.target.value })} placeholder={content.title} />
              </Field>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ label, s }: { label: string; s: { rating: Rating; good: number; ok: number; bad: number } }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800/60">
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className={cn('h-2.5 w-2.5 rounded-full', DOT[s.rating])} />
        {label}: {SCORE_LABEL[s.rating]}
      </span>
      <span className="text-xs text-slate-500">
        {s.good} good · {s.ok} ok · {s.bad} to fix
      </span>
    </div>
  );
}

function SocialEditor({
  network, title, desc, image, fallbackTitle, fallbackDesc, fallbackImg, onChange, variant,
}: {
  network: string; title: string; desc: string; image: string;
  fallbackTitle: string; fallbackDesc: string; fallbackImg?: string;
  onChange: (p: { title: string; desc: string; image: string }) => void;
  variant: 'og' | 'twitter';
}) {
  const t = title || fallbackTitle;
  const d = desc || fallbackDesc;
  const img = image || fallbackImg;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{network}</p>
      {/* card preview */}
      <div className={cn('mb-3 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700', variant === 'twitter' && 'rounded-2xl')}>
        {img && <img src={img} alt="" className="h-40 w-full object-cover" />}
        <div className="bg-slate-50 p-3 dark:bg-slate-950">
          <div className="truncate text-[11px] uppercase text-slate-400">transferra.ae</div>
          <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{t}</div>
          <div className="line-clamp-2 text-xs text-slate-500">{d}</div>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input value={title} onChange={(e) => onChange({ title: e.target.value, desc, image })} placeholder="Title (blank = SEO title)" />
        <Input value={image} onChange={(e) => onChange({ title, desc, image: e.target.value })} placeholder="Image URL (blank = cover)" />
      </div>
      <Textarea className="mt-2" value={desc} onChange={(e) => onChange({ title, desc: e.target.value, image })} placeholder="Description (blank = meta description)" />
    </div>
  );
}
