'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, uploadFile, assetUrl } from '@/lib/admin-api';
import {
  PageHeader, Button, Panel, Field, Input, Textarea, Switch, Spinner,
} from '@/components/admin/ui';
import { RichEditor } from '@/components/admin/rich-editor';
import { TranslationPanel } from '@/components/admin/translation-panel';
import { SeoPanel, type SeoMeta } from '@/components/admin/seo-panel';
import { ArrowLeft, ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';

interface BodySection { heading: string; body: string }
interface FaqItem { question: string; answer: string }
interface CityPageForm {
  slug: string;
  isPublished: boolean;
  showInMenu: boolean;
  menuOrder: number;
  heroHeadline: string;
  heroImageUrl: string;
  introText: string;
  contentHtml: string;
  bodyJson: BodySection[];
  faqJson: FaqItem[];
  metaTitle: string;
  metaDescription: string;
  seo: SeoMeta;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const EMPTY: CityPageForm = {
  slug: '', isPublished: false, showInMenu: false, menuOrder: 0,
  heroHeadline: '', heroImageUrl: '', introText: '', contentHtml: '',
  bodyJson: [], faqJson: [], metaTitle: '', metaDescription: '',
  seo: { schemaType: 'Article' },
};

function findCityName(tree: any[], id: string): string | null {
  for (const n of tree ?? []) {
    if (n.type === 'CITY' && n.id === id) return n.name;
    if (n.children) {
      const hit = findCityName(n.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

export default function CityPageEditor() {
  const { cityId } = useParams<{ cityId: string }>();
  const router = useRouter();
  const [form, setForm] = useState<CityPageForm>(EMPTY);
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Resolve the city name from the location tree for the header.
    api.get<any[]>('/public/locations')
      .then((t) => setCityName(findCityName(t, cityId) ?? ''))
      .catch(() => {});

    api.get<any>(`/city-pages/${cityId}`)
      .then((p) => {
        if (!p) return;
        setForm({
          slug: p.slug ?? '', isPublished: !!p.isPublished, showInMenu: !!p.showInMenu,
          menuOrder: p.menuOrder ?? 0, heroHeadline: p.heroHeadline ?? '',
          heroImageUrl: p.heroImageUrl ?? '', introText: p.introText ?? '',
          contentHtml: p.contentHtml ?? '',
          bodyJson: Array.isArray(p.bodyJson) ? p.bodyJson : [],
          faqJson: Array.isArray(p.faqJson) ? p.faqJson : [],
          metaTitle: p.metaTitle ?? '', metaDescription: p.metaDescription ?? '',
          seo: p.seo ?? { schemaType: 'Article' },
        });
      })
      .catch((e: any) => {
        // No page yet for this city → start blank (404 is expected).
        if (e?.status !== 404) toast.error(e.message);
      })
      .finally(() => setLoading(false));
  }, [cityId]);

  const set = <K extends keyof CityPageForm>(k: K, v: CityPageForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const uploadHero = async (file: File) => {
    try {
      const url = await uploadFile('/website-content/upload-image', file);
      set('heroImageUrl', url);
      toast.success('Image uploaded');
    } catch (e: any) { toast.error(e.message); }
  };

  // Body sections repeater
  const addBody = () => set('bodyJson', [...form.bodyJson, { heading: '', body: '' }]);
  const setBody = (i: number, k: keyof BodySection, v: string) =>
    set('bodyJson', form.bodyJson.map((b, idx) => (idx === i ? { ...b, [k]: v } : b)));
  const removeBody = (i: number) => set('bodyJson', form.bodyJson.filter((_, idx) => idx !== i));

  // FAQ repeater
  const addFaq = () => set('faqJson', [...form.faqJson, { question: '', answer: '' }]);
  const setFaq = (i: number, k: keyof FaqItem, v: string) =>
    set('faqJson', form.faqJson.map((q, idx) => (idx === i ? { ...q, [k]: v } : q)));
  const removeFaq = (i: number) => set('faqJson', form.faqJson.filter((_, idx) => idx !== i));

  const save = async (publish?: boolean) => {
    setSaving(true);
    const body = {
      ...form,
      slug: form.slug || slugify(cityName),
      isPublished: publish ? true : form.isPublished,
      menuOrder: Number(form.menuOrder) || 0,
    };
    try {
      await api.put(`/city-pages/${cityId}`, body);
      toast.success('Saved');
      if (publish) set('isPublished', true);
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={cityName ? `${cityName} page` : 'City page'}
        description="Destination landing page"
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/admin/destinations')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={() => save(false)} disabled={saving}>
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button onClick={() => save(true)} disabled={saving}>Publish</Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          <Input
            value={form.heroHeadline}
            onChange={(e) => set('heroHeadline', e.target.value)}
            placeholder="Hero headline"
            className="!text-lg !font-semibold"
          />

          <Panel className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Hero image</h3>
            {form.heroImageUrl ? (
              <div className="relative">
                <img src={assetUrl(form.heroImageUrl)} alt="" className="w-full rounded-lg border border-slate-200 dark:border-slate-800" />
                <button
                  onClick={() => set('heroImageUrl', '')}
                  className="absolute right-2 top-2 rounded-md bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-8 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">Upload image</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadHero(e.target.files[0])}
            />
          </Panel>

          <Panel className="p-4">
            <Field label="Intro text" hint="Short lead paragraph under the hero">
              <Textarea value={form.introText} onChange={(e) => set('introText', e.target.value)} />
            </Field>
          </Panel>

          <RichEditor value={form.contentHtml} onChange={(html) => set('contentHtml', html)} />

          {/* Body sections repeater */}
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Body sections</h3>
              <Button variant="outline" onClick={addBody} className="h-8 px-2 py-1">
                <Plus className="h-4 w-4" /> Add section
              </Button>
            </div>
            {form.bodyJson.length === 0 ? (
              <p className="text-xs text-slate-500">No sections yet.</p>
            ) : (
              <div className="space-y-3">
                {form.bodyJson.map((b, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Input
                        value={b.heading}
                        onChange={(e) => setBody(i, 'heading', e.target.value)}
                        placeholder="Section heading"
                      />
                      <button
                        onClick={() => removeBody(i)}
                        className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-400"
                        title="Remove section"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Textarea
                      value={b.body}
                      onChange={(e) => setBody(i, 'body', e.target.value)}
                      placeholder="Section body"
                    />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* FAQ repeater */}
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">FAQ</h3>
              <Button variant="outline" onClick={addFaq} className="h-8 px-2 py-1">
                <Plus className="h-4 w-4" /> Add question
              </Button>
            </div>
            {form.faqJson.length === 0 ? (
              <p className="text-xs text-slate-500">No questions yet.</p>
            ) : (
              <div className="space-y-3">
                {form.faqJson.map((q, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Input
                        value={q.question}
                        onChange={(e) => setFaq(i, 'question', e.target.value)}
                        placeholder="Question"
                      />
                      <button
                        onClick={() => removeFaq(i)}
                        className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-400"
                        title="Remove question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <Textarea
                      value={q.answer}
                      onChange={(e) => setFaq(i, 'answer', e.target.value)}
                      placeholder="Answer"
                    />
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* SEO */}
          <SeoPanel
            content={{
              title: form.heroHeadline || cityName,
              contentHtml: form.contentHtml,
              author: '',
              coverImageUrl: form.heroImageUrl ? assetUrl(form.heroImageUrl) : '',
            }}
            metaTitle={form.metaTitle}
            metaDescription={form.metaDescription}
            slug={form.slug}
            onMeta={(patch) => setForm((f) => ({ ...f, ...patch }))}
            seo={form.seo}
            onSeo={(patch) => setForm((f) => ({ ...f, seo: { ...f.seo, ...patch } }))}
            pathPrefix="/transfers/"
          />

          <TranslationPanel
            entity="city_page"
            basePath={`/city-pages/${cityId}`}
            id={cityId as string}
            fields={[
              { key: 'heroHeadline', label: 'Hero headline', type: 'input' },
              { key: 'introText', label: 'Intro text', type: 'textarea' },
              { key: 'contentHtml', label: 'Content', type: 'html' },
              { key: 'metaTitle', label: 'Meta title', type: 'input' },
              { key: 'metaDescription', label: 'Meta description', type: 'textarea' },
            ]}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Panel className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Publish</h3>
            <div className="space-y-3">
              <Switch
                checked={form.isPublished}
                onChange={(v) => set('isPublished', v)}
                label={form.isPublished ? 'Published' : 'Draft'}
              />
              <Field label="Slug">
                <Input
                  value={form.slug}
                  onChange={(e) => set('slug', slugify(e.target.value))}
                  placeholder={slugify(cityName)}
                />
              </Field>
            </div>
          </Panel>

          <Panel className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Menu</h3>
            <div className="space-y-3">
              <Switch
                checked={form.showInMenu}
                onChange={(v) => set('showInMenu', v)}
                label={form.showInMenu ? 'Shown in menu' : 'Hidden from menu'}
              />
              <Field label="Menu order">
                <Input
                  type="number"
                  value={String(form.menuOrder)}
                  onChange={(e) => set('menuOrder', Number(e.target.value))}
                />
              </Field>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
