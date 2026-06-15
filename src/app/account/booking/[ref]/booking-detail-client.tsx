'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, Plane, Car, Calendar, Clock, Users,
  Phone, User, AlertTriangle, CheckCircle2, XCircle, AlertCircle,
  Camera, MapPin, FileText, CreditCard, Download, CarFront,
} from 'lucide-react';
import type { SiteSettings } from '@/lib/site-settings';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? '';
const API = `${API_ORIGIN}/api/w-api`;

interface EvidenceItem {
  stage: 'IN_PLACE' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_SHOW' | string;
  by: 'DRIVER' | 'REP' | 'STAFF';
  gpsMapLink: string | null;
  createdAt: string;
  images: string[];
}

const STAGE_LABEL: Record<string, string> = {
  IN_PLACE: 'Rep in place',
  IN_PROGRESS: 'Trip in progress',
  COMPLETED: 'Trip completed',
  NO_SHOW: 'No-show reported',
};

function byLabel(by: EvidenceItem['by']) {
  return by === 'REP' ? 'by your rep' : by === 'DRIVER' ? 'by your driver' : 'by our team';
}

function humanize(s?: string | null) {
  return (s ?? '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const PAY_STATUS_COLORS: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-amber-100 text-amber-700',
  FAILED: 'bg-red-100 text-red-600',
  REFUNDED: 'bg-gray-100 text-gray-600',
};

// Renders one evidence image. Local files (`/uploads/...`) are public and served
// straight from the backend; Drive-proxied files (`/w-api/.../evidence-file/...`)
// are JWT-guarded, so they must be blob-fetched with the bearer token.
function EvidenceImage({ path }: { path: string }) {
  const needsAuth = path.startsWith('/w-api/');
  const publicSrc = path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
  const [src, setSrc] = useState<string | null>(needsAuth ? null : publicSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!needsAuth) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    const token = localStorage.getItem('b2c_token') ?? '';
    fetch(`${API_ORIGIN}/api${path}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error('fetch failed'))))
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path, needsAuth]);

  if (failed) return null;
  if (!src) return <div className="aspect-square rounded-lg bg-gray-100 animate-pulse" />;
  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Trip evidence"
        loading="lazy"
        onError={() => setFailed(true)}
        className="aspect-square w-full rounded-lg object-cover border border-gray-100"
      />
    </a>
  );
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  total: string;
  currency: string;
  status: string;
  issuedAt: string;
}

interface BookingDetail {
  id: string;
  bookingRef: string;
  bookingStatus: string;
  serviceType: string;
  jobDate: string;
  pickupTime: string | null;
  paxCount: number;
  subtotal: string;
  taxAmount: string;
  total: string;
  currency: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentGateway: string | null;
  paymentReference: string | null;
  flightNo: string | null;
  carrier: string | null;
  terminal: string | null;
  notes: string | null;
  amendedAt: string | null;
  fromZone: { name: string } | null;
  toZone: { name: string } | null;
  originAirport: { name: string } | null;
  destinationAirport: { name: string } | null;
  hotel: { name: string } | null;
  vehicleType: { name: string } | null;
  invoice: Invoice | null;
  trafficJob: {
    internalRef: string;
    status: string;
    assignment: {
      vehicle: { plateNumber: string; carBrand: string | null; carModel: string | null } | null;
      driver: { name: string; mobileNumber: string } | null;
      rep: { name: string; mobileNumber: string } | null;
      externalDriverName: string | null;
      externalDriverPhone: string | null;
      supplierCarType: { vehicleType: { name: string } | null } | null;
    } | null;
    flight: { flightNo: string; carrier: string | null; terminal: string | null } | null;
  } | null;
  evidence?: EvidenceItem[];
}

interface Props { settings: SiteSettings; bookingRef: string; }

type TabKey = 'details' | 'progress' | 'payment';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export function BookingDetailClient({ settings, bookingRef }: Props) {
  const router = useRouter();
  const pc = settings.primaryColor;
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [tab, setTab] = useState<TabKey>('details');

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab');
    if (t === 'progress' || t === 'payment') setTab(t);
  }, []);

  const selectTab = (t: TabKey) => {
    setTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    window.history.replaceState(null, '', url.toString());
  };

  useEffect(() => {
    const token = localStorage.getItem('b2c_token');
    if (!token) { router.replace('/login'); return; }

    fetch(`${API}/bookings/${bookingRef}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) { router.replace('/login'); return null; }
        return r.json();
      })
      .then((json) => {
        if (!json) return;
        setBooking(json.data ?? json);
      })
      .catch(() => setError('Failed to load booking'))
      .finally(() => setLoading(false));
  }, [bookingRef, router]);

  const handleCancel = async () => {
    setShowCancelModal(false);
    setActionLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('b2c_token') ?? '';
      const res = await fetch(`${API}/bookings/${bookingRef}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? 'Cancellation failed');
      setSuccess('Your booking has been cancelled.');
      setBooking((prev) => prev ? { ...prev, bookingStatus: 'CANCELLED' } : prev);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Booking not found</p>
          <button onClick={() => router.push('/account')} className="text-sm font-medium" style={{ color: pc }}>← Back to My Account</button>
        </div>
      </div>
    );
  }

  const jobDate = booking.jobDate
    ? new Date(booking.jobDate).toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    : '—';
  const pickupTime = booking.pickupTime
    ? new Date(booking.pickupTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : null;

  const origin = booking.originAirport?.name ?? booking.fromZone?.name ?? '—';
  const dest = booking.destinationAirport?.name ?? booking.toZone?.name ?? '—';

  const isCancelled = booking.bookingStatus === 'CANCELLED';
  const isActive = ['CONFIRMED', 'CONVERTED'].includes(booking.bookingStatus);

  const jobDt = new Date(booking.jobDate);
  if (booking.pickupTime) {
    const pt = new Date(booking.pickupTime);
    jobDt.setHours(pt.getHours(), pt.getMinutes(), 0, 0);
  }
  const hoursUntilJob = (jobDt.getTime() - Date.now()) / 3_600_000;
  const canAmend = isActive && hoursUntilJob >= 24;
  const canCancel = isActive && hoursUntilJob >= 48;

  const a = booking.trafficJob?.assignment;
  const assigned = a?.driver || a?.vehicle || a?.externalDriverName || a?.supplierCarType || a?.rep;

  const evidence = booking.evidence ?? [];
  const driverEvidence = evidence.filter((e) => e.by === 'DRIVER');
  const repEvidence = evidence.filter((e) => e.by === 'REP');
  const staffEvidence = evidence.filter((e) => e.by === 'STAFF');

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'details', label: 'Transfer Details', icon: <FileText className="h-4 w-4" /> },
    { key: 'progress', label: 'Progress & Evidences', icon: <Camera className="h-4 w-4" /> },
    { key: 'payment', label: 'Transfer Payment', icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.push('/account')} className="text-gray-400 hover:text-gray-700 transition">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-mono">{booking.bookingRef}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {booking.serviceType === 'ARR' ? 'Arrival Transfer' : booking.serviceType === 'DEP' ? 'Departure Transfer' : 'City Transfer'}
            </p>
          </div>
          <span className={`ml-auto inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            isCancelled ? 'bg-red-100 text-red-600' :
            booking.bookingStatus === 'CONVERTED' ? 'bg-blue-100 text-blue-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {booking.bookingStatus}
          </span>
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700 mb-5">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 mb-5">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Vertical tab rail */}
          <nav className="md:w-56 shrink-0 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
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
                  <span className="text-left">{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Tab content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* ── Transfer Details ── */}
            {tab === 'details' && (
              <>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    {booking.serviceType === 'ARR' ? <Plane className="h-4 w-4" style={{ color: pc }} /> : <Car className="h-4 w-4" style={{ color: pc }} />}
                    Trip Details
                  </h2>
                  <InfoRow label="From" value={origin} />
                  <InfoRow label="To" value={dest} />
                  {booking.hotel && <InfoRow label="Hotel" value={booking.hotel.name} />}
                  <InfoRow label="Date" value={<span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gray-400" />{jobDate}</span>} />
                  {pickupTime && <InfoRow label="Pickup" value={<span className="flex items-center gap-1"><Clock className="h-3 w-3 text-gray-400" />{pickupTime}</span>} />}
                  <InfoRow label="Passengers" value={<span className="flex items-center gap-1"><Users className="h-3 w-3 text-gray-400" />{booking.paxCount}</span>} />
                  {booking.vehicleType && <InfoRow label="Vehicle" value={booking.vehicleType.name} />}
                  {booking.notes && <InfoRow label="Notes" value={booking.notes} />}
                  <InfoRow label="Total" value={<span className="font-bold" style={{ color: pc }}>{booking.currency} {Number(booking.total).toFixed(2)}</span>} />
                </div>

                {(booking.flightNo || booking.trafficJob?.flight) && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                      <Plane className="h-4 w-4" style={{ color: pc }} /> Flight Information
                    </h2>
                    <InfoRow label="Flight No." value={booking.flightNo ?? booking.trafficJob?.flight?.flightNo ?? '—'} />
                    {(booking.carrier ?? booking.trafficJob?.flight?.carrier) && (
                      <InfoRow label="Airline / Route" value={booking.carrier ?? booking.trafficJob?.flight?.carrier ?? '—'} />
                    )}
                    {(booking.terminal ?? booking.trafficJob?.flight?.terminal) && (
                      <InfoRow label="Terminal" value={booking.terminal ?? booking.trafficJob?.flight?.terminal ?? '—'} />
                    )}
                  </div>
                )}

                {assigned && (
                  <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: `${pc}40` }}>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                      <CheckCircle2 className="h-4 w-4" style={{ color: pc }} /> Your Transfer Team
                    </h2>
                    {a?.vehicle ? (
                      <InfoRow label="Vehicle" value={<span className="font-mono">{a.vehicle.plateNumber}{a.vehicle.carBrand ? ` — ${[a.vehicle.carBrand, a.vehicle.carModel].filter(Boolean).join(' ')}` : ''}</span>} />
                    ) : a?.supplierCarType?.vehicleType && (
                      <InfoRow label="Vehicle" value={a.supplierCarType.vehicleType.name} />
                    )}
                    {a?.driver ? (
                      <InfoRow label="Driver" value={
                        <span className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" /> {a.driver.name}
                          <a href={`tel:${a.driver.mobileNumber}`} className="flex items-center gap-1 text-xs font-medium" style={{ color: pc }}>
                            <Phone className="h-3 w-3" /> {a.driver.mobileNumber}
                          </a>
                        </span>
                      } />
                    ) : a?.externalDriverName && (
                      <InfoRow label="Driver" value={
                        <span className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" /> {a.externalDriverName}
                          {a.externalDriverPhone && (
                            <a href={`tel:${a.externalDriverPhone}`} className="flex items-center gap-1 text-xs font-medium" style={{ color: pc }}>
                              <Phone className="h-3 w-3" /> {a.externalDriverPhone}
                            </a>
                          )}
                        </span>
                      } />
                    )}
                    {a?.rep && (
                      <InfoRow label="Rep" value={
                        <span className="flex items-center gap-2">
                          <User className="h-3 w-3 text-gray-400" /> {a.rep.name}
                          <a href={`tel:${a.rep.mobileNumber}`} className="flex items-center gap-1 text-xs font-medium" style={{ color: pc }}>
                            <Phone className="h-3 w-3" /> {a.rep.mobileNumber}
                          </a>
                        </span>
                      } />
                    )}
                  </div>
                )}

                {isActive && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                    <h2 className="text-sm font-semibold text-gray-900">Manage Booking</h2>
                    {!canAmend && !canCancel && (
                      <p className="text-xs text-gray-400">
                        The amendment and cancellation windows have closed (24h and 48h before departure respectively).
                      </p>
                    )}
                    {canAmend && (
                      <button
                        onClick={() => router.push(`/account/booking/${bookingRef}/amend`)}
                        className="w-full rounded-xl py-2.5 text-sm font-semibold border-2 transition"
                        style={{ borderColor: pc, color: pc }}>
                        Request Amendment
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        disabled={actionLoading}
                        className="w-full rounded-xl py-2.5 text-sm font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition flex items-center justify-center gap-2">
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                        Cancel Booking
                      </button>
                    )}
                  </div>
                )}

                {/* Cancellation policy — shown when the booking is active but the
                    48h self-service cancellation window has closed. */}
                {isActive && !canCancel && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                      <AlertCircle className="h-4 w-4" /> Cancellation Policy
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed">
                      Free cancellation is available up to 48 hours before your scheduled
                      pickup. As your transfer is within 48 hours, this booking can no
                      longer be cancelled online.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed">
                      Need to cancel within this period? Email us at{' '}
                      <a href="mailto:support@transfera.ae" className="font-semibold underline">
                        support@transfera.ae
                      </a>{' '}
                      and our team will assist you.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ── Progress & Evidences ── */}
            {tab === 'progress' && (
              <>
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Camera className="h-4 w-4" style={{ color: pc }} /> Trip Progress
                  </h2>
                  {booking.trafficJob?.status && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                      {humanize(booking.trafficJob.status)}
                    </span>
                  )}
                </div>

                {evidence.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center text-gray-400">
                    <Camera className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No updates yet</p>
                    <p className="text-xs mt-1">Photos and status updates appear here as your driver and rep progress through the trip.</p>
                  </div>
                ) : (
                  <>
                    <EvidenceGroup title="Driver Evidence" icon={<CarFront className="h-4 w-4" style={{ color: pc }} />} items={driverEvidence} pc={pc} emptyLabel="No driver updates yet." />
                    <EvidenceGroup title="Rep Evidence" icon={<User className="h-4 w-4" style={{ color: pc }} />} items={repEvidence} pc={pc} emptyLabel="No rep updates yet." />
                    {staffEvidence.length > 0 && (
                      <EvidenceGroup title="Team Updates" icon={<CheckCircle2 className="h-4 w-4" style={{ color: pc }} />} items={staffEvidence} pc={pc} emptyLabel="" />
                    )}
                  </>
                )}
              </>
            )}

            {/* ── Transfer Payment ── */}
            {tab === 'payment' && <PaymentTab booking={booking} pc={pc} />}

            <button onClick={() => router.push('/account')}
              className="w-full text-sm text-gray-400 hover:text-gray-700 transition py-2">
              ← Back to All Bookings
            </button>
          </div>
        </div>
      </div>

      {/* Cancel booking modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCancelModal(false); }}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Cancel Booking</h2>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to cancel booking{' '}
              <span className="font-mono font-bold text-gray-900">{bookingRef}</span>? This action cannot be undone.
            </p>

            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold text-red-700 mb-0.5 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Cancellation Policy
              </p>
              <p className="text-xs text-red-600">
                Free cancellation is available up to 48 hours before your scheduled pickup. Cancellations within 48 hours of departure cannot be processed.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center gap-2">
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Evidence group (Driver / Rep / Team) ──
function EvidenceGroup({ title, icon, items, pc, emptyLabel }: {
  title: string;
  icon: React.ReactNode;
  items: EvidenceItem[];
  pc: string;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
        {icon} {title}
      </h2>
      {items.length === 0 ? (
        emptyLabel ? <p className="text-xs text-gray-400">{emptyLabel}</p> : null
      ) : (
        <div className="space-y-5">
          {items.map((ev, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">
                  {STAGE_LABEL[ev.stage] ?? ev.stage}
                  <span className="ml-1 font-normal text-gray-400">{byLabel(ev.by)}</span>
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(ev.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {ev.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {ev.images.map((src, j) => <EvidenceImage key={j} path={src} />)}
                </div>
              )}
              {ev.gpsMapLink && (
                <a href={ev.gpsMapLink} target="_blank" rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium" style={{ color: pc }}>
                  <MapPin className="h-3 w-3" /> View location
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Transfer Payment (receipt-style summary + invoice download) ──
function PaymentTab({ booking, pc }: { booking: BookingDetail; pc: string }) {
  const [downloading, setDownloading] = useState(false);
  const inv = booking.invoice;
  const paid = booking.paymentStatus === 'PAID';
  const tax = Number(booking.taxAmount);

  const downloadInvoice = async () => {
    if (!inv) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem('b2c_token') ?? '';
      const res = await fetch(`${API}/invoices/${inv.id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
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
    setDownloading(false);
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <CreditCard className="h-4 w-4" style={{ color: pc }} /> Payment Summary
          </h2>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${PAY_STATUS_COLORS[booking.paymentStatus] ?? 'bg-gray-100 text-gray-600'}`}>
            {humanize(booking.paymentStatus)}
          </span>
        </div>

        <InfoRow label="Booking Ref" value={<span className="font-mono">{booking.bookingRef}</span>} />
        <InfoRow label="Payment Method" value={humanize(booking.paymentMethod)} />
        {booking.paymentGateway && <InfoRow label="Gateway" value={humanize(booking.paymentGateway)} />}
        {booking.paymentReference && <InfoRow label="Transaction Ref" value={<span className="font-mono text-xs">{booking.paymentReference}</span>} />}
        {paid && inv && (
          <InfoRow label="Paid On" value={new Date(inv.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
        )}
        <InfoRow label="Subtotal" value={`${booking.currency} ${Number(booking.subtotal).toFixed(2)}`} />
        {tax > 0 && <InfoRow label="Tax" value={`${booking.currency} ${tax.toFixed(2)}`} />}
        <InfoRow label={paid ? 'Total Paid' : 'Total Due'} value={<span className="font-bold" style={{ color: pc }}>{booking.currency} {Number(booking.total).toFixed(2)}</span>} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
          <FileText className="h-4 w-4" style={{ color: pc }} /> Invoice
        </h2>
        {inv ? (
          <div className="flex items-center gap-3 mt-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-bold text-gray-900">{inv.invoiceNumber}</p>
              <p className="text-xs text-gray-400">{inv.currency} {Number(inv.total).toFixed(2)}</p>
            </div>
            <button
              onClick={downloadInvoice}
              disabled={downloading}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: pc }}>
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              PDF
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-1">Your invoice will be available here once payment is completed.</p>
        )}
      </div>
    </>
  );
}
