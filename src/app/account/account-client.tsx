'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar, Loader2, LogOut, Plane, Car, CalendarClock, History,
  FileText, Lock, Download, CheckCircle2, AlertTriangle, User,
} from 'lucide-react';
import type { SiteSettings } from '@/lib/site-settings';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? '';
const API = `${API_ORIGIN}/api/w-api`;

interface AccountClientProps { settings: SiteSettings; }

interface Booking {
  id: string;
  bookingRef: string;
  bookingStatus: string;
  serviceType: string;
  jobDate: string;
  pickupTime: string | null;
  paxCount: number;
  total: string;
  currency: string;
  fromZone: { name: string } | null;
  toZone: { name: string } | null;
  originAirport: { name: string } | null;
  destinationAirport: { name: string } | null;
  trafficJob: {
    status: string;
    assignment: {
      vehicle: { plateNumber: string } | null;
      driver: { name: string; mobileNumber: string } | null;
      externalDriverName: string | null;
      supplierCarType: { vehicleType: { name: string } | null } | null;
    } | null;
  } | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  issuedAt: string;
  currency: string;
  total: string;
  status: string;
  guestBooking: { bookingRef: string; jobDate: string; serviceType: string } | null;
}

type TabKey = 'current' | 'history' | 'invoices' | 'password';

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CONVERTED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-600',
  AMENDED: 'bg-yellow-100 text-yellow-700',
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function AccountClient({ settings }: AccountClientProps) {
  const router = useRouter();
  const pc = settings.primaryColor;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoaded, setInvoicesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [tab, setTab] = useState<TabKey>('current');

  // Read initial tab from ?tab= without needing a Suspense boundary.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t === 'history' || t === 'invoices' || t === 'password') setTab(t);
  }, []);

  const token = () => (typeof window !== 'undefined' ? localStorage.getItem('b2c_token') ?? '' : '');

  useEffect(() => {
    const t = localStorage.getItem('b2c_token');
    const userStr = localStorage.getItem('b2c_user');
    if (!t) { router.replace('/login'); return; }
    if (userStr) { try { setUser(JSON.parse(userStr)); } catch {} }

    fetch(`${API}/bookings`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => { if (r.status === 401) { router.replace('/login'); return null; } return r.json(); })
      .then((json) => { if (json) setBookings(json.data ?? json ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  // Lazy-load invoices the first time the tab is opened.
  const loadInvoices = useCallback(() => {
    if (invoicesLoaded) return;
    setInvoicesLoaded(true);
    fetch(`${API}/invoices`, { headers: { Authorization: `Bearer ${token()}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => { if (json) setInvoices(json.data ?? json ?? []); })
      .catch(() => {});
  }, [invoicesLoaded]);

  useEffect(() => { if (tab === 'invoices') loadInvoices(); }, [tab, loadInvoices]);

  const selectTab = (t: TabKey) => {
    setTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    window.history.replaceState(null, '', url.toString());
  };

  const handleLogout = () => {
    localStorage.removeItem('b2c_token');
    localStorage.removeItem('b2c_user');
    router.push('/login');
  };

  const today = startOfToday().getTime();
  const current = bookings
    .filter((b) => b.jobDate && new Date(b.jobDate).getTime() >= today)
    .sort((a, b) => new Date(a.jobDate).getTime() - new Date(b.jobDate).getTime());
  const history = bookings
    .filter((b) => b.jobDate && new Date(b.jobDate).getTime() < today)
    .sort((a, b) => new Date(b.jobDate).getTime() - new Date(a.jobDate).getTime());

  const TABS: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'current', label: 'My Current Transfers', icon: <CalendarClock className="h-4 w-4" />, count: current.length },
    { key: 'history', label: 'Transfer History', icon: <History className="h-4 w-4" />, count: history.length },
    { key: 'invoices', label: 'My Invoices', icon: <FileText className="h-4 w-4" /> },
    { key: 'password', label: 'Password', icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header / profile */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full text-white font-bold" style={{ backgroundColor: pc }}>
              {(user?.name?.[0] ?? user?.email?.[0] ?? 'G').toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user?.name ?? 'My Account'}</h1>
              {user && <p className="text-sm text-gray-500">{user.email}</p>}
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Vertical tab rail */}
          <nav className="md:w-60 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => selectTab(t.key)}
                  className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${active ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                  style={active ? { backgroundColor: pc } : undefined}
                >
                  {t.icon}
                  <span className="flex-1 text-left">{t.label}</span>
                  {typeof t.count === 'number' && t.count > 0 && (
                    <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${active ? 'bg-white/25' : 'bg-gray-200 text-gray-600'}`}>{t.count}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Tab content */}
          <div className="flex-1 min-w-0">
            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}

            {!loading && tab === 'current' && (
              <BookingList bookings={current} emptyLabel="No upcoming transfers" router={router} pc={pc} />
            )}
            {!loading && tab === 'history' && (
              <BookingList bookings={history} emptyLabel="No past transfers" router={router} pc={pc} />
            )}
            {!loading && tab === 'invoices' && (
              <InvoicesTab invoices={invoices} loaded={invoicesLoaded} pc={pc} token={token} />
            )}
            {!loading && tab === 'password' && (
              <PasswordTab pc={pc} email={user?.email ?? ''} token={token} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Booking list ──
function BookingList({ bookings, emptyLabel, router, pc }: {
  bookings: Booking[];
  emptyLabel: string;
  router: ReturnType<typeof useRouter>;
  pc: string;
}) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const origin = b.originAirport?.name ?? b.fromZone?.name ?? '—';
        const dest = b.destinationAirport?.name ?? b.toZone?.name ?? '—';
        const statusClass = STATUS_COLORS[b.bookingStatus] ?? 'bg-gray-100 text-gray-600';
        const jobDate = b.jobDate ? new Date(b.jobDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
        const a = b.trafficJob?.assignment;
        const driverName = a?.driver?.name ?? a?.externalDriverName;
        return (
          <button key={b.id}
            onClick={() => router.push(`/account/booking/${b.bookingRef}`)}
            className="w-full text-left rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono text-xs font-bold text-gray-900">{b.bookingRef}</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>{b.bookingStatus}</span>
                  {b.trafficJob?.status && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700">{b.trafficJob.status}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                  {b.serviceType === 'ARR' ? <Plane className="h-3.5 w-3.5 text-gray-400 rotate-[135deg]" /> : <Car className="h-3.5 w-3.5 text-gray-400" />}
                  <span className="truncate">{origin}</span>
                  <span className="text-gray-300">→</span>
                  <span className="truncate">{dest}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span>{jobDate}</span>
                  {b.pickupTime && <span>{new Date(b.pickupTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
                  <span>{b.paxCount} pax</span>
                  <span className="font-semibold text-gray-700">{b.currency} {Number(b.total).toFixed(2)}</span>
                </div>
                {driverName && (
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                    <span className="font-medium text-emerald-600">Driver assigned:</span>
                    <span>{driverName}</span>
                    {(a?.vehicle || a?.supplierCarType?.vehicleType) && (
                      <span className="ml-auto font-mono text-gray-400">{a.vehicle?.plateNumber ?? a.supplierCarType?.vehicleType?.name}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Invoices ──
function InvoicesTab({ invoices, loaded, pc, token }: {
  invoices: Invoice[];
  loaded: boolean;
  pc: string;
  token: () => string;
}) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const download = async (inv: Invoice) => {
    setDownloading(inv.id);
    try {
      const res = await fetch(`${API}/invoices/${inv.id}/pdf`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${inv.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
    setDownloading(null);
  };

  if (!loaded) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }
  if (invoices.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No invoices yet</p>
        <p className="text-xs mt-1">Invoices appear here once a booking is paid.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {invoices.map((inv) => (
        <div key={inv.id} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-gray-900">{inv.invoiceNumber}</span>
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700">{inv.status}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
              <span>{new Date(inv.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              {inv.guestBooking && <span className="font-mono">{inv.guestBooking.bookingRef}</span>}
              <span className="font-semibold text-gray-700">{inv.currency} {Number(inv.total).toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => download(inv)}
            disabled={downloading === inv.id}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: pc }}
          >
            {downloading === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            PDF
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Password ──
function PasswordTab({ pc, email, token }: { pc: string; email: string; token: () => string }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) { setMsg({ ok: false, text: 'New password must be at least 8 characters' }); return; }
    if (next !== confirm) { setMsg({ ok: false, text: 'Passwords do not match' }); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Could not change password');
      setMsg({ ok: true, text: 'Password updated successfully.' });
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err: unknown) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not change password' });
    } finally {
      setSaving(false);
    }
  };

  const sendReset = async () => {
    try {
      await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch { /* ignore */ }
    setResetSent(true);
  };

  const inputCls = 'w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-1';

  return (
    <div className="space-y-5 max-w-md">
      <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Change Password</h2>
        <input type="password" placeholder="Current password" autoComplete="current-password" value={current}
          onChange={(e) => setCurrent(e.target.value)} required className={inputCls}
          style={{ '--tw-ring-color': pc } as React.CSSProperties} />
        <input type="password" placeholder="New password (min 8 chars)" autoComplete="new-password" value={next}
          onChange={(e) => setNext(e.target.value)} required className={inputCls}
          style={{ '--tw-ring-color': pc } as React.CSSProperties} />
        <input type="password" placeholder="Confirm new password" autoComplete="new-password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} required className={inputCls}
          style={{ '--tw-ring-color': pc } as React.CSSProperties} />

        {msg && (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
            {msg.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
            {msg.text}
          </div>
        )}

        <button type="submit" disabled={saving || !current || !next || !confirm}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
          style={{ backgroundColor: pc }}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : 'Update Password'}
        </button>
      </form>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Forgot your current password?</h2>
        <p className="text-xs text-gray-500 mb-3">We&apos;ll email a reset link to {email || 'your registered email'}.</p>
        {resetSent ? (
          <p className="flex items-center gap-2 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Reset link sent — check your inbox.</p>
        ) : (
          <button onClick={sendReset}
            className="flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: `${pc}55`, color: pc }}>
            <User className="h-4 w-4" /> Email me a reset link
          </button>
        )}
      </div>
    </div>
  );
}
