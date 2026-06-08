'use client';

import { useEffect, useRef, useState } from 'react';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/public`;

export interface PickedPlace {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// Load the Google Maps JS API (Places library) exactly once per page.
let mapsPromise: Promise<void> | null = null;
function loadMaps(key: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
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
  // Bias autocomplete results toward this point (e.g. selected airport).
  biasLat?: number;
  biasLng?: number;
}

// A Google Places autocomplete input. Renders nothing if the backend has no
// Maps key configured, so it degrades gracefully (the manual zone select stays).
export function PlaceAutocomplete({ onSelect, placeholder, primaryColor, biasLat, biasLng }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

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

  useEffect(() => {
    if (!ready || !inputRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps?.places) return;
    const opts: Record<string, unknown> = {
      fields: ['place_id', 'name', 'formatted_address', 'geometry'],
    };
    if (biasLat != null && biasLng != null) {
      const c = new g.maps.LatLng(biasLat, biasLng);
      opts.bounds = new g.maps.LatLngBounds(c, c);
    }
    const ac = new g.maps.places.Autocomplete(inputRef.current, opts);
    const listener = ac.addListener('place_changed', () => {
      const p = ac.getPlace();
      if (!p?.place_id || !p.geometry?.location) return;
      onSelect({
        placeId: p.place_id,
        name: p.name ?? p.formatted_address ?? '',
        address: p.formatted_address ?? '',
        lat: p.geometry.location.lat(),
        lng: p.geometry.location.lng(),
      });
    });
    return () => listener?.remove?.();
  }, [ready, biasLat, biasLng, onSelect]);

  if (unavailable) return null;

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder ?? 'Search a place on the map…'}
      className="w-full rounded-lg border border-white/15 bg-white/95 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2"
      style={{ ['--tw-ring-color' as string]: primaryColor }}
      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
    />
  );
}
