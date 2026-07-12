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
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  author?: string;
}

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [del, setDel] = useState<BlogPost | null>(null);

  const load = () =>
    api.get<BlogPost[]>('/blog').then(setPosts).catch((e) => {
      toast.error(e.message);
      setPosts([]);
    });
  useEffect(() => { load(); }, []);

  const remove = async (p: BlogPost) => {
    await api.del(`/blog/${p.id}`);
    toast.success('Post deleted');
    load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Posts"
        description="Blog articles for transferra.ae"
        actions={
          <Link href="/admin/posts/new">
            <Button><Plus className="h-4 w-4" /> New post</Button>
          </Link>
        }
      />

      {posts === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : posts.length === 0 ? (
        <EmptyState title="No posts yet" hint="Write your first article to get started." />
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
            {posts.map((p) => (
              <TR key={p.id}>
                <TD>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{p.title}</div>
                  <div className="text-xs text-slate-500">/{p.slug}</div>
                </TD>
                <TD>
                  <Badge tone={p.status === 'PUBLISHED' ? 'green' : 'amber'}>
                    {p.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </Badge>
                </TD>
                <TD className="text-xs">{new Date(p.updatedAt).toLocaleDateString()}</TD>
                <TD>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      title="Edit"
                      onClick={() => router.push(`/admin/posts/${p.id}`)}
                      className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#135e96]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <a
                      title="View"
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
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
        title="Delete post"
        message={`Delete "${del?.title}"? This cannot be undone.`}
        onConfirm={() => del && remove(del)}
      />
    </div>
  );
}
