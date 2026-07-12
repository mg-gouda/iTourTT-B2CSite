'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Button, Table, THead, TH, TR, TD, Field, Input, Textarea,
  EmptyState, Spinner,
} from '@/components/admin/ui';
import { Modal } from '@/components/admin/dialog';
import { Pencil } from 'lucide-react';

interface PageSeo {
  pageKey: string;
  metaTitle: string | null;
  metaDescription: string | null;
}

export default function SeoPage() {
  const [rows, setRows] = useState<PageSeo[] | null>(null);
  const [editing, setEditing] = useState<PageSeo | null>(null);

  const load = () =>
    api.get<PageSeo[]>('/page-seo').then(setRows).catch((e) => {
      toast.error(e.message);
      setRows([]);
    });
  useEffect(() => { load(); }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="SEO"
        description="Per-page meta title & description overrides for transferra.ae."
      />

      {rows === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No page SEO entries" hint="Page SEO overrides appear here once pages are created." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH className="w-52">Page</TH>
              <TH>Meta title</TH>
              <TH>Meta description</TH>
              <TH className="w-16 text-right">·</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.pageKey}>
                <TD>
                  <span className="font-medium text-slate-100">{r.pageKey}</span>
                </TD>
                <TD>
                  <span className="line-clamp-1 text-slate-300">
                    {r.metaTitle || <span className="text-slate-600">—</span>}
                  </span>
                </TD>
                <TD>
                  <span className="line-clamp-1 text-xs text-slate-400">
                    {r.metaDescription || <span className="text-slate-600">—</span>}
                  </span>
                </TD>
                <TD>
                  <div className="flex justify-end">
                    <button
                      title="Edit"
                      onClick={() => setEditing(r)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-sky-400"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}

      <EditSeoModal
        row={editing}
        onOpenChange={(v) => !v && setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
    </div>
  );
}

function EditSeoModal({
  row, onOpenChange, onSaved,
}: {
  row: PageSeo | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMetaTitle(row?.metaTitle ?? '');
    setMetaDescription(row?.metaDescription ?? '');
  }, [row]);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    try {
      await api.put(`/page-seo/${encodeURIComponent(row.pageKey)}`, {
        metaTitle,
        metaDescription,
      });
      toast.success('Saved');
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={!!row}
      onOpenChange={onOpenChange}
      title={row ? `Edit SEO — ${row.pageKey}` : 'Edit SEO'}
      description="Overrides the default meta tags for this page."
      size="lg"
    >
      <div className="space-y-4">
        <Field label="Meta title" hint={`${metaTitle.length}/180`}>
          <Input
            value={metaTitle}
            maxLength={180}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Page meta title"
          />
        </Field>
        <Field label="Meta description" hint={`${metaDescription.length}/320`}>
          <Textarea
            value={metaDescription}
            maxLength={320}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Page meta description"
            className="min-h-28"
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={save} disabled={saving}>Save</Button>
      </div>
    </Modal>
  );
}
