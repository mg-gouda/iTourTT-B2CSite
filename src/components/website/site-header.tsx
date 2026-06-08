'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Globe, User, ChevronDown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SiteSettings, NavLink } from '@/lib/site-settings';
import { API_BASE } from '@/lib/site-settings';
import { cn } from '@/lib/utils';
import { useLocaleStore, LANGUAGES, useWT, useLocalePath } from '@/lib/website-i18n';

interface CityMenuItem {
  slug: string;
  name: string;
}

interface CmsNavItem {
  slug: string;
  title: string;
}

function useCmsNavItems(): CmsNavItem[] {
  const { locale } = useLocaleStore();
  const [items, setItems] = useState<CmsNavItem[]>([]);
  useEffect(() => {
    const qs = locale && locale !== 'en' ? `?locale=${encodeURIComponent(locale)}` : '';
    fetch(`${API_BASE}/api/public/pages${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setItems(j?.data?.nav ?? []))
      .catch(() => {});
  }, [locale]);
  return items;
}

interface SiteHeaderProps {
  settings: SiteSettings;
}

function useDefaultNavLinks(): NavLink[] {
  const t = useWT();
  return [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.bookNow'), href: '/book' },
    { label: t('nav.trackBooking'), href: '/booking/lookup' },
  ];
}

export function SiteHeader({ settings }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const t = useWT();
  const localePath = useLocalePath();
  const { locale } = useLocaleStore();
  const router = useRouter();
  const pathname = usePathname();
  const defaultNavLinks = useDefaultNavLinks();
  const navLinks = settings.navLinksJson ?? defaultNavLinks;
  const preset = settings.headerPreset;

  const cmsNavItems = useCmsNavItems();

  // Destinations mega-menu — published city pages from the CMS.
  const [cities, setCities] = useState<CityMenuItem[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/public/city-pages`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setCities(j?.data ?? []))
      .catch(() => {});
  }, []);

  // Track scroll for transparent preset
  useEffect(() => {
    if (preset !== 'transparent') return;

    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [preset]);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isTransparent = preset === 'transparent' && !scrolled;

  const navBg = isTransparent ? 'transparent' : settings.navBgColor;

  const Logo = () => (
    <Link href={localePath('/')} className="flex items-center gap-2.5">
      {settings.siteLogoUrl ? (
        <img
          src={settings.siteLogoUrl}
          alt={`${settings.siteName} — Egypt Airport Transfer Service`}
          width={180}
          height={36}
          className="h-9 w-auto shrink-0 object-contain"
          style={{ minWidth: '60px' }}
        />
      ) : (
        <>
          <img
            src="/favicon.svg"
            alt={`${settings.siteName} — Egypt Airport Transfer Service`}
            width={32}
            height={32}
            className="h-8 w-8 shrink-0"
          />
          <span className="text-lg font-semibold tracking-tight text-white">
            {settings.siteName}
          </span>
        </>
      )}
    </Link>
  );

  const NavItems = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
    <div className={className}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.external ? link.href : localePath(link.href)}
          onClick={onClick}
          target={link.external ? '_blank' : undefined}
          rel={link.external ? 'noopener noreferrer' : undefined}
          className="text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          {link.label}
        </Link>
      ))}

      {/* Destinations mega-menu — trigger is a real link so Google can crawl it. */}
      {cities.length > 0 && (
        <div className="group relative">
          <Link
            href={localePath('/destinations')}
            onClick={onClick}
            className="flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            {t('nav.destinations') || 'Destinations'}
            <ChevronDown className="h-3.5 w-3.5" />
          </Link>
          <div className="absolute left-1/2 top-full z-50 hidden -translate-x-1/2 pt-3 group-hover:block">
            <div className="grid w-[28rem] grid-cols-2 gap-1 rounded-xl border border-gray-100 bg-white p-3 shadow-xl">
              {cities.map((c) => (
                <Link
                  key={c.slug}
                  href={localePath(`/transfers/${c.slug}`)}
                  onClick={onClick}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-emerald-700"
                >
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <Link
        href={localePath('/blog')}
        onClick={onClick}
        className="text-sm font-medium text-white/80 transition-colors hover:text-white"
      >
        {t('nav.blog') || 'Blog'}
      </Link>

      {cmsNavItems.map((item) => (
        <Link
          key={item.slug}
          href={localePath(`/${item.slug}`)}
          onClick={onClick}
          className="text-sm font-medium text-white/80 transition-colors hover:text-white"
        >
          {item.title}
        </Link>
      ))}
    </div>
  );

  const LanguageSwitcher = () => {
    const { locale } = useLocaleStore();
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    const switchLocale = (newLocale: string) => {
      // Replace the current locale segment in the URL, e.g. /en/book → /ar/book
      const segments = pathname.split('/');
      if (segments.length > 1) segments[1] = newLocale;
      const newPath = segments.join('/') || `/${newLocale}`;
      router.push(newPath);
      setOpen(false);
    };

    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Globe className="h-4 w-4" />
          <span className="uppercase">{current.code}</span>
        </button>
        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-white/10 bg-gray-900/95 shadow-xl backdrop-blur">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLocale(lang.code)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/10',
                  locale === lang.code ? 'text-white font-medium' : 'text-white/60',
                )}
              >
                <span className="w-5 text-center text-xs uppercase">{lang.code}</span>
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const AccountBtn = ({ className }: { className?: string }) => (
    <Link
      href={localePath('/account')}
      className={cn(
        'flex items-center gap-1.5 text-sm font-medium text-white/80 transition-colors hover:text-white',
        className,
      )}
    >
      <User className="h-4 w-4" />
      {t('nav.myAccount')}
    </Link>
  );

  const BookNowBtn = ({ className }: { className?: string }) => (
    <Button
      asChild
      size="sm"
      className={cn('text-white font-semibold', className)}
      style={{ backgroundColor: settings.primaryColor }}
    >
      <Link href={localePath('/book')}>{settings.heroCta1Text || t('nav.bookNow')}</Link>
    </Button>
  );

  // ── Mobile Overlay ──
  const MobileMenu = () => {
    if (!mobileOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] md:hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        {/* Panel */}
        <div
          className="absolute right-0 top-0 h-full w-72 shadow-2xl"
          style={{ backgroundColor: settings.navBgColor }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <span className="text-base font-semibold text-white">{t('nav.menu')}</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col gap-1 px-3 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.external ? link.href : localePath(link.href)}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            {/* Destinations */}
            {cities.length > 0 && (
              <div className="mt-1">
                <Link
                  href={localePath('/destinations')}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 text-xs font-semibold uppercase tracking-wide text-white/40 hover:text-white/70"
                >
                  {t('nav.destinations') || 'Destinations'}
                </Link>
                <div className="mt-1 flex flex-col">
                  {cities.map((c) => (
                    <Link
                      key={c.slug}
                      href={localePath(`/transfers/${c.slug}`)}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={localePath('/blog')}
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {t('nav.blog') || 'Blog'}
            </Link>

            {cmsNavItems.map((item) => (
              <Link
                key={item.slug}
                href={localePath(`/${item.slug}`)}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.title}
              </Link>
            ))}

            <Link
              href={localePath('/account')}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <User className="h-4 w-4" />
              {t('nav.myAccount')}
            </Link>
            <div className="mt-2 border-t border-white/10 pt-3">
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                {t('nav.language') || 'Language'}
              </p>
              <div className="flex flex-wrap gap-1 px-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    title={lang.label}
                    onClick={() => {
                      const segments = pathname.split('/');
                      if (segments.length > 1) segments[1] = lang.code;
                      router.push(segments.join('/') || `/${lang.code}`);
                      setMobileOpen(false);
                    }}
                    className={cn(
                      'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                      locale === lang.code
                        ? 'bg-white/20 text-white'
                        : 'text-white/50 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 px-3">
              <BookNowBtn className="w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HamburgerBtn = () => (
    <button
      onClick={() => setMobileOpen(true)}
      className="rounded-md p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors md:hidden"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );

  // ── Preset: Default ──
  // Dark bg, logo left, nav + CTA right
  if (preset === 'default') {
    return (
      <>
        <nav
          className="sticky top-0 z-50 w-full border-b border-white/10 shadow-lg"
          style={{ backgroundColor: navBg }}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo />
            <div className="hidden items-center gap-6 md:flex">
              <NavItems className="flex items-center gap-6" />
              <LanguageSwitcher />
              <AccountBtn />
              <BookNowBtn />
            </div>
            <HamburgerBtn />
          </div>
        </nav>
        <MobileMenu />
      </>
    );
  }

  // ── Preset: Centered ──
  // Logo centered on top row, nav below
  if (preset === 'centered') {
    return (
      <>
        <nav
          className="sticky top-0 z-50 w-full border-b border-white/10 shadow-lg"
          style={{ backgroundColor: navBg }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Top: Logo centered */}
            <div className="flex h-14 items-center justify-center relative">
              <Logo />
              <div className="absolute right-0 flex items-center gap-2">
                <LanguageSwitcher />
                <HamburgerBtn />
              </div>
            </div>
            {/* Bottom: Nav centered */}
            <div className="hidden items-center justify-center gap-6 pb-3 md:flex">
              <NavItems className="flex items-center gap-6" />
              <AccountBtn />
              <BookNowBtn />
            </div>
          </div>
        </nav>
        <MobileMenu />
      </>
    );
  }

  // ── Preset: Transparent ──
  // Transparent bg that becomes solid on scroll
  if (preset === 'transparent') {
    return (
      <>
        <nav
          className={cn(
            'fixed top-0 z-50 w-full transition-all duration-300',
            scrolled
              ? 'border-b border-white/10 shadow-lg'
              : 'border-b border-transparent',
          )}
          style={{ backgroundColor: navBg }}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo />
            <div className="hidden items-center gap-6 md:flex">
              <NavItems className="flex items-center gap-6" />
              <LanguageSwitcher />
              <AccountBtn />
              <BookNowBtn />
            </div>
            <HamburgerBtn />
          </div>
        </nav>
        <MobileMenu />
      </>
    );
  }

  // ── Preset: Minimal ──
  // Just logo + Book Now button
  if (preset === 'minimal') {
    return (
      <>
        <nav
          className="sticky top-0 z-50 w-full border-b border-white/10 shadow-lg"
          style={{ backgroundColor: navBg }}
        >
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo />
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <AccountBtn />
              <BookNowBtn />
              <HamburgerBtn />
            </div>
          </div>
        </nav>
        <MobileMenu />
      </>
    );
  }

  // Fallback to default
  return (
    <>
      <nav
        className="sticky top-0 z-50 w-full border-b border-white/10 shadow-lg"
        style={{ backgroundColor: navBg }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <div className="hidden items-center gap-6 md:flex">
            <NavItems className="flex items-center gap-6" />
            <LanguageSwitcher />
            <AccountBtn />
            <BookNowBtn />
          </div>
          <HamburgerBtn />
        </div>
      </nav>
      <MobileMenu />
    </>
  );
}
