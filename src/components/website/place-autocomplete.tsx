'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/public`;

export interface PickedPlace {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Load the Google Maps JS API exactly once per page. We use the new Places API
// (AutocompleteSuggestion / Place), which — unlike the legacy
// google.maps.places.Autocomplete widget — is available to new Cloud projects.
let mapsPromise: Promise<void> | null = null;
function loadMaps(key: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).google?.maps?.importLibrary) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&libraries=places&loading=async`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(s);
  });
  return mapsPromise;
}

interface Props {
  onSelect: (place: PickedPlace) => void;
  placeholder?: string;
  primaryColor?: string;
  // Override the input styling (e.g. to match a light vs. dark surface).
  inputClassName?: string;
  // Bias autocomplete results toward this point (e.g. selected airport).
  biasLat?: number;
  biasLng?: number;
}

interface Suggestion {
  placeId: string;
  primary: string;
  secondary: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prediction: any;
}

// A Google Places autocomplete input built on the new Places API. Renders
// nothing if the backend has no Maps key configured, so it degrades gracefully
// (the manual zone select stays).
export function PlaceAutocomplete({ onSelect, placeholder, primaryColor, inputClassName, biasLat, biasLng }: Props) {
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokenRef = useRef<any>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Fixed-position rect for the portaled dropdown (so it can't be clipped by an
  // ancestor's overflow-hidden, e.g. the booking card).
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null);

  const updatePos = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ left: r.left, top: r.bottom + 4, width: r.width });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/google-maps-key`)
      .then((r) => r.json())
      .then((j) => {
        const key = (j.data ?? j)?.key ?? (j.data ?? j)?.apiKey ?? '';
        if (!key) { setUnavailable(true); return null; }
        return loadMaps(key);
      })
      .then(() => { if (!cancelled) setReady(true); })
      .catch(() => { if (!cancelled) setUnavailable(true); });
    return () => { cancelled = true; };
  }, []);

  const fetchSuggestions = useCallback(async (input: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps?.importLibrary || !input.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    try {
      const { AutocompleteSuggestion, AutocompleteSessionToken } = await g.maps.importLibrary('places');
      if (!tokenRef.current) tokenRef.current = new AutocompleteSessionToken();
      const request: Record<string, unknown> = {
        input,
        sessionToken: tokenRef.current,
      };
      if (biasLat != null && biasLng != null) {
        request.locationBias = { center: { lat: biasLat, lng: biasLng }, radius: 50000 };
      }
      const { suggestions: res } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      const mapped: Suggestion[] = (res ?? [])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((s: any) => {
          const p = s.placePrediction;
          return {
            placeId: p?.placeId,
            primary: p?.mainText?.text ?? p?.text?.text ?? '',
            secondary: p?.secondaryText?.text ?? '',
            prediction: p,
          };
        })
        .filter((s: Suggestion) => !!s.placeId);
      setSuggestions(mapped);
      setOpen(mapped.length > 0);
    } catch {
      setSuggestions([]);
      setOpen(false);
    }
  }, [biasLat, biasLng]);

  const onChange = (v: string) => {
    setValue(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 250);
  };

  const handlePick = async (s: Suggestion) => {
    setOpen(false);
    setValue(s.primary);
    try {
      const place = s.prediction.toPlace();
      await place.fetchFields({ fields: ['id', 'displayName', 'formattedAddress', 'location'] });
      const loc = place.location;
      onSelect({
        placeId: place.id ?? s.placeId,
        name: place.displayName ?? s.primary,
        address: place.formattedAddress ?? [s.primary, s.secondary].filter(Boolean).join(', '),
        lat: typeof loc?.lat === 'function' ? loc.lat() : loc?.lat,
        lng: typeof loc?.lng === 'function' ? loc.lng() : loc?.lng,
      });
    } catch {
      /* fetchFields failed — keep the typed value, no selection emitted */
    }
    // Start a fresh session token after a selection (Places billing best practice).
    tokenRef.current = null;
  };

  // Keep the portaled dropdown aligned to the input while open.
  useEffect(() => {
    if (!open || !suggestions.length) return;
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open, suggestions.length, updatePos]);

  // Close the dropdown when clicking outside the input AND outside the dropdown
  // (the dropdown is portaled, so it isn't inside wrapRef).
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (unavailable) return null;

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={value}
        disabled={!ready}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        placeholder={placeholder ?? 'Search a place on the map…'}
        className={inputClassName ?? "w-full rounded-lg border border-white/15 bg-white/95 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2"}
        style={{ ['--tw-ring-color' as string]: primaryColor }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && pos && typeof document !== 'undefined' &&
        createPortal(
          <ul
            ref={dropdownRef}
            style={{ position: 'fixed', left: pos.left, top: pos.top, width: pos.width, zIndex: 9999 }}
            className="max-h-72 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
          >
            {suggestions.map((s) => (
              <li key={s.placeId}>
                <button
                  type="button"
                  // Pick on mousedown so the selection fires before the input blurs.
                  onMouseDown={(e) => { e.preventDefault(); handlePick(s); }}
                  className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-900">{s.primary}</span>
                  {s.secondary && <span className="text-xs text-gray-500">{s.secondary}</span>}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}
