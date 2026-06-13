'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Clock, Users, Briefcase, Sparkles, Car, AlertCircle, Snowflake, Wifi } from 'lucide-react';
import { useBookingStore } from '@/stores/booking-store';
import { resolveAssetUrl, type SiteSettings } from '@/lib/site-settings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookingSteps } from '@/components/website/booking-steps';
import { useFunnelSticky } from '@/components/website/use-funnel-sticky';
import { FunnelRouteCard, FunnelPoliciesCard } from '@/components/website/funnel-summary';
import { useLocale } from '@/lib/website-i18n';
import { translate } from '@/lib/website-translations';

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
      <span className="w-6 text-center font-bold text-[var(--foreground)]">{value}</span>
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
  const locale = useLocale();
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  const { headerRef, navTop, asideTop } = useFunnelSticky();

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
        message: t('funnel.alertVehicleType', {
          extra: ex.name,
          names: (ex.allowedVehicleTypeNames ?? []).join(', '),
        }),
      });
      return;
    }
    if (ex.occupiesSeat && increasing && seatsLeft <= 0) {
      setCapacityAlert({
        reason: 'capacity',
        extra: ex,
        desiredQty: next,
        message: t('funnel.alertCapacity', {
          seats: seatCapacity,
          pax: store.paxCount,
          extra: ex.name,
        }),
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
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Sticky funnel header: back + progress steps + section title.
          Pins just below the site navbar and stays put while the form scrolls. */}
      <div
        ref={headerRef}
        className="sticky z-40 border-b border-[var(--border)] bg-[var(--muted)] shadow-sm"
        style={{ top: navTop }}
      >
        {/* Back bar */}
        <div className="border-b border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center gap-3">
            <button onClick={() => router.back()} className="text-sm font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
              <span className="rtl:rotate-180">←</span> {t('funnel.back')}
            </button>
          </div>
        </div>
        {/* Steps + title */}
        <div className="mx-auto max-w-5xl px-4 pt-5 pb-4">
          <BookingSteps current={1} primaryColor={pc} steps={[t('funnel.step.vehicle'), t('funnel.step.flight'), t('funnel.step.details')]} />
          <h1 className="mt-6 text-center text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">{t('funnel.flightDetails')}</h1>
          <p className="hidden text-center text-sm text-[var(--muted-foreground)] sm:block">
            {isArr ? t('funnel.flightSubArr') : t('funnel.flightSubDep')}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* ── Left column: flight + extras form ── */}
        <div className="space-y-6">

        {/* Flight info card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-[var(--foreground)] text-sm">
            <Plane className="h-4 w-4" style={{ color: pc }} />
            {t('funnel.flightInformation')}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                {t('funnel.flightNumber')} *
              </Label>
              <Input
                placeholder="e.g. MS777"
                value={store.flightNo}
                onChange={(e) => store.setField('flightNo', e.target.value.toUpperCase())}
                className="border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-1 uppercase"
                style={{ '--tw-ring-color': pc } as React.CSSProperties}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                {t('funnel.terminal')}
              </Label>
              <Input
                placeholder="e.g. T1"
                value={store.terminal}
                onChange={(e) => store.setField('terminal', e.target.value)}
                className="border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-1"
                style={{ '--tw-ring-color': pc } as React.CSSProperties}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {isArr ? t('funnel.originFrom') : t('funnel.destinationTo')}
            </Label>
            <Input
              placeholder="e.g. London Heathrow"
              value={store.carrier}
              onChange={(e) => store.setField('carrier', e.target.value)}
              className="border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-1"
              style={{ '--tw-ring-color': pc } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Return flight card — 2-Way bookings only (departure leg) */}
        {store.roundTrip && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
            <h2 className="flex items-center gap-2 font-semibold text-[var(--foreground)] text-sm">
              <Plane className="h-4 w-4 rotate-90" style={{ color: pc }} />
              {t('funnel.returnFlight')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {t('funnel.returnFlightNumber')}
                </Label>
                <Input
                  placeholder="e.g. MS778"
                  value={store.returnFlightNo}
                  onChange={(e) => store.setField('returnFlightNo', e.target.value.toUpperCase())}
                  className="border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-1 uppercase"
                  style={{ '--tw-ring-color': pc } as React.CSSProperties}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  {t('funnel.terminal')}
                </Label>
                <Input
                  placeholder="e.g. T1"
                  value={store.returnTerminal}
                  onChange={(e) => store.setField('returnTerminal', e.target.value)}
                  className="border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-1"
                  style={{ '--tw-ring-color': pc } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                {t('funnel.destinationTo')}
              </Label>
              <Input
                placeholder="e.g. London Heathrow"
                value={store.returnCarrier}
                onChange={(e) => store.setField('returnCarrier', e.target.value)}
                className="border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus-visible:ring-1"
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
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <h2 className="flex items-center gap-2 font-semibold text-[var(--foreground)] text-sm mb-4">
                <Car className="h-4 w-4" style={{ color: pc }} />
                {t('funnel.yourVehicle')}
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
                  <p className="font-bold text-[var(--foreground)]">{typeName}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                    <Users className="h-3.5 w-3.5" />
                    {t('funnel.capacityN', { n: seats })}
                  </p>
                  {selectedVehicle && (selectedVehicle.airConditioning || selectedVehicle.wifi || selectedVehicle.luggageCapacity != null) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selectedVehicle.airConditioning && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                          <Snowflake className="h-3 w-3" /> {t('funnel.ac')}
                        </span>
                      )}
                      {selectedVehicle.wifi && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                          <Wifi className="h-3 w-3" /> {t('funnel.wifi')}
                        </span>
                      )}
                      {selectedVehicle.luggageCapacity != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] text-[var(--muted-foreground)]">
                          <Briefcase className="h-3 w-3" /> {t('funnel.bags', { n: selectedVehicle.luggageCapacity })}
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
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 font-semibold text-[var(--foreground)] text-sm">
            <Briefcase className="h-4 w-4" style={{ color: pc }} />
            {t('funnel.optionalExtras')}
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
                          {t('funnel.changeVehicle')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {candidates.map((opt) => (
                            <button
                              key={opt.vehicleTypeId}
                              type="button"
                              onClick={() => switchVehicle(opt, capacityAlert)}
                              className="flex items-center gap-2 rounded-lg border border-amber-300 bg-[var(--card)] px-3 py-1.5 transition hover:border-amber-400 hover:shadow-sm"
                            >
                              <Car className="h-3.5 w-3.5 text-amber-600" />
                              <span className="font-semibold text-[var(--foreground)]">{opt.vehicleTypeName}</span>
                              <span className="text-[var(--muted-foreground)]">· {t('funnel.upTo', { n: opt.seatCapacity })}</span>
                              <span className="font-bold" style={{ color: pc }}>
                                {opt.currency} {opt.price.toFixed(2)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-amber-700">
                        {t('funnel.noOtherVehicle')}
                      </p>
                    )}
                  </div>
                );
              })()}
              {catalogExtras.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)]">
                      <Sparkles className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{ex.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {ex.description ? `${ex.description} · ` : ''}
                        {ex.currency} {ex.price.toFixed(2)}
                        {ex.occupiesSeat ? ` · ${t('funnel.occupiesSeat')}` : ''}
                        {(ex.allowedVehicleTypeIds ?? []).length > 0
                          ? ` · ${t('funnel.onlySuffix', { names: (ex.allowedVehicleTypeNames ?? []).join('/') })}`
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
            <Label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{t('funnel.specialRequests')}</Label>
            <textarea
              rows={2}
              placeholder={t('funnel.specialRequestsPh')}
              value={store.notes}
              onChange={(e) => store.setField('notes', e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 resize-none"
              style={{ '--tw-ring-color': pc } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Price summary */}
        {store.quotePrice !== null && (
          <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${pc}12, ${pc}06)`, border: `1px solid ${pc}25` }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-0.5">{t('funnel.yourPrice')}</p>
              <p className="text-xl font-extrabold text-[var(--foreground)]">
                {store.quoteCurrency} {(store.quotePrice + customExtrasTotal).toFixed(2)}
              </p>
              {customExtrasTotal > 0 && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t('funnel.inclExtras', { amount: `${store.quoteCurrency} ${customExtrasTotal.toFixed(2)}` })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <Users className="h-3.5 w-3.5" />
              {t('funnel.paxShort', { n: store.paxCount })} ·
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
          {t('funnel.continueDetails')} <span className="rtl:rotate-180 inline-block">→</span>
        </button>
        </div>

        {/* ── Right column: selected route + policies ── */}
        <aside className="space-y-4 lg:sticky" style={{ top: asideTop }}>
          <FunnelRouteCard primaryColor={pc} />
          <FunnelPoliciesCard primaryColor={pc} />
        </aside>
      </div>
    </div>
  );
}
