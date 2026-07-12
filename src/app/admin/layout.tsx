'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminToken } from '@/lib/admin-api';
import { AdminShell, applyTheme } from '@/components/admin/admin-shell';
import { Toaster } from 'sonner';

// Client-side guard: /admin/login renders bare; everything else requires a token.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname?.startsWith('/admin/login');
  const [ready, setReady] = useState(false);

  // Apply the saved admin theme; remove `dark` from <html> on leaving /admin so
  // the public site keeps its own (light) theme.
  useEffect(() => {
    const t = (localStorage.getItem('b2c_admin_theme') as 'light' | 'dark') || 'dark';
    applyTheme(t);
    return () => document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    if (isLogin) {
      setReady(true);
      return;
    }
    if (!adminToken.get()) {
      router.replace('/admin/login');
      return;
    }
    setReady(true);
  }, [isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
        Loading…
      </div>
    );
  }
  return (
    <>
      <AdminShell>{children}</AdminShell>
      <Toaster theme="dark" position="bottom-right" richColors />
    </>
  );
}
