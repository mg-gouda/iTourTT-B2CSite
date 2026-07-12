'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/admin-api';
import {
  FileText, Files, MapPin, Tag, ArrowUpRight, Puzzle, Search, Languages,
} from 'lucide-react';

function StatTile({
  label, value, href, icon: Icon,
}: { label: string; value: string; href: string; icon: any }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700 hover:bg-slate-900/70"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
          <Icon className="h-4 w-4" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-slate-400" />
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </Link>
  );
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, string>>({
    posts: '—', pages: '—', destinations: '—', prices: '—',
  });

  useEffect(() => {
    const load = async () => {
      const safe = async (fn: () => Promise<number>) => {
        try { return String(await fn()); } catch { return '—'; }
      };
      const [posts, pages, destinations, prices] = await Promise.all([
        safe(async () => (await api.get<any[]>('/public/blog')).length),
        safe(async () => (await api.get<any[]>('/public/pages')).length),
        safe(async () => (await api.get<any[]>('/public/city-pages')).length),
        safe(async () => (await api.get<any[]>('/public-prices')).length),
      ]);
      setCounts({ posts, pages, destinations, prices });
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Manage content, pricing and settings for transferra.ae.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Posts" value={counts.posts} href="/admin/posts" icon={FileText} />
        <StatTile label="Pages" value={counts.pages} href="/admin/pages" icon={Files} />
        <StatTile label="Destinations" value={counts.destinations} href="/admin/destinations" icon={MapPin} />
        <StatTile label="Price rows" value={counts.prices} href="/admin/pricing" icon={Tag} />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>
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
                className="flex items-center gap-2.5 rounded-lg border border-slate-800 px-3 py-2.5 text-sm text-slate-300 transition hover:border-slate-700 hover:bg-slate-800"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                {a.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
