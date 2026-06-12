'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Clock, Users, Briefcase, Sparkles, Car, AlertCircle, Snowflake, Wifi } from 'lucide-react';
import { useBookingStore } from '@/stores/booking-store';
import { resolveAssetUrl, type SiteSettings } from '@/lib/site-settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookingSteps } from '@/components/website/booking-steps';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/public`;

interface CatalogExtra {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  occupiesSeat: boolean;
  allowedVehicleTypeIds: string[];
  allowedVehicleTypeNames: string[];
}

interface VehicleOption {
  vehicleTypeId: string;
  vehicleTypeName: string;
  seatCapacity: number;
  imageUrl: string | null;
  airConditioning: boolean;
  wifi: boolean;
  luggageCapacity: number | null;
  price: number;
  currency: string;
  driverTip: number;
}

// Why the guest can't add an extra to the current vehicle, plus the change
// they were attempting — used to offer larger/compatible vehicles inline.
interface CapacityAlert {
  reason: 'capacity' | 'vehicle-type';
  message: string;
  extra: CatalogExtra;
  desiredQty: number;
}

interface FlightClientProps { settings: SiteSettings; }

function Stepper({ value, onChange, min = 0, max = 10, color }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
        className="flex h-7 w-7 items-center justify-center rounded-full text-white font-bold disabled:opacity-30"
        style={{ backgroundColor: color }}>−</button>
      <span className="w-6 text-center font-bold text-gray-900">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
        className="flex h-7 w-7 items-center justify-center rounded-full text-white font-bold disabled:opacity-30"
        style={{ backgroundColor: color }}>+</button>
    </div>
  );
}

