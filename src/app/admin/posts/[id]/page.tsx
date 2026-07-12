'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api, uploadFile, assetUrl } from '@/lib/admin-api';
import {
  PageHeader, Button, Panel, Field, Input, Textarea, Switch, Label, Spinner,
} from '@/components/admin/ui';
import { RichEditor } from '@/components/admin/rich-editor';
import { ArrowLeft, ImagePlus, Save, X } from 'lucide-react';

interface Category { id: string; name: string }
interface PostForm {
  title: string; slug: string; excerpt: string; coverImageUrl: string;
  contentHtml: string; author: string; status: 'DRAFT' | 'PUBLISHED';
  tags: string[]; categoryIds: string[]; metaTitle: string; metaDescription: string;
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const EMPTY: PostForm = {
  title: '', slug: '', excerpt: '', coverImageUrl: '', contentHtml: '',
  author: '', status: 'DRAFT', tags: [], categoryIds: [], metaTitle: '', metaDescription: '',
};

export default function PostEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const router = useRouter();
  const [form, setForm] = useState<PostForm>(EMPTY);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get<Category[]>('/blog/categories').then(setCats).catch(() => {});
    if (!isNew) {
      api.get<any>(`/blog/${id}`).then((p) => {
        setForm({
          title: p.title ?? '', slug: p.slug ?? '', excerpt: p.excerpt ?? '',
          coverImageUrl: p.coverImageUrl ?? '', contentHtml: p.contentHtml ?? '',
          author: p.author ?? '', status: p.status ?? 'DRAFT',
          tags: p.tags ?? [], categoryIds: (p.categories ?? []).map((c: any) => c.id ?? c.categoryId) ?? [],
          metaTitle: p.metaTitle ?? '', metaDescription: p.metaDescription ?? '',
        });
      }).catch((e) => toast.error(e.message)).finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const set = <K extends keyof PostForm>(k: K, v: PostForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onTitle = (v: string) => {
    set('title', v);
    if (!slugTouched) set('slug', slugify(v));
  };

  const uploadCover = async (file: File) => {
    try {
      const url = await uploadFile('/website-content/upload-image', file);
      set('coverImageUrl', url);
      toast.success('Image uploaded');
    } catch (e: any) { toast.error(e.message); }
  };

  const save = async (publish?: boolean) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const body = { ...form, status: publish ? 'PUBLISHED' : form.status };
    try {
      if (isNew) {
        const created = await api.post<any>('/blog', body);
        toast.success('Post created');
        router.replace(`/admin/posts/${created.id}`);
      } else {
        await api.put(`/blog/${id}`, body);
        toast.success('Saved');
        if (publish) set('status', 'PUBLISHED');
      }
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={isNew ? 'New post' : 'Edit post'}
        actions={
          <>
            <Button variant="ghost" onClick={() => router.push('/admin/posts')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" onClick={() => save(false)} disabled={saving}>
              <Save className="h-4 w-4" /> Save draft
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
            placeholder="Post title"
            className="!text-lg !font-semibold"
          />
          <RichEditor value={form.contentHtml} onChange={(html) => set('contentHtml', html)} />

          <Panel className="p-4">
            <h3 className="mb-3 text-sm font-semibold">SEO</h3>
            <div className="space-y-3">
              <Field label="Meta title" hint={`${form.metaTitle.length}/180`}>
                <Input maxLength={180} value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} />
              </Field>
              <Field label="Meta description" hint={`${form.metaDescription.length}/320`}>
                <Textarea maxLength={320} value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
              </Field>
            </div>
          </Panel>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Panel className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Publish</h3>
            <div className="space-y-3">
              <Switch
                checked={form.status === 'PUBLISHED'}
                onChange={(v) => set('status', v ? 'PUBLISHED' : 'DRAFT')}
                label={form.status === 'PUBLISHED' ? 'Published' : 'Draft'}
              />
              <Field label="Slug">
                <Input
                  value={form.slug}
                  onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }}
                />
              </Field>
              <Field label="Author">
                <Input value={form.author} onChange={(e) => set('author', e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Featured image</h3>
            {form.coverImageUrl ? (
              <div className="relative">
                <img src={assetUrl(form.coverImageUrl)} alt="" className="w-full rounded-lg border border-slate-800" />
                <button
                  onClick={() => set('coverImageUrl', '')}
                  className="absolute right-2 top-2 rounded-md bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-slate-700 py-8 text-slate-400 hover:border-slate-600 hover:text-slate-200"
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
              onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
            />
          </Panel>

          <Panel className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Categories</h3>
            {cats.length === 0 ? (
              <p className="text-xs text-slate-500">No categories yet.</p>
            ) : (
              <div className="space-y-1.5">
                {cats.map((c) => {
                  const on = form.categoryIds.includes(c.id);
                  return (
                    <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() =>
                          set('categoryIds', on
                            ? form.categoryIds.filter((x) => x !== c.id)
                            : [...form.categoryIds, c.id])
                        }
                        className="accent-sky-500"
                      />
                      {c.name}
                    </label>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel className="p-4">
            <Field label="Excerpt" hint="Short summary for listings">
              <Textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} maxLength={500} />
            </Field>
          </Panel>
        </div>
      </div>
    </div>
  );
}
