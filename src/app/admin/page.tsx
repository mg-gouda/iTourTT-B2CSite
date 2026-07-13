'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/admin-api';
import {
  FileText, Files, MapPin, Tag, ArrowUpRight, Puzzle, Search, Languages,
} from 'lucide-react';
import { PageHeader, Panel } from '@/components/admin/ui';

function StatTile({
  label, value, href, icon: Icon,
}: { label: string; value: string; href: string; icon: any }) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, string>>({
    posts: '—', pages: '—', destinations: '—', prices: '—',
  });

  useEffect(() => {
    const load = async () => {
      const len = (v: any) => (Array.isArray(v) ? v.length : Array.isArray(v?.data) ? v.data.length : 0);
      const safe = async (path: string) => {
        try { return String(len(await api.get<any>(path))); } catch { return '—'; }
      };
      const [posts, pages, destinations, prices] = await Promise.all([
        safe('/blog'),
        safe('/admin/pages'),
        safe('/city-pages'),
        safe('/public-prices'),
      ]);
      setCounts({ posts, pages, destinations, prices });
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Dashboard" description="Manage content, pricing and settings for transferra.ae." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Posts" value={counts.posts} href="/admin/posts" icon={FileText} />
        <StatTile label="Pages" value={counts.pages} href="/admin/pages" icon={Files} />
        <StatTile label="Destinations" value={counts.destinations} href="/admin/destinations" icon={MapPin} />
        <StatTile label="Price rows" value={counts.prices} href="/admin/pricing" icon={Tag} />
      </div>

      <Panel className="mt-6 p-5">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Quick actions</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/admin/posts', label: 'Write a post', icon: FileText },
            { href: '/admin/destinations', label: 'Edit a destination', icon: MapPin },
            { href: '/admin/seo', label: 'Update SEO', icon: Search },
            { href: '/admin/pricing', label: 'Adjust pricing', icon: Tag },
            { href: '/admin/extras', label: 'Manage extras', icon: Puzzle },
            { href: '/admin/translations', label: 'Translations', icon: Languages },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary"
              >
                <Icon className="h-4 w-4 text-primary" />
                {a.label}
              </Link>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
