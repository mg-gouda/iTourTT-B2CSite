'use client';

import { BadgeCheck, PlaneTakeoff, Headphones, UserCheck } from 'lucide-react';
import type { SiteSettings } from '@/lib/site-settings';
import { useWT } from '@/lib/website-i18n';

interface TrustBarProps {
  settings: SiteSettings;
}

/**
 * Honest value-prop strip — substantiated claims, not fabricated metrics.
 * Reuses existing `features.*` translation keys so all 7 locales stay in
 * parity automatically. Sits between the hero and the features section.
 */
export function TrustBar({ settings }: TrustBarProps) {
  const t = useWT();

  const items = [
    { Icon: BadgeCheck, label: t('features.noFeesTitle') },     // No Hidden Fees
    { Icon: PlaneTakeoff, label: t('features.flightTitle') },   // Flight Monitoring
    { Icon: UserCheck, label: t('features.meetGreetTitle') },   // Meet & Greet Service
    { Icon: Headphones, label: t('features.supportTitle') },    // 24/7 Customer Support
  ];

  return (
    <section className="bg-[var(--muted)] px-4 py-8 sm:py-10">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        {items.map(({ Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-start"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${settings.primaryColor}14` }}
            >
              <Icon className="h-5 w-5" style={{ color: settings.primaryColor }} />
            </span>
            <span className="text-sm font-semibold leading-snug text-[var(--foreground)]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
