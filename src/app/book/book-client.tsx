'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Clock, CalendarDays, MapPin, Plane, ChevronRight, Car, Loader2, AlertCircle, Wifi, Snowflake, Cog, Briefcase, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { useBookingStore } from '@/stores/booking-store';
import { resolveAssetUrl, type SiteSettings } from '@/lib/site-settings';
import { BookingSteps } from '@/components/website/booking-steps';
import { useLocale } from '@/lib/website-i18n';
import { translate } from '@/lib/website-translations';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/public`;

interface VehicleOption {
  vehicleTypeId: string;
  vehicleTypeName: string;
  seatCapacity: number;
  imageUrl: string | null;
  description: string | null;
  wifi: boolean;
  airConditioning: boolean;
  transmission: 'MANUAL' | 'AUTOMATIC' | null;
  luggageCapacity: number | null;
  gpsTracked: boolean;
  price: number;
  currency: string;
  driverTip: number;
  boosterSeatPrice: number;
  babySeatPrice: number;
  wheelChairPrice: number;
  // Present on 2-way results: the departure-leg price (outbound + this = price).
  returnPrice?: number;
}

interface BookNowClientProps {
  settings: SiteSettings;
}

export function BookNowClient({ settings }: BookNowClientProps) {
  const router = useRouter();
  const store = useBookingStore();
  const [options, setOptions] = useState<VehicleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pc = settings.primaryColor;
  const locale = useLocale();
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);

  useEffect(() => {
    if (!store.fromZoneId || !store.toZoneId || !store.serviceType) {
      router.replace('/');
      return;
    }
    const quote = (serviceType: string, fromZoneId: string, toZoneId: string) =>
      fetch(`${API}/vehicle-quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceType, fromZoneId, toZoneId, paxCount: store.paxCount }),
      }).then(async (r) => {
        if (!r.ok) throw new Error('NO_RESULTS');
        const j = await r.json();
        return ((j.data ?? j).options ?? []) as VehicleOption[];
      });

    const fetch_ = async () => {
      try {
        const outbound = await quote(store.serviceType, store.fromZoneId, store.toZoneId);
        if (store.roundTrip) {
          // Return leg runs hotel→airport: swap the zones, price as a departure,
          // then combine per vehicle (only vehicles available on BOTH legs).
          const ret = await quote('DEP', store.toZoneId, store.fromZoneId);
          const retById = new Map(ret.map((o) => [o.vehicleTypeId, o]));
          const combined = outbound
            .filter((o) => retById.has(o.vehicleTypeId))
            .map((o) => {
              const r = retById.get(o.vehicleTypeId)!;
              return { ...o, returnPrice: r.price, price: o.price + r.price };
            });
          setOptions(combined);
        } else {
          setOptions(outbound);
        }
      } catch (e: unknown) {
        setError(e instanceof Error && e.message === 'NO_RESULTS' ? t('funnel.errNoResults') : t('funnel.errLoad'));
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [store.fromZoneId, store.toZoneId, store.serviceType, store.paxCount, store.roundTrip, router]);

  const selectVehicle = (opt: VehicleOption) => {
    store.setField('vehicleTypeId', opt.vehicleTypeId);
    store.setField('returnQuotePrice', opt.returnPrice ?? null);
    store.setQuote(opt.price, opt.currency, {
      vehicleType: opt.vehicleTypeName,
      seatCapacity: opt.seatCapacity,
      driverTip: opt.driverTip,
    });
    // City-to-city has no flight — skip straight to guest details.
    router.push(store.serviceType === 'CITY_TO_CITY' ? '/book/details' : '/book/flight');
  };

  const isArr = store.serviceType === 'ARR';
  const isCity = store.serviceType === 'CITY_TO_CITY';
  const transferLabel = isCity
    ? t('funnel.label.cityToCity')
    : store.roundTrip
      ? t('funnel.label.twoWay')
      : isArr
        ? t('funnel.label.arrival')
        : t('funnel.label.departure');
  const dateDisplay = store.jobDate
    ? format(new Date(store.jobDate + 'T12:00:00'), 'EEE, dd MMM yyyy')
    : '';

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Header bar — dark, flush under the navigation (no rounded corners) */}
      <div className="rounded-none bg-[#191919] px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center gap-4 text-sm text-white/70">
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-white/80 hover:text-white transition text-xs font-medium">
            <span className="rtl:rotate-180">←</span> {t('funnel.editSearch')}
          </button>
          <span className="flex items-center gap-1.5 text-white">
            <Plane className="h-3.5 w-3.5" style={{ color: isArr || isCity ? '#22c55e' : '#f87171' }} />
            {transferLabel}{isCity ? '' : ` ${t('funnel.transferSuffix')}`}
          </span>
          {dateDisplay && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-white/70" />
              {dateDisplay} · {store.pickupTime}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-white/70" />
            {t('funnel.paxCount', { n: store.paxCount })}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 lg:items-start">
        {/* ── Left column: vehicle selection ── */}
        <div>
        {/* Step indicator */}
        <div className="mb-10">
          <BookingSteps current={0} primaryColor={pc} steps={[t('funnel.step.vehicle'), t('funnel.step.flight'), t('funnel.step.details')]} />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] text-center mb-2">{t('funnel.chooseVehicle')}</h2>
        <p className="text-[var(--muted-foreground)] text-center text-sm mb-8">{t('funnel.pricesPerVehicle')}</p>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center text-red-600 flex flex-col items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <p>{error}</p>
            <button onClick={() => router.push('/')} className="mt-2 text-sm underline text-red-500 hover:text-red-700">{t('funnel.goBackTry')}</button>
          </div>
        )}

        {!loading && !error && options.length === 0 && (
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-10 text-center text-[var(--muted-foreground)] shadow-sm">
            <Car className="h-10 w-10 mx-auto mb-3 text-[var(--muted-foreground)]" />
            <p className="font-medium">{t('funnel.noVehicles')}</p>
            <p className="text-sm mt-1">{t('funnel.tryDifferent')}</p>
            <button onClick={() => router.push('/')} className="mt-4 text-sm underline hover:text-[var(--foreground)]">{t('funnel.editSearch')}</button>
          </div>
        )}

        {!loading && !error && options.length > 0 && (
          <div className="flex flex-col gap-4">
            {options.map((opt, i) => (
              <button
                key={opt.vehicleTypeId}
                type="button"
                onClick={() => selectVehicle(opt)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] text-left transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:flex-row animate-in fade-in slide-in-from-bottom-2"
                style={{
                  boxShadow: 'var(--elevation-2)',
                  animationDelay: `${i * 70}ms`,
                  animationFillMode: 'both',
                  ['--tw-ring-color' as string]: pc,
                }}
              >
                {/* Vehicle image */}
                <div className="relative h-44 shrink-0 overflow-hidden bg-[var(--muted)] sm:h-auto sm:w-64">
                  {opt.imageUrl ? (
                    <img src={resolveAssetUrl(opt.imageUrl)} alt={opt.vehicleTypeName} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="placeholder-gradient flex h-full min-h-[11rem] items-center justify-center">
                      <Car className="h-16 w-16 text-white/70" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-[var(--foreground)] text-base sm:text-lg">{opt.vehicleTypeName}</h3>
                    <span className="flex items-center gap-1 text-xs font-medium text-[var(--muted-foreground)] shrink-0">
                      <Users className="h-3.5 w-3.5" />
                      {t('funnel.upTo', { n: opt.seatCapacity })}
                    </span>
                  </div>
                  {opt.description && (
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2">{opt.description}</p>
                  )}
                  {/* Amenities */}
                  {(opt.airConditioning || opt.wifi || opt.gpsTracked || opt.transmission || opt.luggageCapacity != null) && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {opt.airConditioning && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                          <Snowflake className="h-3 w-3" /> {t('funnel.ac')}
                        </span>
                      )}
                      {opt.wifi && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                          <Wifi className="h-3 w-3" /> {t('funnel.wifi')}
                        </span>
                      )}
                      {opt.transmission && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                          <Cog className="h-3 w-3" /> {t(opt.transmission === 'AUTOMATIC' ? 'funnel.automatic' : 'funnel.manual')}
                        </span>
                      )}
                      {opt.luggageCapacity != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                          <Briefcase className="h-3 w-3" /> {opt.luggageCapacity}
                        </span>
                      )}
                      {opt.gpsTracked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                          <Navigation className="h-3 w-3" /> {t('funnel.gps')}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex items-end justify-between gap-3 pt-4 border-t border-[var(--border)] sm:mt-auto">
                    <div className="flex flex-col">
                      <span className="text-2xl font-extrabold tracking-tight" style={{ color: pc }}>{opt.currency} {opt.price.toFixed(2)}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {store.roundTrip ? t('funnel.roundTripIncl') : t('funnel.perVehicleIncl')}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform group-hover:scale-[1.03]" style={{ backgroundColor: pc }}>
                      {t('funnel.bookNow')} <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        </div>

        {/* ── Right column: selected route + policies ── */}
        <aside className="mt-8 space-y-4 lg:mt-0 lg:sticky lg:top-24">
          {/* Card 1: Your selected route */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5" style={{ boxShadow: 'var(--elevation-2)' }}>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Navigation className="h-4 w-4" style={{ color: pc }} />
              {t('funnel.selectedRoute')}
            </h2>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{t('funnel.routeFrom')}</p>
                  <p className="font-medium text-[var(--foreground)] break-words">{store.fromPlaceName || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: pc }} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{t('funnel.routeTo')}</p>
                  <p className="font-medium text-[var(--foreground)] break-words">{store.toPlaceName || store.hotelName || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 border-t border-[var(--border)] pt-3">
                <Plane className="h-4 w-4 shrink-0" style={{ color: isArr || isCity ? '#16a34a' : '#dc2626' }} />
                <span className="font-medium text-[var(--foreground)]">{transferLabel}{isCity ? '' : ` ${t('funnel.transferSuffix')}`}</span>
              </div>
              {dateDisplay && (
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                  <span className="text-[var(--foreground)]">
                    <span className="text-[var(--muted-foreground)]">{t('funnel.routeWhen')}: </span>
                    {dateDisplay} · {store.pickupTime}
                  </span>
                </div>
              )}
              {store.roundTrip && store.returnDate && (
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                  <span className="text-[var(--foreground)]">
                    <span className="text-[var(--muted-foreground)]">{t('funnel.routeReturn')}: </span>
                    {format(new Date(store.returnDate + 'T12:00:00'), 'EEE, dd MMM yyyy')}{store.returnTime ? ` · ${store.returnTime}` : ''}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <span className="text-[var(--foreground)]">{t('funnel.paxCount', { n: store.paxCount })}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cancellation & No-Show policies */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5" style={{ boxShadow: 'var(--elevation-1)' }}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <AlertCircle className="h-4 w-4" style={{ color: pc }} />
              {t('funnel.policiesTitle')}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-[var(--foreground)]">{t('funnel.cancellationPolicy')}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-foreground)]">{t('funnel.cancellationPolicyText')}</p>
              </div>
              <div className="border-t border-[var(--border)] pt-3">
                <p className="text-xs font-semibold text-[var(--foreground)]">{t('funnel.noShowPolicy')}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted-foreground)]">{t('funnel.noShowPolicyText')}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
