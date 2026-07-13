'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Button, Table, THead, TH, TR, TD, Badge, EmptyState, Spinner,
} from '@/components/admin/ui';
import { ConfirmDialog } from '@/components/admin/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface StaticPage {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  updatedAt: string;
}

export default function PagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<StaticPage[] | null>(null);
  const [del, setDel] = useState<StaticPage | null>(null);

  const load = () =>
    api.get<StaticPage[]>('/admin/pages').then(setPages).catch((e) => {
      toast.error(e.message);
      setPages([]);
    });
  useEffect(() => { load(); }, []);

  const remove = async (p: StaticPage) => {
    await api.del(`/admin/pages/${p.id}`);
    toast.success('Page deleted');
    load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Pages"
        description="Static pages for transferra.ae"
        actions={
          <Link href="/admin/pages/new">
            <Button><Plus className="h-4 w-4" /> New page</Button>
          </Link>
        }
      />

      {pages === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : pages.length === 0 ? (
        <EmptyState title="No pages yet" hint="Create your first static page to get started." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Title</TH>
              <TH className="w-28">Status</TH>
              <TH className="w-40">Updated</TH>
              <TH className="w-28 text-right">Actions</TH>
            </tr>
          </THead>
          <tbody>
            {pages.map((p) => (
              <TR key={p.id}>
                <TD>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{p.title}</div>
                  <div className="text-xs text-slate-500">/{p.slug}</div>
                </TD>
                <TD>
                  <Badge tone={p.isPublished ? 'green' : 'amber'}>
                    {p.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </TD>
                <TD className="text-xs">{new Date(p.updatedAt).toLocaleDateString()}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="Edit"
                      onClick={() => router.push(`/admin/pages/${p.id}`)}
                      className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => setDel(p)}
                      className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}

      <ConfirmDialog
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        title="Delete page"
        message={`Delete "${del?.title}"? This cannot be undone.`}
        onConfirm={() => del && remove(del)}
      />
    </div>
  );
}
