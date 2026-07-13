'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminToken, api } from '@/lib/admin-api';
import {
  LayoutDashboard, FileText, Files, MapPin, Search, Tag, Puzzle,
  Image as ImageIcon, Languages, Settings, Users, Shield, Sparkles,
  Plus, LogOut, ChevronLeft, ChevronRight, Menu as MenuIcon, X,
  Sun, Moon, ExternalLink, UserCircle,
} from 'lucide-react';
import { cn } from './ui';

type NavItem = { href: string; label: string; icon: any; perm?: string };
type NavGroupDef = { title: string; items: NavItem[]; footer?: boolean };

// Grouped sidebar (iTour Reservations LITE style).
const GROUPS: NavGroupDef[] = [
  { title: 'Overview', items: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  ] },
  { title: 'Content', items: [
    { href: '/admin/posts', label: 'Posts', icon: FileText, perm: 'website-content.blog' },
    { href: '/admin/categories', label: 'Categories', icon: Tag, perm: 'website-content.blog' },
    { href: '/admin/pages', label: 'Pages', icon: Files, perm: 'website-content.pages' },
    { href: '/admin/destinations', label: 'Destinations', icon: MapPin, perm: 'website-content.cityPages' },
    { href: '/admin/media', label: 'Media', icon: ImageIcon, perm: 'website-content' },
  ] },
  { title: 'Marketing', items: [
    { href: '/admin/seo', label: 'SEO', icon: Search, perm: 'website-content.pageSeo' },
    { href: '/admin/translations', label: 'Translations', icon: Languages, perm: 'website-content' },
    { href: '/admin/ai-visibility', label: 'AI Visibility', icon: Sparkles, perm: 'website-content' },
  ] },
  { title: 'Commerce', items: [
    { href: '/admin/pricing', label: 'Pricing', icon: Tag, perm: 'public-prices' },
    { href: '/admin/extras', label: 'Extras', icon: Puzzle, perm: 'extras' },
  ] },
  { title: 'System', footer: true, items: [
    { href: '/admin/settings', label: 'Settings', icon: Settings, perm: 'company' },
    { href: '/admin/users', label: 'Users', icon: Users, perm: 'users' },
    { href: '/admin/permissions', label: 'Permissions', icon: Shield, perm: 'users.roles' },
  ] },
];

// New-post/page quick links for the "+ New" menu.
const NEW_LINKS = [
  { href: '/admin/posts/new', label: 'Post', perm: 'website-content.blog' },
  { href: '/admin/pages/new', label: 'Page', perm: 'website-content.pages' },
];

const THEME_KEY = 'b2c_admin_theme';

/** Slate/sky admin theme — scoped to <html> so the public site is untouched.
 * `.itour-admin` overrides the shadcn token VALUES (higher specificity than the
 * public `.dark` block), while `.dark` is toggled so page-level `dark:` utility
 * variants (bg-white dark:bg-slate-900, …) resolve to their slate variants. */
export function applyTheme(theme: 'light' | 'dark') {
  const html = document.documentElement;
  html.classList.add('itour-admin');
  html.classList.toggle('dark', theme === 'dark');
  html.classList.toggle('theme-light', theme === 'light');
}

