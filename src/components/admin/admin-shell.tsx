'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminToken } from '@/lib/admin-api';
import {
  LayoutDashboard, FileText, Files, MapPin, Search, Tag, Puzzle,
  Image as ImageIcon, Languages, Settings, Users, LogOut, Menu, X, ShieldCheck,
  Sun, Moon, Shield,
} from 'lucide-react';

const NAV: { group: string; items: { href: string; label: string; icon: any }[] }[] = [
  { group: '', items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    group: 'Content',
    items: [
      { href: '/admin/posts', label: 'Posts', icon: FileText },
      { href: '/admin/categories', label: 'Categories', icon: Tag },
      { href: '/admin/pages', label: 'Pages', icon: Files },
      { href: '/admin/destinations', label: 'Destinations', icon: MapPin },
      { href: '/admin/media', label: 'Media', icon: ImageIcon },
      { href: '/admin/seo', label: 'SEO', icon: Search },
      { href: '/admin/translations', label: 'Translations', icon: Languages },
    ],
  },
  {
    group: 'Commerce',
    items: [
      { href: '/admin/pricing', label: 'Pricing', icon: Tag },
      { href: '/admin/extras', label: 'Extras', icon: Puzzle },
    ],
  },
  {
    group: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/permissions', label: 'Permissions', icon: Shield },
    ],
  },
];

const THEME_KEY = 'b2c_admin_theme';
export function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('b2c_admin_user');
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    const t = (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'dark';
    setTheme(t);
    applyTheme(t);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  };

  const logout = () => {
    adminToken.clear();
    localStorage.removeItem('b2c_admin_user');
    router.push('/admin/login');
  };

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 transform border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 ring-1 ring-sky-400/30">
            <ShieldCheck className="h-4 w-4 text-sky-500 dark:text-sky-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Transferra Admin</span>
        </div>
        <nav className="scrollbar-thin h-[calc(100vh-3.5rem)] overflow-y-auto px-3 py-3">
          {NAV.map((section, i) => (
            <div key={i} className="mb-4">
              {section.group && (
                <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.group}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
                      active
                        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <button className="lg:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link href="/admin/account" className="rounded-lg px-2 py-1 text-right leading-tight transition hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="text-sm font-medium">{user?.name ?? 'Admin'}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</div>
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
