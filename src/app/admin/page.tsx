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
      className="group border border-[#c3c4c7] bg-white p-4 transition hover:border-[#2271b1]"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-[#e5f0f8] text-[#2271b1]">
          <Icon className="h-4 w-4" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-[#8c8f94]" />
      </div>
      <div className="mt-3 text-2xl font-semibold tabular-nums text-[#1d2327]">{value}</div>
      <div className="text-xs text-[#646970]">{label}</div>
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
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="wp-heading-inline">Dashboard</h1>
        <p className="wp-subtitle">Manage content, pricing and settings for transferra.ae.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Posts" value={counts.posts} href="/admin/posts" icon={FileText} />
        <StatTile label="Pages" value={counts.pages} href="/admin/pages" icon={Files} />
        <StatTile label="Destinations" value={counts.destinations} href="/admin/destinations" icon={MapPin} />
        <StatTile label="Price rows" value={counts.prices} href="/admin/pricing" icon={Tag} />
      </div>

      <div className="border border-[#c3c4c7] bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-[#1d2327]">Quick actions</h2>
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
                className="flex items-center gap-2.5 border border-[#c3c4c7] bg-white px-3 py-2.5 text-sm text-[#2271b1] transition hover:border-[#2271b1] hover:bg-[#f6f7f7]"
              >
                <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                {a.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
