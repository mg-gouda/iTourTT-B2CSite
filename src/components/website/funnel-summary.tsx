'use client';

import { MapPin, Navigation, Plane, CalendarDays, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useBookingStore } from '@/stores/booking-store';
import { useLocale } from '@/lib/website-i18n';
import { translate } from '@/lib/website-translations';

/** Shared label helpers for the booking funnel summary cards. */
function useFunnelLabels() {
  const store = useBookingStore();
  const locale = useLocale();
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
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
  return { store, t, isArr, isCity, transferLabel, dateDisplay };
}

/**
 * "Your selected route" card — from/to, transfer type, pickup date/time,
 * optional return leg, and pax. Shared across all booking-funnel steps so the
 * guest always sees their route alongside vehicle / flight / details.
 */
export function FunnelRouteCard({
  primaryColor: pc,
  className = '',
  embedded = false,
}: {
  primaryColor: string;
  className?: string;
  /** Render without the outer card chrome, to sit inside another card. */
  embedded?: boolean;
}) {
  const { store, t, isArr, isCity, transferLabel, dateDisplay } = useFunnelLabels();
  const body = (
    <>
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
    </>
  );
  if (embedded) return body;
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 ${className}`}
      style={{ boxShadow: 'var(--elevation-2)' }}
    >
      {body}
    </div>
  );
}

/** Cancellation + no-show policies card — shared across all funnel steps. */
export function FunnelPoliciesCard({
  primaryColor: pc,
  className = '',
}: {
  primaryColor: string;
  className?: string;
}) {
  const locale = useLocale();
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 ${className}`}
      style={{ boxShadow: 'var(--elevation-1)' }}
    >
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
  );
}
