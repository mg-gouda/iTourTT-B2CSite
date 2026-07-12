'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Button, Panel, Field, Input, Switch, Spinner,
} from '@/components/admin/ui';
import { RichEditor } from '@/components/admin/rich-editor';
import { TranslationPanel } from '@/components/admin/translation-panel';
import { SeoPanel, type SeoMeta } from '@/components/admin/seo-panel';
import { ArrowLeft, Save } from 'lucide-react';

interface PageForm {
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  menuOrder: number;
  metaTitle: string;
  metaDescription: string;
  seo: SeoMeta;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const EMPTY: PageForm = {
  title: '', slug: '', content: '', isPublished: false,
  showInNav: false, showInFooter: false, menuOrder: 0,
  metaTitle: '', metaDescription: '',
  seo: { schemaType: 'Article' },
};

export default function PageEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const router = useRouter();
  const [form, setForm] = useState<PageForm>(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      api.get<Partial<PageForm>>(`/admin/pages/${id}`).then((p) => {
        setForm({
          title: p.title ?? '', slug: p.slug ?? '', content: p.content ?? '',
          isPublished: p.isPublished ?? false, showInNav: p.showInNav ?? false,
          showInFooter: p.showInFooter ?? false, menuOrder: p.menuOrder ?? 0,
          metaTitle: p.metaTitle ?? '', metaDescription: p.metaDescription ?? '',
          seo: p.seo ?? { schemaType: 'Article' },
        });
      }).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const set = <K extends keyof PageForm>(k: K, v: PageForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onTitle = (v: string) => {
    set('title', v);
    if (!slugTouched) set('slug', slugify(v));
  };

  const save = async (publish?: boolean) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const body = { ...form, isPublished: publish ? true : form.isPublished };
    try {
      if (isNew) {
        const created = await api.post<{ id: string }>('/admin/pages', body);
        toast.success('Page created');
        router.replace(`/admin/pages/${created.id}`);
      } else {
        await api.put(`/admin/pages/${id}`, body);
        toast.success('Saved');
        if (publish) set('isPublished', true);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={isNew ? 'New page' : 'Edit page'}
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/admin/pages')}>
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
            value={form.title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="Page title"
            className="!text-lg !font-semibold"
          />
          <RichEditor value={form.content} onChange={(html) => set('content', html)} />

          <SeoPanel
            content={{ title: form.title, contentHtml: form.content, author: '', coverImageUrl: '' }}
            metaTitle={form.metaTitle}
            metaDescription={form.metaDescription}
            slug={form.slug}
            onMeta={(patch) => {
              if (patch.slug !== undefined) setSlugTouched(true);
              setForm((f) => ({ ...f, ...patch }));
            }}
            seo={form.seo}
            onSeo={(patch) => setForm((f) => ({ ...f, seo: { ...f.seo, ...patch } }))}
            pathPrefix="/"
          />

          <TranslationPanel
            entity="static_page"
            basePath={`/admin/pages/${id}`}
            id={id as string}
            disabled={isNew}
            disabledHint="Save the page first, then add translations for each language."
            fields={[
              { key: 'title', label: 'Title', type: 'input' },
              { key: 'content', label: 'Content', type: 'html' },
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
                  onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }}
                />
              </Field>
              <Switch
                checked={form.showInNav}
                onChange={(v) => set('showInNav', v)}
                label="Show in navigation"
              />
              <Switch
                checked={form.showInFooter}
                onChange={(v) => set('showInFooter', v)}
                label="Show in footer"
              />
              <Field label="Menu order">
                <Input
                  type="number"
                  value={form.menuOrder}
                  onChange={(e) => set('menuOrder', Number(e.target.value) || 0)}
                />
              </Field>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