export function FlightClient({ settings }: FlightClientProps) {
  const router = useRouter();
  const store = useBookingStore();
  const pc = settings.primaryColor;
  const isArr = store.serviceType === 'ARR';

  const [catalogExtras, setCatalogExtras] = useState<CatalogExtra[]>([]);
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([]);
  const [capacityAlert, setCapacityAlert] = useState<CapacityAlert | null>(null);

  useEffect(() => {
    if (!store.vehicleTypeId) { router.replace('/book'); }
  }, [store.vehicleTypeId, router]);

  useEffect(() => {
    let active = true;
    fetch(`${API}/extras`)
      .then((r) => r.json())
      .then((j) => {
        if (active) setCatalogExtras(Array.isArray(j.data) ? j.data : []);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Load the same vehicle options the guest saw on step 1, so they can swap to a
  // larger / compatible vehicle right here without going back to the search.
  useEffect(() => {
    if (!store.fromZoneId || !store.toZoneId || !store.serviceType) return;
    let active = true;
    fetch(`${API}/vehicle-quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceType: store.serviceType,
        fromZoneId: store.fromZoneId,
        toZoneId: store.toZoneId,
        paxCount: store.paxCount,
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        const data = j.data ?? j;
        if (active) setVehicleOptions(data.options ?? []);
      })
      .catch(() => {});
    return () => { active = false; };
  }, [store.fromZoneId, store.toZoneId, store.serviceType, store.paxCount]);

  const qtyFor = (id: string) =>
    store.customExtras.find((e) => e.extraId === id)?.qty ?? 0;

  // Seat-occupying extras (baby/booster seat, wheelchair) share the cabin with the
  // passengers, so pax + those extras must fit the selected vehicle's capacity.
  const seatCapacity = Number(store.quoteBreakdown?.seatCapacity ?? 0);
  const seatExtrasUsed = catalogExtras.reduce(
    (sum, ex) => (ex.occupiesSeat ? sum + qtyFor(ex.id) : sum),
    0,
  );
  const seatsLeft = seatCapacity > 0 ? seatCapacity - store.paxCount - seatExtrasUsed : Infinity;

  // Guard an extra's quantity change against vehicle-type restriction and capacity.
  // Instead of silently disabling the control, surface a clear alert the moment
  // the guest tries to add an extra that won't fit the current vehicle.
  const changeExtraQty = (ex: CatalogExtra, next: number) => {
    const increasing = next > qtyFor(ex.id);
    const allowedIds = ex.allowedVehicleTypeIds ?? [];
    if (
      increasing &&
      allowedIds.length > 0 &&
      !allowedIds.includes(store.vehicleTypeId)
    ) {
      setCapacityAlert({
        reason: 'vehicle-type',
        extra: ex,
        desiredQty: next,
        message:
          `"${ex.name}" can only be carried by ${(ex.allowedVehicleTypeNames ?? []).join(', ')}.` +
          ` Switch your vehicle below to add it — no need to start your search over.`,
      });
      return;
    }
    if (ex.occupiesSeat && increasing && seatsLeft <= 0) {
      setCapacityAlert({
        reason: 'capacity',
        extra: ex,
        desiredQty: next,
        message:
          `This ${seatCapacity}-seat vehicle is full with ${store.paxCount} passenger${store.paxCount !== 1 ? 's' : ''}` +
          ` and the extras already selected. Switch to a larger vehicle below to add "${ex.name}" — no need to start your search over.`,
      });
      return;
    }
    setCapacityAlert(null);
    store.setCustomExtraQty(ex.id, next);
  };

  // Seat usage by every seat-occupying extra except the given one — used to test
  // whether a candidate vehicle could fit pax + extras + the pending addition.
  const seatExtrasExcluding = (extraId: string) =>
    catalogExtras.reduce(
      (sum, ex) => (ex.occupiesSeat && ex.id !== extraId ? sum + qtyFor(ex.id) : sum),
      0,
    );

  // Larger / compatible vehicles that would actually fit the blocked selection.
  // Vehicles too small (or not allowed for the extra) are excluded, so the guest
  // can never switch into a vehicle that still wouldn't work.
  const vehiclesForAlert = (alert: CapacityAlert): VehicleOption[] => {
    const { extra, desiredQty } = alert;
    const allowedIds = extra.allowedVehicleTypeIds ?? [];
    const requiredSeats =
      store.paxCount +
      seatExtrasExcluding(extra.id) +
      (extra.occupiesSeat ? desiredQty : 0);
    return vehicleOptions.filter((opt) => {
      if (opt.vehicleTypeId === store.vehicleTypeId) return false;
      if (allowedIds.length > 0 && !allowedIds.includes(opt.vehicleTypeId)) return false;
      return opt.seatCapacity >= requiredSeats;
    });
  };

  // Swap the vehicle in place (re-quoting price + capacity) and apply the extra
  // the guest was trying to add, all without leaving this step.
  const switchVehicle = (opt: VehicleOption, alert: CapacityAlert) => {
    store.setField('vehicleTypeId', opt.vehicleTypeId);
    store.setQuote(opt.price, opt.currency, {
      vehicleType: opt.vehicleTypeName,
      seatCapacity: opt.seatCapacity,
      driverTip: opt.driverTip,
    });
    store.setCustomExtraQty(alert.extra.id, alert.desiredQty);
    setCapacityAlert(null);
  };

  // Sum catalog extras priced in the quote currency.
  const customExtrasTotal = catalogExtras.reduce((sum, ex) => {
    if (ex.currency !== store.quoteCurrency) return sum;
    return sum + ex.price * qtyFor(ex.id);
  }, 0);

  const selectedVehicle = vehicleOptions.find((v) => v.vehicleTypeId === store.vehicleTypeId) ?? null;

  const canContinue = store.flightNo.trim().length > 0;

  return (
    <div className="min-h-screen pt-16 bg-[var(--muted)]">
      {/* Top bar */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button onClick={() => router.back()} className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
            <span className="rtl:rotate-180">←</span> Back
          </button>
        </div>
      </div>

      <div className="px-4 pt-8">
        <BookingSteps current={1} primaryColor={pc} />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flight details</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isArr ? 'Your arrival flight information so we can monitor delays.' : 'Your departure flight information for scheduling.'}
          </p>
        </div>

        {/* Flight info card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
            <Plane className="h-4 w-4" style={{ color: pc }} />
            Flight Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Flight Number *
              </Label>
              <Input
                placeholder="e.g. MS777"
                value={store.flightNo}
                onChange={(e) => store.setField('flightNo', e.target.value.toUpperCase())}
                className="border-gray-200 bg-gray-50 text-gray-800 focus-visible:ring-1 uppercase"
                style={{ '--tw-ring-color': pc } as React.CSSProperties}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Terminal
              </Label>
              <Input
                placeholder="e.g. T1"
                value={store.terminal}
                onChange={(e) => store.setField('terminal', e.target.value)}
                className="border-gray-200 bg-gray-50 text-gray-800 focus-visible:ring-1"
                style={{ '--tw-ring-color': pc } as React.CSSProperties}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {isArr ? 'Origin (flying from)' : 'Destination (flying to)'}
            </Label>
            <Input
              placeholder="e.g. London Heathrow"
              value={store.carrier}
              onChange={(e) => store.setField('carrier', e.target.value)}
              className="border-gray-200 bg-gray-50 text-gray-800 focus-visible:ring-1"
              style={{ '--tw-ring-color': pc } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Return flight card — 2-Way bookings only (departure leg) */}
        {store.roundTrip && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
              <Plane className="h-4 w-4 rotate-90" style={{ color: pc }} />
              Return Flight (departure)
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Return Flight Number
                </Label>
                <Input
                  placeholder="e.g. MS778"
                  value={store.returnFlightNo}
                  onChange={(e) => store.setField('returnFlightNo', e.target.value.toUpperCase())}
                  className="border-gray-200 bg-gray-50 text-gray-800 focus-visible:ring-1 uppercase"
                  style={{ '--tw-ring-color': pc } as React.CSSProperties}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Terminal
                </Label>
                <Input
                  placeholder="e.g. T1"
                  value={store.returnTerminal}
                  onChange={(e) => store.setField('returnTerminal', e.target.value)}
                  className="border-gray-200 bg-gray-50 text-gray-800 focus-visible:ring-1"
                  style={{ '--tw-ring-color': pc } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Destination (flying to)
              </Label>
              <Input
                placeholder="e.g. London Heathrow"
                value={store.returnCarrier}
                onChange={(e) => store.setField('returnCarrier', e.target.value)}
                className="border-gray-200 bg-gray-50 text-gray-800 focus-visible:ring-1"
                style={{ '--tw-ring-color': pc } as React.CSSProperties}
              />
            </div>
          </div>
        )}

        {/* Selected vehicle card */}
        {(() => {
          const typeName = selectedVehicle?.vehicleTypeName ?? String(store.quoteBreakdown?.vehicleType ?? '');
          const seats = selectedVehicle?.seatCapacity ?? Number(store.quoteBreakdown?.seatCapacity ?? 0);
          if (!typeName) return null;
          return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-semibold text-gray-900 text-sm mb-4">
                <Car className="h-4 w-4" style={{ color: pc }} />
                Your Vehicle
              </h2>
              <div className="flex items-center gap-4">
                {selectedVehicle?.imageUrl && (
                  <img
                    src={resolveAssetUrl(selectedVehicle.imageUrl)}
                    alt={typeName}
                    className="h-16 w-24 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">{typeName}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    Capacity: {seats} seat{seats !== 1 ? 's' : ''}
                  </p>
                  {selectedVehicle && (selectedVehicle.airConditioning || selectedVehicle.wifi || selectedVehicle.luggageCapacity != null) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedVehicle.airConditioning && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                          <Snowflake className="h-3 w-3" /> A/C
                        </span>
                      )}
                      {selectedVehicle.wifi && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                          <Wifi className="h-3 w-3" /> Wi-Fi
                        </span>
                      )}
                      {selectedVehicle.luggageCapacity != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                          <Briefcase className="h-3 w-3" /> {selectedVehicle.luggageCapacity} bags
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Optional extras card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
            <Briefcase className="h-4 w-4" style={{ color: pc }} />
            Optional Extras
          </h2>

          {/* Managed catalog extras */}
          {catalogExtras.length > 0 && (
            <div className="space-y-4">
              {capacityAlert && (() => {
                const candidates = vehiclesForAlert(capacityAlert);
                return (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-3 text-xs text-amber-800 space-y-2.5">
                    <p className="flex items-start gap-2 font-medium leading-relaxed">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>{capacityAlert.message}</span>
                    </p>
                    {candidates.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                          Change vehicle
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {candidates.map((opt) => (
                            <button
                              key={opt.vehicleTypeId}
                              type="button"
                              onClick={() => switchVehicle(opt, capacityAlert)}
                              className="flex items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-1.5 transition hover:border-amber-400 hover:shadow-sm"
                            >
                              <Car className="h-3.5 w-3.5 text-amber-600" />
                              <span className="font-semibold text-gray-900">{opt.vehicleTypeName}</span>
                              <span className="text-gray-400">· up to {opt.seatCapacity}</span>
                              <span className="font-bold" style={{ color: pc }}>
                                {opt.currency} {opt.price.toFixed(2)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-amber-700">
                        No other vehicle on this route can carry the selected passengers and extras.
                      </p>
                    )}
                  </div>
                );
              })()}
              {catalogExtras.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                      <Sparkles className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                      <p className="text-xs text-gray-400">
                        {ex.description ? `${ex.description} · ` : ''}
                        {ex.currency} {ex.price.toFixed(2)}
                        {ex.occupiesSeat ? ' · occupies a seat' : ''}
                        {(ex.allowedVehicleTypeIds ?? []).length > 0
                          ? ` · ${(ex.allowedVehicleTypeNames ?? []).join('/')} only`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <Stepper
                    value={qtyFor(ex.id)}
                    onChange={(v) => changeExtraQty(ex, v)}
                    min={0}
                    max={10}
                    color={pc}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-1.5 pt-2">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Special Requests</Label>
            <textarea
              rows={2}
              placeholder="Any special requirements or notes for the driver…"
              value={store.notes}
              onChange={(e) => store.setField('notes', e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 resize-none"
              style={{ '--tw-ring-color': pc } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Price summary */}
        {store.quotePrice !== null && (
          <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${pc}12, ${pc}06)`, border: `1px solid ${pc}25` }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">Your price</p>
              <p className="text-xl font-extrabold text-gray-900">
                {store.quoteCurrency} {(store.quotePrice + customExtrasTotal).toFixed(2)}
              </p>
              {customExtrasTotal > 0 && (
                <p className="text-xs text-gray-400">
                  incl. {store.quoteCurrency} {customExtrasTotal.toFixed(2)} extras
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Users className="h-3.5 w-3.5" />
              {store.paxCount} pax ·
              <Clock className="h-3.5 w-3.5 ml-1" />
              {store.pickupTime}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/book/details')}
          disabled={!canContinue}
          className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-opacity disabled:opacity-40"
          style={{ backgroundColor: pc }}
        >
          Continue to Your Details →
        </button>

        {/* Cancellation policy */}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-gray-400" />
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Cancellation policy: </span>
            Free cancellation up to 48 hours before your scheduled pickup. Cancellations within 48 hours of departure cannot be processed.
          </p>
        </div>
      </div>
    </div>
  );
}
