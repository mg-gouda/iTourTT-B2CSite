'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Coordinates the booking funnel's two sticky regions so they never overlap.
 *
 * The top funnel header (edit-search / back + progress steps + section title)
 * pins just below the site navbar; the right-hand summary column pins just
 * below that header. Both offsets are measured live — the navbar height varies
 * by header preset and the funnel header height varies by locale / wrapping —
 * so the layout stays correct without magic numbers.
 *
 * Returns:
 *  - `headerRef`  → attach to the sticky funnel header.
 *  - `navTop`     → px offset the funnel header should stick at (under navbar).
 *  - `asideTop`   → px offset the side column should stick at (under header).
 */
export function useFunnelSticky(gap = 12) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [navTop, setNavTop] = useState(64);
  const [asideTop, setAsideTop] = useState(64 + gap);

  useEffect(() => {
    const nav = document.querySelector('nav');
    const measure = () => {
      const navH = nav instanceof HTMLElement ? nav.offsetHeight : 64;
      const headerH = headerRef.current?.offsetHeight ?? 0;
      setNavTop(navH);
      setAsideTop(navH + headerH + gap);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    if (nav instanceof HTMLElement) ro.observe(nav);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [gap]);

  return { headerRef, navTop, asideTop };
}
