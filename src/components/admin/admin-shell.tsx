'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminToken, api } from '@/lib/admin-api';
import {
  LayoutDashboard, FileText, Files, MapPin, Search, Tag, Puzzle,
  Image as ImageIcon, Languages, Settings, Users, Shield, Sparkles,
  Plus, LogOut, ChevronsLeft, ChevronsRight, Menu as MenuIcon,
} from 'lucide-react';

type NavItem = { href: string; label: string; icon: any; perm?: string };
// WordPress-style menu. `sep: true` inserts a divider before the item.
const NAV: (NavItem & { sep?: boolean })[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Posts', icon: FileText, perm: 'website-content.blog', sep: true },
  { href: '/admin/categories', label: 'Categories', icon: Tag, perm: 'website-content.blog' },
  { href: '/admin/pages', label: 'Pages', icon: Files, perm: 'website-content.pages' },
  { href: '/admin/destinations', label: 'Destinations', icon: MapPin, perm: 'website-content.cityPages' },
  { href: '/admin/media', label: 'Media', icon: ImageIcon, perm: 'website-content' },
  { href: '/admin/seo', label: 'SEO', icon: Search, perm: 'website-content.pageSeo' },
  { href: '/admin/translations', label: 'Translations', icon: Languages, perm: 'website-content' },
  { href: '/admin/ai-visibility', label: 'AI Visibility', icon: Sparkles, perm: 'website-content' },
  { href: '/admin/pricing', label: 'Pricing', icon: Tag, perm: 'public-prices', sep: true },
  { href: '/admin/extras', label: 'Extras', icon: Puzzle, perm: 'extras' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, perm: 'company', sep: true },
  { href: '/admin/users', label: 'Users', icon: Users, perm: 'users' },
  { href: '/admin/permissions', label: 'Permissions', icon: Shield, perm: 'users.roles' },
];

// New-post/page quick links for the "+ New" admin-bar menu.
const NEW_LINKS = [
  { href: '/admin/posts/new', label: 'Post', perm: 'website-content.blog' },
  { href: '/admin/pages/new', label: 'Page', perm: 'website-content.pages' },
];

const THEME_KEY = 'b2c_admin_theme';
export function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [perms, setPerms] = useState<Set<string> | null>(null);
  const [folded, setFolded] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('b2c_admin_user');
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
    setFolded(localStorage.getItem('b2c_admin_folded') === '1');
    applyTheme('light'); // wp-admin default scheme is light content
    api.get<{ permissionKeys: string[] }>('/permissions/mine')
      .then((r) => setPerms(new Set(r?.permissionKeys ?? [])))
      .catch(() => setPerms(new Set()));
  }, []);

  const canSee = (perm?: string) => !perm || (perms?.has(perm) ?? false);
  const nav = NAV.filter((i) => canSee(i.perm));
  const newLinks = NEW_LINKS.filter((i) => canSee(i.perm));

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const toggleFold = () => {
    const v = !folded; setFolded(v);
    localStorage.setItem('b2c_admin_folded', v ? '1' : '0');
  };
  const logout = () => {
    adminToken.clear();
    localStorage.removeItem('b2c_admin_user');
    router.push('/admin/login');
  };

  return (
    <div className="wpwrap wp-shell">
      {/* Admin bar */}
      <div className="wp-adminbar">
        <button className="ab-item" onClick={toggleFold} title="Collapse menu">
          <MenuIcon />
        </button>
        <Link href="/" target="_blank" className="ab-item ab-site">Transferra</Link>
        {newLinks.length > 0 && (
          <div style={{ position: 'relative', display: 'flex' }}
               onMouseLeave={() => setNewOpen(false)}>
            <button className="ab-item" onClick={() => setNewOpen((o) => !o)} onMouseEnter={() => setNewOpen(true)}>
              <Plus /> New
            </button>
            {newOpen && (
              <div style={{ position: 'absolute', top: 32, left: 0, minWidth: 140, background: '#2c3338', boxShadow: '0 3px 5px rgba(0,0,0,.2)', zIndex: 100000 }}>
                {newLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="ab-item" style={{ display: 'flex', width: '100%' }}>{l.label}</Link>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="ab-right">
          <span className="ab-item">Howdy, {user?.name ?? 'Admin'}</span>
          <button className="ab-item" onClick={logout} title="Log Out"><LogOut /> Log Out</button>
        </div>
      </div>

      {/* Admin menu */}
      <div className={`wp-adminmenu${folded ? ' folded' : ''}`}>
        <nav style={{ paddingTop: 4 }}>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.href}>
                {item.sep && <div className="wp-menu-sep" />}
                <Link
                  href={item.href}
                  title={item.label}
                  className={`wp-menu-item${isActive(item.href) ? ' current' : ''}`}
                >
                  <Icon /><span>{item.label}</span>
                </Link>
              </div>
            );
          })}
          <div className="wp-menu-sep" />
          <button className="wp-menu-collapse" onClick={toggleFold}>
            {folded ? <ChevronsRight style={{ width: 18, height: 18 }} /> : <ChevronsLeft style={{ width: 18, height: 18 }} />}
            <span>Collapse menu</span>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className={`wp-content${folded ? ' folded' : ''}`}>
        <div className="wrap">{children}</div>
      </div>
    </div>
  );
}
