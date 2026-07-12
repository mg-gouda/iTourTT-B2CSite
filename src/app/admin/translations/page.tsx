'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Button, Panel, Field, Input, Textarea, Select, Badge,
  Spinner, EmptyState,
} from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/admin/dialog';
import { Sparkles, Save, Trash2 } from 'lucide-react';

// ── Locales (English is the untranslated base, not listed) ──
const LOCALES: { code: string; label: string }[] = [
  { code: 'ar', label: 'Arabic' },
  { code: 'de', label: 'German' },
  { code: 'fr', label: 'French' },
  { code: 'it', label: 'Italian' },
  { code: 'nl', label: 'Dutch' },
  { code: 'ru', label: 'Russian' },
];

type Entity = 'city_page' | 'blog_post' | 'page_seo' | 'static_page';
type FieldType = 'input' | 'textarea';

interface EntityCfg {
  label: string;
  listPath: string;
  itemId: (it: any) => string;
  itemLabel: (it: any) => string;
  transBase: (id: string) => string;
  fields: { key: string; label: string; type: FieldType }[];
}

const ENTITY_CFG: Record<Entity, EntityCfg> = {
  city_page: {
    label: 'City pages',
    listPath: '/city-pages',
    itemId: (it) => it.cityId ?? it.id,
    itemLabel: (it) => it.cityName ?? it.city?.name ?? it.name ?? it.slug ?? it.cityId ?? it.id,
    transBase: (id) => `/city-pages/${encodeURIComponent(id)}`,
    fields: [
      { key: 'heroHeadline', label: 'Hero headline', type: 'input' },
      { key: 'introText', label: 'Intro text', type: 'textarea' },
      { key: 'contentHtml', label: 'Content (HTML)', type: 'textarea' },
      { key: 'metaTitle', label: 'Meta title', type: 'input' },
      { key: 'metaDescription', label: 'Meta description', type: 'textarea' },
    ],
  },
  blog_post: {
    label: 'Blog posts',
    listPath: '/blog',
    itemId: (it) => it.id,
    itemLabel: (it) => it.title ?? it.slug ?? it.id,
    transBase: (id) => `/blog/${encodeURIComponent(id)}`,
    fields: [
      { key: 'title', label: 'Title', type: 'input' },
      { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { key: 'contentHtml', label: 'Content (HTML)', type: 'textarea' },
      { key: 'metaTitle', label: 'Meta title', type: 'input' },
      { key: 'metaDescription', label: 'Meta description', type: 'textarea' },
    ],
  },
  page_seo: {
    label: 'Page SEO',
    listPath: '/page-seo',
    itemId: (it) => it.pageKey,
    itemLabel: (it) => it.pageKey,
    transBase: (id) => `/page-seo/${encodeURIComponent(id)}`,
    fields: [
      { key: 'metaTitle', label: 'Meta title', type: 'input' },
      { key: 'metaDescription', label: 'Meta description', type: 'textarea' },
    ],
  },
  static_page: {
    label: 'Static pages',
    listPath: '/admin/pages',
    itemId: (it) => it.id,
    itemLabel: (it) => it.title ?? it.slug ?? it.id,
    transBase: (id) => `/admin/pages/${encodeURIComponent(id)}`,
    fields: [
      { key: 'title', label: 'Title', type: 'input' },
      { key: 'content', label: 'Content', type: 'textarea' },
      { key: 'metaTitle', label: 'Meta title', type: 'input' },
      { key: 'metaDescription', label: 'Meta description', type: 'textarea' },
    ],
  },
};

// Translations endpoint may return an array of { locale, ... } or an object keyed by locale.
function pickTranslation(data: any, locale: string): Record<string, any> {
  if (!data) return {};
  if (Array.isArray(data)) return data.find((t) => t?.locale === locale) ?? {};
  if (typeof data === 'object') return data[locale] ?? {};
  return {};
}

export default function TranslationsPage() {
  const [entity, setEntity] = useState<Entity>('city_page');
  const [items, setItems] = useState<any[] | null>(null);
  const [itemId, setItemId] = useState('');
  const [locale, setLocale] = useState('ar');

  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const cfg = ENTITY_CFG[entity];

  // Load items when entity changes.
  useEffect(() => {
    setItems(null);
    setItemId('');
    setForm({});
    api.get<any[]>(cfg.listPath)
      .then((list) => setItems(Array.isArray(list) ? list : []))
      .catch((e) => { toast.error(e.message); setItems([]); });
  }, [entity]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load translation when entity + item + locale are all chosen.
  const loadTranslation = async () => {
    if (!itemId || !locale) return;
    setLoading(true);
    try {
      const data = await api.get<any>(`${cfg.transBase(itemId)}/translations`);
      const t = pickTranslation(data, locale);
      const next: Record<string, string> = {};
      for (const f of cfg.fields) next[f.key] = t[f.key] ?? '';
      setForm(next);
    } catch (e: any) {
      toast.error(e.message);
      const empty: Record<string, string> = {};
      for (const f of cfg.fields) empty[f.key] = '';
      setForm(empty);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId && locale) loadTranslation();
    else setForm({});
  }, [itemId, locale, entity]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!itemId) return;
    setSaving(true);
    try {
      await api.put(`${cfg.transBase(itemId)}/translations/${locale}`, form);
      toast.success('Saved');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!itemId) return;
    try {
      await api.del(`${cfg.transBase(itemId)}/translations/${locale}`);
      toast.success('Translation deleted');
      const empty: Record<string, string> = {};
      for (const f of cfg.fields) empty[f.key] = '';
      setForm(empty);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const autoTranslate = async () => {
    if (!itemId) return;
    setTranslating(true);
    try {
      const res = await api.post<any>('/translate', {
        entity,
        id: itemId,
        locale,
        save: true,
      });
      const t = res && typeof res === 'object' ? res : {};
      const next: Record<string, string> = { ...form };
      for (const f of cfg.fields) if (t[f.key] != null) next[f.key] = t[f.key];
      setForm(next);
      toast.success('Translated with AI & saved');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTranslating(false);
    }
  };

  const selectedItem = items?.find((it) => cfg.itemId(it) === itemId);
  const ready = !!itemId && !!locale;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Translations"
        description="Translate site content into 6 locales. English is the untranslated base."
      />

      <Panel className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Content type">
            <Select value={entity} onChange={(e) => setEntity(e.target.value as Entity)}>
              {(Object.keys(ENTITY_CFG) as Entity[]).map((k) => (
                <option key={k} value={k}>{ENTITY_CFG[k].label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Item">
            {items === null ? (
              <div className="flex h-[38px] items-center px-1"><Spinner /></div>
            ) : (
              <Select value={itemId} onChange={(e) => setItemId(e.target.value)}>
                <option value="">Select…</option>
                {items.map((it, idx) => {
                  const id = cfg.itemId(it);
                  return <option key={id ?? idx} value={id ?? ''}>{cfg.itemLabel(it)}</option>;
                })}
              </Select>
            )}
          </Field>
          <Field label="Locale">
            <Select value={locale} onChange={(e) => setLocale(e.target.value)}>
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>{l.label} ({l.code})</option>
              ))}
            </Select>
          </Field>
        </div>
      </Panel>

      {!ready ? (
        <EmptyState
          title="Pick an item and locale"
          hint="Choose a content type, an item, and a target locale to edit its translation."
        />
      ) : (
        <Panel className="p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="font-medium text-slate-100">
                {selectedItem ? cfg.itemLabel(selectedItem) : itemId}
              </span>
              <Badge tone="sky">{locale}</Badge>
            </div>
            <Button variant="outline" onClick={autoTranslate} disabled={translating || loading}>
              <Sparkles className="h-4 w-4" />
              {translating ? 'Translating…' : 'Auto-translate with AI'}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : (
            <div className="space-y-4">
              {cfg.fields.map((f) => (
                <Field key={f.key} label={f.label}>
                  {f.type === 'textarea' ? (
                    <Textarea
                      value={form[f.key] ?? ''}
                      onChange={(e) => set(f.key, e.target.value)}
                      className={f.key === 'contentHtml' || f.key === 'content' ? 'min-h-48 font-mono text-xs' : ''}
                    />
                  ) : (
                    <Input
                      value={form[f.key] ?? ''}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                  )}
                </Field>
              ))}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <Button variant="danger" onClick={() => setConfirmDel(true)}>
                  <Trash2 className="h-4 w-4" /> Delete translation
                </Button>
                <Button onClick={save} disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </Panel>
      )}

      <ConfirmDialog
        open={confirmDel}
        onOpenChange={setConfirmDel}
        title="Delete translation"
        message={`Delete the ${locale} translation? The page will fall back to the English base.`}
        onConfirm={remove}
      />
    </div>
  );
}
