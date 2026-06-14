'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, Plane, Car, Calendar, Clock, Users,
  Phone, User, AlertTriangle, CheckCircle2, XCircle, AlertCircle,
  Camera, MapPin,
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

interface BookingDetail {
  id: string;
  bookingRef: string;
  bookingStatus: string;
  serviceType: string;
  jobDate: string;
  pickupTime: string | null;
  paxCount: number;
  total: string;
  currency: string;
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
  trafficJob: {
    internalRef: string;
    status: string;
    assignment: {
      vehicle: { plateNumber: string; carBrand: string | null; carModel: string | null } | null;
      driver: { name: string; mobileNumber: string } | null;
      rep: { name: string; mobileNumber: string } | null;
    } | null;
    flight: { flightNo: string; carrier: string | null; terminal: string | null } | null;
  } | null;
  evidence?: EvidenceItem[];
}

interface Props { settings: SiteSettings; bookingRef: string; }

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

  // Compute hours until job for window checks
  const jobDt = new Date(booking.jobDate);
  if (booking.pickupTime) {
    const pt = new Date(booking.pickupTime);
    jobDt.setHours(pt.getHours(), pt.getMinutes(), 0, 0);
  }
  const hoursUntilJob = (jobDt.getTime() - Date.now()) / 3_600_000;
  const canAmend = isActive && hoursUntilJob >= 24;
  const canCancel = isActive && hoursUntilJob >= 48;

  const assigned = booking.trafficJob?.assignment?.driver || booking.trafficJob?.assignment?.vehicle;

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Trip details */}
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
          <InfoRow label="Total" value={<span className="font-bold" style={{ color: pc }}>{booking.currency} {Number(booking.total).toFixed(2)}</span>} />
        </div>

        {/* Flight info */}
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

        {/* Assignment card — shows after dispatch assigns */}
        {assigned && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: `${pc}40` }}>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <CheckCircle2 className="h-4 w-4" style={{ color: pc }} /> Your Transfer Team
            </h2>
            {booking.trafficJob?.assignment?.vehicle && (
              <InfoRow label="Vehicle" value={<span className="font-mono">{booking.trafficJob.assignment.vehicle.plateNumber}{booking.trafficJob.assignment.vehicle.carBrand ? ` — ${[booking.trafficJob.assignment.vehicle.carBrand, booking.trafficJob.assignment.vehicle.carModel].filter(Boolean).join(' ')}` : ''}</span>} />
            )}
            {booking.trafficJob?.assignment?.driver && (
              <InfoRow label="Driver" value={
                <span className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-400" /> {booking.trafficJob.assignment.driver.name}
                  <a href={`tel:${booking.trafficJob.assignment.driver.mobileNumber}`} className="flex items-center gap-1 text-xs font-medium" style={{ color: pc }}>
                    <Phone className="h-3 w-3" /> {booking.trafficJob.assignment.driver.mobileNumber}
                  </a>
                </span>
              } />
            )}
            {booking.trafficJob?.assignment?.rep && (
              <InfoRow label="Rep" value={
                <span className="flex items-center gap-2">
                  <User className="h-3 w-3 text-gray-400" /> {booking.trafficJob.assignment.rep.name}
                  <a href={`tel:${booking.trafficJob.assignment.rep.mobileNumber}`} className="flex items-center gap-1 text-xs font-medium" style={{ color: pc }}>
                    <Phone className="h-3 w-3" /> {booking.trafficJob.assignment.rep.mobileNumber}
                  </a>
                </span>
              } />
            )}
          </div>
        )}

        {/* Trip photos & status updates from the driver/rep */}
        {booking.evidence && booking.evidence.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
              <Camera className="h-4 w-4" style={{ color: pc }} /> Trip Photos &amp; Updates
            </h2>
            <div className="space-y-5">
              {booking.evidence.map((ev, i) => (
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
                      <MapPin className="h-3 w-3" /> View pickup location
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amendment / cancellation windows */}
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

        <button onClick={() => router.push('/account')}
          className="w-full text-sm text-gray-400 hover:text-gray-700 transition py-2">
          ← Back to All Bookings
        </button>
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

            {/* Cancellation policy */}
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
