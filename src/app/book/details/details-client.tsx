'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Globe, Loader2, CheckCircle2, KeyRound, ExternalLink } from 'lucide-react';
import { useBookingStore } from '@/stores/booking-store';
import type { SiteSettings } from '@/lib/site-settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookingSteps } from '@/components/website/booking-steps';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/public`;

interface CatalogExtra {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface DetailsClientProps { settings: SiteSettings; }

export function DetailsClient({ settings }: DetailsClientProps) {
  const router = useRouter();
  const store = useBookingStore();
  const pc = settings.primaryColor;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [catalogExtras, setCatalogExtras] = useState<CatalogExtra[]>([]);

  // Payment method master switches (admin-controlled).
  const onlineEnabled = settings.onlinePaymentEnabled ?? true;
  const cashEnabled = settings.cashOnArrivalEnabled ?? true;
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'PAY_ON_ARRIVAL'>(
    onlineEnabled ? 'ONLINE' : 'PAY_ON_ARRIVAL',
  );

  useEffect(() => {
    // City-to-city has no flight step, so don't require a flight number for it.
    if (!store.vehicleTypeId) { router.replace('/book'); return; }
    if (!store.flightNo && store.serviceType !== 'CITY_TO_CITY') { router.replace('/book/flight'); }
  }, [store.vehicleTypeId, store.flightNo, store.serviceType, router]);

  useEffect(() => {
    let active = true;
    fetch(`${API}/extras`)
      .then((r) => r.json())
      .then((j) => { if (active) setCatalogExtras(Array.isArray(j.data) ? j.data : []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Line items for the selected catalog extras (in the quote currency).
  const extraLines = store.customExtras
    .map((sel) => {
      const ex = catalogExtras.find((c) => c.id === sel.extraId);
      if (!ex || ex.currency !== store.quoteCurrency) return null;
      return { name: ex.name, qty: sel.qty, cost: ex.price * sel.qty };
    })
    .filter((l): l is { name: string; qty: number; cost: number } => l !== null);
  const customExtrasTotal = extraLines.reduce((s, l) => s + l.cost, 0);
  const grandTotal = (store.quotePrice ?? 0) + customExtrasTotal;

  const canSubmit = !!store.guestName.trim() && !!store.guestEmail.trim() && !!store.guestPhone.trim() && (onlineEnabled || cashEnabled);

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: store.serviceType,
          originAirportId: store.originAirportId || undefined,
          destinationAirportId: store.destinationAirportId || undefined,
          fromZoneId: store.fromZoneId,
          toZoneId: store.toZoneId,
          hotelId: store.hotelId || undefined,
          vehicleTypeId: store.vehicleTypeId,
          jobDate: store.jobDate,
          pickupTime: store.pickupTime,
          paxCount: store.paxCount,
          guestName: store.guestName,
          guestEmail: store.guestEmail,
          guestPhone: store.guestPhone,
          guestCountry: store.guestCountry || undefined,
          flightNo: store.flightNo || undefined,
          terminal: store.terminal || undefined,
          carrier: store.carrier || undefined,
          // Precise Google Places pickup/drop-off point (when picked).
          pickupPlaceId: store.pickupPlaceId || undefined,
          pickupLat: store.pickupLat ?? undefined,
          pickupLng: store.pickupLng ?? undefined,
          pickupAddress: store.pickupAddress || undefined,
          dropoffPlaceId: store.dropoffPlaceId || undefined,
          dropoffLat: store.dropoffLat ?? undefined,
          dropoffLng: store.dropoffLng ?? undefined,
          dropoffAddress: store.dropoffAddress || undefined,
          // 2-Way (return) leg.
          roundTrip: store.roundTrip || undefined,
          returnDate: store.roundTrip ? store.returnDate : undefined,
          returnPickupTime: store.roundTrip ? store.returnTime : undefined,
          returnFlightNo: store.roundTrip ? store.returnFlightNo || undefined : undefined,
          returnCarrier: store.roundTrip ? store.returnCarrier || undefined : undefined,
          returnTerminal: store.roundTrip ? store.returnTerminal || undefined : undefined,
          extras: store.extras,
          customExtras: store.customExtras.length > 0 ? store.customExtras : undefined,
          notes: store.notes || undefined,
          paymentMethod,
          paymentGateway: paymentMethod === 'ONLINE' ? 'GETPAYIN' : undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Booking failed. Please try again.');
      }
      const json = await res.json();
      const data = json.data ?? json;
      const ref = data.bookingRef ?? '';
      store.setField('bookingRef', ref);
      store.setField('accountCreated', data.accountCreated ?? false);
      store.setField('accountEmail', data.accountEmail ?? null);
      store.setField('accountPassword', data.accountPassword ?? null);
      // Online payment → hand off to the GetPayIn hosted checkout.
      if (paymentMethod === 'ONLINE' && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-[var(--muted)] px-4">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: `${pc}15` }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: pc }} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            {store.bookingRef && (
              <p className="text-gray-500 mb-1">Your reference: <span className="font-bold text-gray-900">{store.bookingRef}</span></p>
            )}
            <p className="text-sm text-gray-400">A confirmation has been sent to {store.guestEmail}</p>
          </div>

          {store.accountCreated && store.accountEmail && (
            <div className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: `${pc}40` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${pc}15` }}>
                  <KeyRound className="h-4 w-4" style={{ color: pc }} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Account Created for You</h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Log in to manage your booking, track your driver, and amend or cancel your trip.</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Email (username)</span>
                  <span className="font-mono font-semibold text-gray-900 text-xs">{store.accountEmail}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Password</span>
                  <span className="font-mono font-semibold text-gray-900 text-xs">{store.accountPassword ?? store.guestPhone}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-400">Your password is your mobile number. You can change it after logging in.</p>
              <a href="/login"
                className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-bold text-white"
                style={{ backgroundColor: pc }}>
                <ExternalLink className="h-3.5 w-3.5" />
                Go to My Account
              </a>
            </div>
          )}

          {!store.accountCreated && (
            <div className="text-center">
              <a href="/login" className="text-xs font-medium" style={{ color: pc }}>
                Already have an account? Log in to manage your booking →
              </a>
            </div>
          )}

          <button onClick={() => { store.reset(); router.push('/'); }}
            className="w-full rounded-xl px-8 py-3 text-sm font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-[var(--muted)]">
      {/* Top bar */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button onClick={() => router.back()} className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
            <span className="rtl:rotate-180">←</span> Back
          </button>
        </div>
      </div>

      <div className="px-4 pt-8">
        <BookingSteps current={2} primaryColor={pc} />
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
        {/* ── Left column: form ── */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Your details</h1>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">We&apos;ll send your booking confirmation here.</p>
          </div>

          {/* Personal info */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4" style={{ boxShadow: 'var(--elevation-1)' }}>
            <h2 className="flex items-center gap-2 font-semibold text-[var(--foreground)] text-sm">
              <User className="h-4 w-4" style={{ color: pc }} />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Full Name *</Label>
                <Input placeholder="John Smith" value={store.guestName}
                  onChange={(e) => store.setField('guestName', e.target.value)}
                  className="border-[var(--border)] bg-[var(--muted)] focus-visible:ring-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email *
                  </Label>
                  <Input type="email" placeholder="john@example.com" value={store.guestEmail}
                    onChange={(e) => store.setField('guestEmail', e.target.value)}
                    className="border-[var(--border)] bg-[var(--muted)] focus-visible:ring-1" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Phone *
                  </Label>
                  <Input type="tel" placeholder="+20 123 456 789" value={store.guestPhone}
                    onChange={(e) => store.setField('guestPhone', e.target.value)}
                    className="border-[var(--border)] bg-[var(--muted)] focus-visible:ring-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> Country
                </Label>
                <Input placeholder="United Kingdom" value={store.guestCountry}
                  onChange={(e) => store.setField('guestCountry', e.target.value)}
                  className="border-[var(--border)] bg-[var(--muted)] focus-visible:ring-1" />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4" style={{ boxShadow: 'var(--elevation-1)' }}>
            <h2 className="font-semibold text-[var(--foreground)] text-sm">Payment Method</h2>
            {!onlineEnabled && !cashEnabled ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Online booking is temporarily unavailable. Please contact us to complete your booking.
              </div>
            ) : (
              <div className={`grid gap-3 ${onlineEnabled && cashEnabled ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                {onlineEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ONLINE')}
                    className="flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all"
                    style={paymentMethod === 'ONLINE'
                      ? { borderColor: pc, backgroundColor: `${pc}0d` }
                      : { borderColor: 'var(--border)' }}
                  >
                    <span className="text-sm font-semibold text-[var(--foreground)]">Online Payment</span>
                    <span className="text-xs text-[var(--muted-foreground)]">Pay securely by card now</span>
                  </button>
                )}
                {cashEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PAY_ON_ARRIVAL')}
                    className="flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all"
                    style={paymentMethod === 'PAY_ON_ARRIVAL'
                      ? { borderColor: pc, backgroundColor: `${pc}0d` }
                      : { borderColor: 'var(--border)' }}
                  >
                    <span className="text-sm font-semibold text-[var(--foreground)]">Pay Cash Upon Arrival</span>
                    <span className="text-xs text-[var(--muted-foreground)]">Pay your driver in cash</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column: sticky order summary + confirm ── */}
        <div className="space-y-4 lg:sticky lg:top-24">
          {store.quotePrice !== null && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5" style={{ boxShadow: 'var(--elevation-2)' }}>
              <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Booking Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[var(--muted-foreground)]">
                  <span>Transfer</span>
                  <span className="font-medium text-[var(--foreground)]">{store.quoteCurrency} {store.quotePrice.toFixed(2)}</span>
                </div>
                {extraLines.map((line) => (
                  <div key={line.name} className="flex justify-between text-[var(--muted-foreground)]">
                    <span>{line.name}{line.qty > 1 ? ` × ${line.qty}` : ''}</span>
                    <span className="font-medium text-[var(--foreground)]">{store.quoteCurrency} {line.cost.toFixed(2)}</span>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between border-t border-[var(--border)] pt-3 text-base font-bold text-[var(--foreground)]">
                  <span>Total</span>
                  <span style={{ color: pc }}>{store.quoteCurrency} {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white shadow-md transition-opacity disabled:opacity-40"
            style={{ backgroundColor: pc }}
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
              : (paymentMethod === 'ONLINE' ? 'Proceed to Payment' : 'Confirm Booking')}
          </button>

          <p className="text-center text-xs text-[var(--muted-foreground)]">
            By confirming you agree to our terms of service.{' '}
            {paymentMethod === 'ONLINE'
              ? "You'll be redirected to our secure payment provider."
              : 'Payment is collected on arrival.'}
          </p>

          {/* Cancellation policy */}
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-xs font-semibold text-red-700 mb-0.5">Cancellation Policy</p>
            <p className="text-xs text-red-600">
              Free cancellation up to 48 hours before your scheduled pickup. Cancellations within 48 hours of departure cannot be processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
