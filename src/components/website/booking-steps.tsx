'use client';

import { Check } from 'lucide-react';

interface BookingStepsProps {
  /** 0-based index of the active step. */
  current: number;
  primaryColor: string;
  steps?: string[];
}

const DEFAULT_STEPS = ['Select Vehicle', 'Flight & Extras', 'Your Details'];

/**
 * Shared funnel progress bar — one source of truth for all three booking
 * steps. A connecting track sits behind the nodes; the completed portion is
 * brand-coloured. Completed = check, active = filled + soft ring, future =
 * muted outline.
 */
export function BookingSteps({ current, primaryColor, steps = DEFAULT_STEPS }: BookingStepsProps) {
  const last = steps.length - 1;
  // Completed fraction of the connector track (0 → first node, 1 → last node).
  const progress = last > 0 ? Math.min(current, last) / last : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative flex items-start justify-between">
        {/* Track (behind nodes) — sits on the node centre line (top 1rem of a 2rem node). */}
        <div className="absolute inset-x-5 top-4 -z-0 h-0.5 -translate-y-1/2 rounded-full bg-[var(--border)]" />
        <div
          className="absolute left-5 top-4 -z-0 h-0.5 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{
            width: `calc((100% - 2.5rem) * ${progress})`,
            backgroundColor: primaryColor,
          }}
        />

        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={label} className="relative z-10 flex flex-1 flex-col items-center gap-2 text-center">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                style={
                  done || active
                    ? {
                        backgroundColor: primaryColor,
                        color: '#fff',
                        boxShadow: active ? `0 0 0 4px ${primaryColor}26` : undefined,
                      }
                    : {
                        backgroundColor: 'var(--card)',
                        color: 'var(--muted-foreground)',
                        boxShadow: 'inset 0 0 0 1.5px var(--border)',
                      }
                }
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-[11px] font-semibold leading-tight sm:text-xs ${
                  active
                    ? 'text-[var(--foreground)]'
                    : done
                      ? 'text-[var(--foreground)]/70'
                      : 'text-[var(--muted-foreground)]'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
