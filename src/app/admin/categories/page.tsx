'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Button, Table, THead, TH, TR, TD, Field, Input, EmptyState, Spinner,
} from '@/components/admin/ui';
import { Modal, ConfirmDialog } from '@/components/admin/dialog';
import { TranslationPanel } from '@/components/admin/translation-panel';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Category { id: string; name: string; slug?: string }

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[] | null>(null);
  const [edit, setEdit] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [del, setDel] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '' });

  const load = () =>
    api.get<Category[]>('/blog/categories').then(setCats).catch((e) => { toast.error(e.message); setCats([]); });
  useEffect(() => { load(); }, []);

  const openNew = () => { setEdit(null); setForm({ name: '', slug: '' }); setOpen(true); };
  const openEdit = (c: Category) => { setEdit(c); setForm({ name: c.name, slug: c.slug ?? '' }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    try {
      if (edit) await api.put(`/blog/categories/${edit.id}`, form);
      else await api.post('/blog/categories', form);
      toast.success('Saved');
      setOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (c: Category) => {
    await api.del(`/blog/categories/${c.id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Categories"
        description="Blog post categories"
        actions={<Button onClick={openNew}><Plus className="h-4 w-4" /> New category</Button>}
      />

      {cats === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : cats.length === 0 ? (
        <EmptyState title="No categories yet" hint="Create one to group your posts." />
      ) : (
        <Table>
          <THead>
            <tr><TH>Name</TH><TH className="w-48">Slug</TH><TH className="w-20 text-right">·</TH></tr>
          </THead>
          <tbody>
            {cats.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium text-slate-900 dark:text-slate-100">{c.name}</TD>
                <TD className="text-xs text-slate-500">/{c.slug}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(c)} className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDel(c)} className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={open} onOpenChange={setOpen} title={edit ? 'Edit category' : 'New category'}>
        <div className="space-y-3">
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ name: e.target.value, slug: f.slug || slugify(e.target.value) }))}
            />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} />
          </Field>
        </div>
        {edit && (
          <div className="mt-4">
            <TranslationPanel
              entity="blog_category"
              basePath={`/blog-categories/${edit.id}`}
              id={edit.id}
              fields={[{ key: 'name', label: 'Name', type: 'input' }]}
            />
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={save}>Save</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        title="Delete category"
        message={`Delete "${del?.name}"?`}
        onConfirm={() => del && remove(del)}
      />
    </div>
  );
}