function NavGroup({
  title, items, collapsed, pathname, onNavigate,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
  pathname: string;
  onNavigate: () => void;
}) {
  if (items.length === 0) return null;
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/');
  return (
    <div className={cn('py-1', collapsed ? 'px-1' : 'px-2')}>
      {!collapsed
        ? <p className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">{title}</p>
        : <div className="pb-1 pt-3" />}
      <nav className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-md transition-colors',
                collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-2.5 py-2 text-sm',
                active
                  ? 'bg-primary/15 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              <Icon className={cn('shrink-0', collapsed ? 'size-5' : 'size-4')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [perms, setPerms] = useState<Set<string> | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('b2c_admin_user');
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setCollapsed(localStorage.getItem('b2c_admin_folded') === '1');
    const t = (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'dark';
    setTheme(t);
    applyTheme(t);
    api.get<{ permissionKeys: string[] }>('/permissions/mine')
      .then((r) => setPerms(new Set(r?.permissionKeys ?? [])))
      .catch(() => setPerms(new Set()));
  }, []);

  const canSee = (perm?: string) => !perm || (perms?.has(perm) ?? false);
  const groups = GROUPS
    .map((g) => ({ ...g, items: g.items.filter((i) => canSee(i.perm)) }))
    .filter((g) => g.items.length > 0);
  const mainGroups = groups.filter((g) => !g.footer);
  const footerGroups = groups.filter((g) => g.footer);
  const newLinks = NEW_LINKS.filter((i) => canSee(i.perm));

  const toggleCollapsed = () => {
    setCollapsed((v) => { localStorage.setItem('b2c_admin_folded', v ? '0' : '1'); return !v; });
  };
  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
      return next;
    });
  };
  const logout = () => {
    adminToken.clear();
    localStorage.removeItem('b2c_admin_user');
    router.push('/admin/login');
  };

  const navProps = { pathname, onNavigate: () => setMobileOpen(false) };

  const sidebar = (drawer = false) => (
    <div className="flex h-full flex-col">
      {/* Brand header — same height as topbar */}
      <div className={cn(
        'flex h-14 shrink-0 items-center border-b border-border',
        collapsed && !drawer ? 'justify-center px-2' : 'gap-2 px-3',
      )}>
        {collapsed && !drawer ? (
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">T</div>
        ) : (
          <Link href="/admin" className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">T</div>
            <span className="truncate text-sm font-semibold text-foreground">Transferra</span>
          </Link>
        )}
        {!drawer && (
          <button
            onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        )}
        {drawer && (
          <button onClick={() => setMobileOpen(false)} className="shrink-0 p-1 text-muted-foreground">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Scrollable nav groups */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {mainGroups.map((g) => (
          <NavGroup key={g.title} title={g.title} items={g.items} collapsed={collapsed && !drawer} {...navProps} />
        ))}
      </div>

      {/* Pinned footer groups (System) */}
      {footerGroups.length > 0 && (
        <div className="shrink-0 border-t border-border">
          {footerGroups.map((g) => (
            <NavGroup key={g.title} title={g.title} items={g.items} collapsed={collapsed && !drawer} {...navProps} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 border-r border-border bg-slate-200 dark:bg-card transition-[width] duration-200 ease-out md:block',
          collapsed ? 'w-14' : 'w-60',
        )}
      >
        {sidebar(false)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-border bg-slate-200 dark:bg-card shadow-xl animate-fade-in">
            {sidebar(true)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-slate-100/95 dark:bg-card/95 px-3 backdrop-blur-sm sm:px-5">
          <button
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon className="size-5" />
          </button>

          <span className="hidden text-sm font-semibold text-foreground sm:block">Transferra Admin</span>

          <div className="ml-auto flex shrink-0 items-center gap-1">
            {/* New menu */}
            {newLinks.length > 0 && (
              <div className="relative" onMouseLeave={() => setNewOpen(false)}>
                <button
                  onClick={() => setNewOpen((o) => !o)}
                  onMouseEnter={() => setNewOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <Plus className="size-4" /> New
                </button>
                {newOpen && (
                  <div className="absolute right-0 top-10 z-50 min-w-36 overflow-hidden rounded-md border border-border bg-popover py-1 shadow-lg animate-fade-in">
                    {newLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setNewOpen(false)}
                        className="block px-3 py-1.5 text-sm text-popover-foreground hover:bg-secondary"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Link
              href="/"
              target="_blank"
              title="View site"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ExternalLink className="size-4" />
            </Link>

            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            <div className="mx-1 hidden text-right sm:block">
              <p className="text-xs font-medium leading-tight text-foreground">{user?.name ?? 'Admin'}</p>
            </div>
            <Link href="/admin/account" title="My account"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
              <UserCircle className="size-4" />
            </Link>
            <button
              onClick={logout}
              aria-label="Log out"
              title="Log Out"
              className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>

        <footer className="flex h-14 shrink-0 flex-wrap items-center justify-end gap-3 border-t border-border bg-slate-100/95 dark:bg-card/95 px-5 text-xs text-muted-foreground backdrop-blur-sm">
          <span>Transferra Admin</span>
          <span className="text-border">|</span>
          <span>
            Developed by{" "}
            <a href="https://wa.me/+201002805139" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Mohamed Gouda
            </a>
          </span>
          <span className="text-border">|</span>
          <span>iTour B2C</span>
        </footer>
      </div>
    </div>
  );
}
