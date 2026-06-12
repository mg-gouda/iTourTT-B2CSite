'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Users,
  Plane,
  Flag,
  CalendarDays,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  ChevronsUpDown,
  Building2,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
} from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/stores/booking-store';
import type { SiteSettings } from '@/lib/site-settings';
import { useWT } from '@/lib/website-i18n';
import { PlaceAutocomplete, type PickedPlace } from '@/components/website/place-autocomplete';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/public`;

type Tab = 'AIRPORT' | 'CITY';

/* ─── Theme contract ───
 * CTA/action colour and its hover shade come from the admin-injected CMS
 * variables. The brand identity colour (gradients, pills, counters) is the
 * secondary; everything structural below is fixed and theme-independent. */
const PRIMARY = 'var(--website-primary)';
// --website-primary-dark is used directly in the Search button's hover class.
const SECONDARY = 'var(--website-secondary, #2A1A5E)';

// Fixed structural colours — do NOT vary with the theme.
const C_BORDER = '#D0D5DD'; // input borders
const C_DIVIDER = '#F2F4F7'; // hairlines / dividers
const C_LABEL = '#344054'; // field labels
const C_MUTED = '#98A2B3'; // icon / placeholder grey
const C_TEXT = '#212121'; // body text

interface LocationNode {
  id: string;
  name: string;
  type: string;
  children?: LocationNode[];
}

interface BookingWidgetProps {
  settings: SiteSettings;
}

/* ─── Field wrapper ───
 * Uppercase label above a white, 48px-tall bordered input box. */
function Field({ icon: Icon, label, children, className }: {
  icon?: React.ElementType; label: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: C_LABEL }}>
        {label}
      </label>
      <div className="flex h-12 items-center gap-2 rounded-lg bg-white px-3" style={{ border: `0.8px solid ${C_BORDER}` }}>
        {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: C_MUTED }} />}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

/* ─── Section pill (Outbound Trip / Return Trip) ─── */
function SectionPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full text-xs font-bold"
      style={{ padding: '4px 12px', background: `color-mix(in srgb, ${SECONDARY} 8%, white)`, color: SECONDARY }}
    >
      {children}
    </span>
  );
}

/* ─── Passenger stepper ───
 * 24px circular −/+ buttons outlined in the secondary brand colour. */
function Stepper({ value, onChange, min = 0, max = 50 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  const cls =
    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold leading-none transition disabled:opacity-30';
  const st = { border: `1px solid color-mix(in srgb, ${SECONDARY} 15%, transparent)`, color: SECONDARY };
  return (
    <div className="flex w-full items-center justify-between">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
        className={cls} style={st} aria-label="Decrease passengers">−</button>
      <span className="text-sm font-semibold" style={{ color: C_TEXT }}>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
        className={cls} style={st} aria-label="Increase passengers">+</button>
    </div>
  );
}

/* ─── Date Picker ─── */
function DatePicker({ value, onChange, minDate, primaryColor, placeholder }: {
  value: string; onChange: (v: string) => void; minDate?: Date; primaryColor: string; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(value ? new Date(value + 'T12:00:00') : new Date());
  const selected = value ? new Date(value + 'T12:00:00') : null;
  const today = startOfDay(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 }),
  });

  const isDisabled = (d: Date) => minDate ? isBefore(startOfDay(d), startOfDay(minDate)) : false;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="w-full truncate text-left">
          {selected
            ? <span className="text-sm font-medium" style={{ color: C_TEXT }}>{format(selected, 'EEE, dd MMM yyyy')}</span>
            : <span className="text-sm" style={{ color: C_MUTED }}>{placeholder}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-2xl border border-gray-100" align="start" sideOffset={8}>
        <div className="p-4 w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => setViewMonth(subMonths(viewMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">{format(viewMonth, 'MMMM yyyy')}</span>
            <button type="button" onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition">
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day) => {
              const isSelected = selected && isSameDay(day, selected);
              const isToday = isSameDay(day, today);
              const inMonth = isSameMonth(day, viewMonth);
              const disabled = isDisabled(day);
              return (
                <button key={day.toISOString()} type="button" disabled={disabled}
                  onClick={() => { onChange(format(day, 'yyyy-MM-dd')); setOpen(false); }}
                  className={[
                    'flex h-8 w-8 mx-auto items-center justify-center rounded-full text-xs font-medium transition',
                    !inMonth ? 'text-gray-300' : '',
                    disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100',
                    isToday && !isSelected ? 'ring-1 ring-gray-300' : '',
                    isSelected ? 'text-white font-bold' : inMonth && !disabled ? 'text-gray-800' : '',
                  ].join(' ')}
                  style={isSelected ? { backgroundColor: primaryColor } : {}}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ─── Time Picker ─── */
function TimePicker({ value, onChange, primaryColor, placeholder }: {
  value: string; onChange: (v: string) => void; primaryColor: string; placeholder: string;
}) {
  const t = useWT();
  const [open, setOpen] = useState(false);
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00','05','10','15','20','25','30','35','40','45','50','55'];
  const [selH, selM] = value ? value.split(':') : ['', ''];
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (selH && hourRef.current) {
      const el = hourRef.current.querySelector(`[data-h="${selH}"]`) as HTMLElement;
      el?.scrollIntoView({ block: 'center' });
    }
    if (selM && minRef.current) {
      const el = minRef.current.querySelector(`[data-m="${selM}"]`) as HTMLElement;
      el?.scrollIntoView({ block: 'center' });
    }
  }, [open, selH, selM]);

  const pick = (h: string, m: string) => { if (h && m) { onChange(`${h}:${m}`); setOpen(false); } };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="flex items-center gap-1 whitespace-nowrap text-left">
          {value
            ? <span className="text-sm font-medium" style={{ color: C_TEXT }}>{value}</span>
            : <span className="text-sm" style={{ color: C_MUTED }}>{placeholder}</span>}
          <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: C_MUTED }} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white rounded-2xl shadow-2xl border border-gray-100" align="start" sideOffset={8}>
        <div className="flex">
          <div ref={hourRef} className="h-48 w-16 overflow-y-auto scrollbar-none border-r border-gray-100 py-2">
            {hours.map((h) => (
              <button key={h} data-h={h} type="button" onClick={() => pick(h, selM || '00')}
                className="flex h-9 w-full items-center justify-center text-sm font-medium transition rounded-lg"
                style={selH === h ? { backgroundColor: primaryColor, color: 'white' } : { color: '#374151' }}>{h}</button>
            ))}
          </div>
          <div ref={minRef} className="h-48 w-16 overflow-y-auto scrollbar-none py-2">
            {minutes.map((m) => (
              <button key={m} data-m={m} type="button" onClick={() => pick(selH || '08', m)}
                className="flex h-9 w-full items-center justify-center text-sm font-medium transition rounded-lg"
                style={selM === m ? { backgroundColor: primaryColor, color: 'white' } : { color: '#374151' }}>{m}</button>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-100 px-3 py-2 text-center">
          <span className="text-xs text-gray-400">{t('booking.hourMinute')}</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ─── Searchable combobox ───
 * Popover-based (no cmdk) so it drops into the public B2C site unchanged.
 * Options may carry an optional `group`; consecutive options sharing a group
 * render under one heading, and the query also matches on group name so e.g.
 * typing a zone reveals all its hotels. */
interface ComboOption { value: string; label: string; group?: string }

function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  primaryColor,
  disabled = false,
  emptyText = 'No results',
}: {
  value: string;
  onValueChange: (v: string) => void;
  options: ComboOption[];
  placeholder: string;
  primaryColor: string;
  disabled?: boolean;
  emptyText?: string;
}) {
  const t = useWT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter(
        (o) => o.label.toLowerCase().includes(q) || (o.group ?? '').toLowerCase().includes(q),
      )
    : options;

  // Group consecutive options, preserving the incoming order.
  const groups: { name: string | undefined; items: ComboOption[] }[] = [];
  for (const o of filtered) {
    const last = groups[groups.length - 1];
    if (last && last.name === o.group) last.items.push(o);
    else groups.push({ name: o.group, items: [o] });
  }

  const close = () => { setOpen(false); setQuery(''); };

  return (
    <Popover open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <PopoverTrigger asChild disabled={disabled}>
        <button type="button" disabled={disabled}
          className="flex w-full items-center justify-between gap-1 text-left disabled:cursor-not-allowed disabled:opacity-50">
          <span className="truncate text-sm"
            style={{ color: selected ? C_TEXT : C_MUTED, fontWeight: selected ? 500 : 400 }}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0" style={{ color: C_MUTED }} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8}
        className="w-[var(--radix-popover-trigger-width)] min-w-56 p-0">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={t('booking.searchPlaceholder')}
            className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400" />
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-gray-400">{emptyText}</div>
          ) : (
            groups.map((g, gi) => (
              <div key={g.name ?? gi}>
                {g.name && (
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {g.name}
                  </p>
                )}
                {g.items.map((o) => {
                  const active = o.value === value;
                  return (
                    <button key={o.value} type="button"
                      onClick={() => { onValueChange(o.value); close(); }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                      style={active ? { color: primaryColor } : undefined}>
                      <span className="truncate">{o.label}</span>
                      {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* ─── Booking Widget ─── */
export function BookingWidget({ settings }: BookingWidgetProps) {
  const router = useRouter();
  const store = useBookingStore();

  const [activeTab, setActiveTab] = useState<Tab>('AIRPORT');
  const [locations, setLocations] = useState<LocationNode[]>([]);
  const [placeMsg, setPlaceMsg] = useState('');

  const t = useWT();

  // Two tabs only: Airport Transfer (always on; One Way / Return Transfer via the
  // radio inside it) and City-to-City (admin master switch). The old separate
  // 2-Way and Departure tabs are folded into the Airport tab's radio group.
  const tabs = (
    [
      { key: 'AIRPORT' as Tab, label: t('booking.airportTransfer'), Icon: Plane, on: true },
      { key: 'CITY' as Tab, label: t('booking.cityToCity'), Icon: Building2, on: settings.enableCityToCityTab },
    ] as const
  ).filter((d) => d.on);

  useEffect(() => {
    const svc = activeTab === 'CITY' ? 'CITY_TO_CITY' : 'ARR';
    store.setField('serviceType', svc);
    // One Way is the default; the radio toggles roundTrip on the Airport tab.
    store.setField('roundTrip', false);
    store.setField('fromZoneId', '');
    store.setField('toZoneId', '');
    store.setField('originAirportId', '');
    store.setField('destinationAirportId', '');
    store.setField('hotelId', '');
    store.setField('hotelName', '');
    store.setField('pickupPlaceId', '');
    store.setField('dropoffPlaceId', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    fetch(`${API}/locations`)
      .then((r) => r.json())
      .then((data) => setLocations(Array.isArray(data) ? data : data.data || []))
      .catch(() => setLocations([]));
  }, []);

  const airports = useCallback((nodes: LocationNode[]): { id: string; name: string }[] => {
    const list: { id: string; name: string }[] = [];
    const walk = (n: LocationNode) => { if (n.type === 'AIRPORT') list.push({ id: n.id, name: n.name }); n.children?.forEach(walk); };
    nodes.forEach(walk);
    return list;
  }, [])(locations);

  // Zones (each with its hotels) that sit under the selected airport, so the
  // destination list is cascaded to that airport instead of every zone globally.
  const zonesForAirport = useCallback(
    (nodes: LocationNode[], airportId: string): { id: string; name: string; hotels: { id: string; name: string }[] }[] => {
      if (!airportId) return [];
      const list: { id: string; name: string; hotels: { id: string; name: string }[] }[] = [];
      for (const country of nodes) {
        for (const airport of country.children ?? []) {
          if (airport.id !== airportId || airport.type !== 'AIRPORT') continue;
          for (const city of airport.children ?? []) {
            for (const zone of city.children ?? []) {
              if (zone.type !== 'ZONE') continue;
              list.push({
                id: zone.id,
                name: zone.name,
                hotels: (zone.children ?? [])
                  .filter((h) => h.type === 'HOTEL')
                  .map((h) => ({ id: h.id, name: h.name })),
              });
            }
          }
        }
      }
      return list;
    },
    [],
  );

  const firstZoneForAirport = useCallback((nodes: LocationNode[], airportId: string): string | null => {
    for (const country of nodes) {
      for (const airport of country.children ?? []) {
        if (airport.id !== airportId || airport.type !== 'AIRPORT') continue;

        const allZones: LocationNode[] = [];
        for (const city of airport.children ?? [])
          for (const zone of city.children ?? [])
            if (zone.type === 'ZONE') allZones.push(zone);

        if (!allZones.length) return null;

        // Prefer the zone whose name best matches the airport name
        // (admins typically create an "Airport Zone" named after the airport for pricing)
        const airWords = airport.name.toLowerCase().split(/\s+/);
        const scored = allZones.map((z) => {
          const zWords = z.name.toLowerCase().split(/\s+/);
          if (z.name.toLowerCase() === airport.name.toLowerCase()) return { id: z.id, score: 9999 };
          return { id: z.id, score: airWords.filter((w) => zWords.includes(w)).length };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored[0].id;
      }
    }
    return null;
  }, []);

  // All zones across every city, grouped by city name — for the City-to-City tab.
  const allZonesGrouped = (() => {
    const out: { value: string; label: string; group: string }[] = [];
    for (const country of locations) {
      for (const airport of country.children ?? []) {
        for (const city of airport.children ?? []) {
          for (const zone of city.children ?? []) {
            if (zone.type !== 'ZONE') continue;
            out.push({ value: `z:${zone.id}`, label: zone.name, group: city.name });
          }
        }
      }
    }
    return out;
  })();

  // Airport transfers are always arrival-oriented (pickup = airport → drop-off =
  // hotel). A Return Transfer simply adds the mirrored departure leg.
  const isCity = activeTab === 'CITY';
  const isAirport = !isCity;
  const isArr = isAirport;

  const zoneNameById = (id: string): string => {
    if (!id) return '';
    for (const country of locations)
      for (const airport of country.children ?? [])
        for (const city of airport.children ?? [])
          for (const zone of city.children ?? [])
            if (zone.id === id) return zone.name;
    return '';
  };

  const handleAirportChange = (airportId: string) => {
    store.setField(isArr ? 'originAirportId' : 'destinationAirportId', airportId);
    const zoneId = firstZoneForAirport(locations, airportId);
    if (zoneId) store.setField(isArr ? 'fromZoneId' : 'toZoneId', zoneId);
    store.setField(isArr ? 'toZoneId' : 'fromZoneId', '');
    store.setField('hotelId', '');
    store.setField('hotelName', '');
    store.setField('dropoffPlaceId', '');
    store.setField('pickupPlaceId', '');
    setPlaceMsg('');
  };

  const airportValue = isArr ? store.originAirportId : store.destinationAirportId;
  const hotelZone = isArr ? store.toZoneId : store.fromZoneId;

  const airportSideZone = isArr ? store.fromZoneId : store.toZoneId;
  const destZones = zonesForAirport(locations, airportValue).filter((z) => z.id !== airportSideZone);

  // For the Return Transfer's read-only departure leg: pickup = the one-way
  // drop-off (hotel/zone), drop-off = the one-way pickup (airport).
  const airportName = airports.find((a) => a.id === airportValue)?.name ?? '';
  const dropoffName = store.hotelName || zoneNameById(hotelZone);

  const selectedDestValue = store.hotelId
    ? `h:${store.hotelId}:${hotelZone}`
    : hotelZone
      ? `z:${hotelZone}`
      : '';

  const handleDestinationChange = (value: string) => {
    const [kind, a, b] = value.split(':');
    const zoneField = isArr ? 'toZoneId' : 'fromZoneId';
    if (kind === 'h') {
      store.setField(zoneField, b);
      store.setField('hotelId', a);
      const hotel = destZones.flatMap((z) => z.hotels).find((h) => h.id === a);
      store.setField('hotelName', hotel?.name ?? '');
    } else {
      store.setField(zoneField, a);
      store.setField('hotelId', '');
      store.setField('hotelName', '');
    }
  };

  // Resolve a Google Places pick to a pricing zone (+ hotel), auto-creating one
  // under the nearest zone when needed. The hotel-side zone is set on success;
  // the precise point is stored as drop-off (ARR/TWO_WAY/CITY) or pick-up (DEP).
  const handlePlace = async (place: PickedPlace) => {
    setPlaceMsg(t('booking.locating'));
    try {
      const res = await fetch(`${API}/resolve-place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: place.placeId,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          airportId: isCity ? undefined : airportValue || undefined,
        }),
      });
      const data = (await res.json())?.data;
      if (!data?.matched) {
        setPlaceMsg(t('booking.placeOutside'));
        return;
      }
      const zoneField = isArr ? 'toZoneId' : 'fromZoneId';
      store.setField(zoneField, data.zoneId);
      store.setField('hotelId', data.hotelId ?? '');
      store.setField('hotelName', data.hotelName ?? place.name);
      const side = isArr ? 'dropoff' : 'pickup';
      store.setField(`${side}PlaceId`, place.placeId);
      store.setField(`${side}Lat`, place.lat);
      store.setField(`${side}Lng`, place.lng);
      store.setField(`${side}Address`, place.address);
      setPlaceMsg(`${t('booking.placeSet')} ${data.zoneName}`);
    } catch {
      setPlaceMsg(t('booking.placeError'));
    }
  };

  const handleSearch = () => {
    router.push('/book');
  };

  const baseValid = store.fromZoneId && store.toZoneId && store.jobDate && store.pickupTime && store.paxCount > 0;
  const canSearch = isCity
    ? baseValid && store.fromZoneId !== store.toZoneId
    : store.roundTrip
      ? baseValid && airportValue && hotelZone && store.returnDate && store.returnTime
      : baseValid && airportValue && hotelZone;

  // Combined Date + Time box — both legs share this layout, so build it once.
  const dateTimeField = (
    dateVal: string,
    onDate: (v: string) => void,
    timeVal: string,
    onTime: (v: string) => void,
    minDate: Date,
  ) => (
    <Field icon={CalendarDays} label={`${t('booking.date')} *`}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <DatePicker value={dateVal} onChange={onDate} minDate={minDate} primaryColor={PRIMARY} placeholder={t('booking.pickDate')} />
        </div>
        <span className="h-5 w-px shrink-0" style={{ background: C_DIVIDER }} />
        <TimePicker value={timeVal} onChange={onTime} primaryColor={PRIMARY} placeholder="HH:MM" />
      </div>
    </Field>
  );

  return (
    <div>

      {/* Tabs — active tab is white (merges into the card); inactive tabs use
          the translucent-white treatment to sit on the hero gradient. */}
      <div className="flex items-center gap-1.5 px-1">
        {tabs.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button key={key} type="button" onClick={() => { setActiveTab(key); setPlaceMsg(''); }}
              className="flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-xs font-bold transition sm:px-5 sm:text-sm"
              style={active
                ? { backgroundColor: '#fff', color: PRIMARY }
                : { backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* White form card */}
      <div className="overflow-hidden rounded-2xl bg-white"
        style={{ border: `0.8px solid color-mix(in srgb, ${SECONDARY} 6%, transparent)`, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>

        {/* One Way / Return Transfer radio — Airport tab only, and only when the
            admin has enabled return (2-way) transfers. */}
        {isAirport && settings.enableTwoWayTab && (
          <>
            <div className="flex items-center gap-6 px-5 py-3.5">
              {[
                { value: false, label: t('booking.oneWay') },
                { value: true, label: t('booking.returnTransfer') },
              ].map((opt) => {
                const active = store.roundTrip === opt.value;
                return (
                  <button key={String(opt.value)} type="button"
                    onClick={() => store.setField('roundTrip', opt.value)}
                    className="flex items-center gap-2 text-sm font-semibold"
                    style={{ color: active ? C_TEXT : C_LABEL }}>
                    <span className="flex items-center justify-center rounded-full"
                      style={{ width: 18, height: 18, border: `1.5px solid ${active ? PRIMARY : C_BORDER}`, backgroundColor: active ? PRIMARY : '#fff' }}>
                      {active && <span className="rounded-full bg-white" style={{ width: 6, height: 6 }} />}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div style={{ height: '0.8px', background: C_DIVIDER }} />
          </>
        )}

        {/* Fields */}
        <div className="p-5">

          {isAirport && store.roundTrip && (
            <div className="mb-3"><SectionPill>{t('booking.outboundTrip')}</SectionPill></div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {isCity ? (
              <>
                <Field icon={MapPin} label={`${t('booking.originCity')} *`}>
                  <SearchableSelect
                    value={store.fromZoneId ? `z:${store.fromZoneId}` : ''}
                    onValueChange={(v) => store.setField('fromZoneId', v.split(':')[1])}
                    options={allZonesGrouped}
                    placeholder={t('booking.selectOrigin')}
                    primaryColor={PRIMARY}
                    emptyText={t('booking.noDestinations')}
                  />
                </Field>
                <Field icon={Flag} label={`${t('booking.destinationCity')} *`}>
                  <SearchableSelect
                    value={store.toZoneId ? `z:${store.toZoneId}` : ''}
                    onValueChange={(v) => store.setField('toZoneId', v.split(':')[1])}
                    options={allZonesGrouped}
                    placeholder={t('booking.selectDestination')}
                    primaryColor={PRIMARY}
                    emptyText={t('booking.noDestinations')}
                  />
                </Field>
              </>
            ) : (
              <>
                <Field icon={MapPin} label={`${t('booking.pickup')} *`}>
                  <SearchableSelect
                    value={store.originAirportId}
                    onValueChange={handleAirportChange}
                    options={airports.map((a) => ({ value: a.id, label: a.name }))}
                    placeholder={t('booking.selectAirport')}
                    primaryColor={PRIMARY}
                    emptyText={t('booking.selectAirport')}
                  />
                </Field>
                <Field icon={Flag} label={`${t('booking.dropoff')} *`}>
                  <SearchableSelect
                    value={selectedDestValue}
                    onValueChange={handleDestinationChange}
                    options={destZones.flatMap((z) => [
                      { value: `z:${z.id}`, label: `${t('booking.anywhereIn')} ${z.name}`, group: z.name },
                      ...z.hotels.map((h) => ({ value: `h:${h.id}:${z.id}`, label: h.name, group: z.name })),
                    ])}
                    placeholder={airportValue ? t('booking.searchLocation') : t('booking.selectAirport')}
                    primaryColor={PRIMARY}
                    disabled={!airportValue}
                    emptyText={t('booking.noDestinations')}
                  />
                </Field>
              </>
            )}

            {dateTimeField(store.jobDate, (v) => store.setField('jobDate', v), store.pickupTime, (v) => store.setField('pickupTime', v), new Date())}

            {/* Passengers + Search share the 4th column. */}
            <div className="flex items-end gap-2">
              <Field icon={Users} label={`${t('booking.passengers')} *`} className="flex-1">
                <Stepper value={store.paxCount} onChange={(v) => store.setField('paxCount', v)} min={1} max={50} />
              </Field>
              <button type="button" onClick={handleSearch} disabled={!canSearch}
                aria-label={t('booking.search')}
                className="flex shrink-0 items-center justify-center rounded-lg bg-[var(--website-primary)] text-white transition-colors hover:bg-[var(--website-primary-dark)] disabled:opacity-40"
                style={{ width: 56, height: 48 }}>
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Return Transfer → mirrored departure leg. Pickup auto-populates as the
              one-way drop-off (hotel), drop-off as the one-way pickup (airport);
              the guest only chooses the return date & time. */}
          {isAirport && store.roundTrip && (
            <div className="mt-4">
              <div className="mb-3"><SectionPill>{t('booking.returnTrip')}</SectionPill></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <Field icon={MapPin} label={`${t('booking.pickup')} *`}>
                  {dropoffName
                    ? <span className="block truncate text-sm font-medium" style={{ color: C_TEXT }}>{dropoffName}</span>
                    : <span className="block truncate text-sm" style={{ color: C_MUTED }}>{t('booking.dropoffHotel')}</span>}
                </Field>
                <Field icon={Flag} label={`${t('booking.dropoff')} *`}>
                  {airportName
                    ? <span className="block truncate text-sm font-medium" style={{ color: C_TEXT }}>{airportName}</span>
                    : <span className="block truncate text-sm" style={{ color: C_MUTED }}>{t('booking.selectAirport')}</span>}
                </Field>
                {dateTimeField(
                  store.returnDate,
                  (v) => store.setField('returnDate', v),
                  store.returnTime,
                  (v) => store.setField('returnTime', v),
                  store.jobDate ? new Date(store.jobDate + 'T12:00:00') : new Date(),
                )}
                <Field icon={Users} label={`${t('booking.passengers')} *`}>
                  <Stepper value={store.paxCount} onChange={(v) => store.setField('paxCount', v)} min={1} max={50} />
                </Field>
              </div>
            </div>
          )}

          {/* Optional Google Maps place picker (admin-toggled) */}
          {settings.enableMapSelector && (isCity || airportValue) && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px]" style={{ color: C_MUTED }}>
                <MapPin className="h-3 w-3" />
                {t('booking.orPickOnMap')}
              </div>
              <PlaceAutocomplete
                onSelect={handlePlace}
                primaryColor={PRIMARY}
                placeholder={t('booking.searchPlace')}
                inputClassName="h-12 w-full rounded-lg border-[0.8px] border-[#D0D5DD] bg-white px-3 text-sm text-[#212121] outline-none placeholder:text-[#98A2B3] focus:ring-2"
              />
              {placeMsg && <p className="mt-1 text-[11px]" style={{ color: '#667085' }}>{placeMsg}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
