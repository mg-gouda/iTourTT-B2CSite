'use client';

import {
  Headphones,
  Shield,
  Star,
  Plane,
  Clock,
  CreditCard,
  MapPin,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { SiteSettings, FeatureItem } from '@/lib/site-settings';
import { useWT, useLocale } from '@/lib/website-i18n';

interface FeaturesSectionProps {
  settings: SiteSettings;
}

const ICON_MAP: Record<string, LucideIcon> = {
  headphones: Headphones,
  shield: Shield,
  star: Star,
  plane: Plane,
  clock: Clock,
  'credit-card': CreditCard,
  'map-pin': MapPin,
  users: Users,
};

const DEFAULT_FEATURE_KEYS = [
  { icon: 'plane',      titleKey: 'features.flightTitle',   descKey: 'features.flightDesc'    },
  { icon: 'star',       titleKey: 'features.meetGreetTitle',descKey: 'features.meetGreetDesc' },
  { icon: 'shield',     titleKey: 'features.driversTitle',  descKey: 'features.driversDesc'   },
  { icon: 'clock',      titleKey: 'features.noFeesTitle',   descKey: 'features.noFeesDesc'    },
  { icon: 'credit-card',titleKey: 'features.paymentTitle',  descKey: 'features.paymentDesc'   },
  { icon: 'headphones', titleKey: 'features.supportTitle',  descKey: 'features.supportDesc'   },
];

export function FeaturesSection({ settings }: FeaturesSectionProps) {
  const t = useWT();
  const locale = useLocale();
  const featuresTitle = locale === 'en' ? settings.featuresTitle : t('site.featuresTitle');

  if (!settings.featuresEnabled) return null;

  const hasCmsFeatures =
    settings.featuresJson && Array.isArray(settings.featuresJson) && settings.featuresJson.length > 0;

  const features: FeatureItem[] = hasCmsFeatures
    ? settings.featuresJson!
    : DEFAULT_FEATURE_KEYS.map((f) => ({
        icon: f.icon,
        title: t(f.titleKey),
        description: t(f.descKey),
      }));

  if (features.length === 0) return null;

  const primary = settings.primaryColor;
  const [anchor, ...support] = features;
  const AnchorIcon = ICON_MAP[anchor.icon] ?? Shield;

  return (
    <section className="bg-[var(--background)] px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="max-w-2xl">
          <p
            className="text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: primary }}
          >
            {settings.siteName}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl lg:text-4xl">
            {featuresTitle}
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">{t('features.subtitle')}</p>
        </div>

        {/* Anchor + support layout */}
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Anchor feature — larger, more weight */}
          <div
            className="relative flex flex-col justify-between overflow-hidden rounded-2xl p-8 lg:col-span-2"
            style={{
              background: `linear-gradient(150deg, ${primary}14, ${primary}05)`,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: primary }}
              >
                <AnchorIcon className="h-7 w-7 text-white" />
              </span>
              <h3 className="mt-6 text-xl font-bold text-[var(--foreground)]">{anchor.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted-foreground)]">
                {anchor.description}
              </p>
            </div>
          </div>

          {/* Support features — compact rows in a 2-col grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
            {support.map((feature, idx) => {
              const Icon = ICON_MAP[feature.icon] ?? Shield;
              return (
                <div
                  key={idx}
                  className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-200 hover:-translate-y-0.5"
                  style={{ boxShadow: 'var(--elevation-1)' }}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${primary}14` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: primary }} />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[var(--foreground)]">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
