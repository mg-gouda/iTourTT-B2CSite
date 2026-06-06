'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useWT } from '@/lib/website-i18n';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'cookie_consent';

type ConsentState = 'pending' | 'decided' | null;

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative shrink-0 h-5 w-9 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        checked ? 'bg-emerald-600' : 'bg-gray-300',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0',
        )}
      />
    </button>
  );
}

export function CookieConsentBanner() {
  const t = useWT();
  const [state, setState] = useState<ConsentState>('pending');
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    setState(localStorage.getItem(STORAGE_KEY) ? 'decided' : null);
  }, []);

  // 'pending' = hydrating (hide to avoid SSR flash); 'decided' = already answered
  if (state !== null) return null;

  const decide = (value: string) => {
    localStorage.setItem(STORAGE_KEY, value);
    setState('decided');
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-5">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {!managing ? (
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{t('cookie.title')}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{t('cookie.body')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setManaging(true)}
                className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                {t('cookie.manage')}
              </button>
              <button
                onClick={() => decide('rejected')}
                className="rounded-lg border border-gray-300 px-3.5 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
              >
                {t('cookie.reject')}
              </button>
              <button
                onClick={() => decide('accepted')}
                className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                {t('cookie.accept')}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">{t('cookie.manageTitle')}</p>
              <button
                onClick={() => setManaging(false)}
                className="rounded-md p-1 text-gray-400 transition hover:text-gray-600"
                aria-label="Back"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Essential — always on */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-800">{t('cookie.essential')}</p>
                <p className="mt-0.5 text-xs text-gray-500">{t('cookie.essentialDesc')}</p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                ON
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-800">{t('cookie.analytics')}</p>
                <p className="mt-0.5 text-xs text-gray-500">{t('cookie.analyticsDesc')}</p>
              </div>
              <Toggle checked={analytics} onChange={setAnalytics} />
            </div>

            {/* Marketing */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-800">{t('cookie.marketing')}</p>
                <p className="mt-0.5 text-xs text-gray-500">{t('cookie.marketingDesc')}</p>
              </div>
              <Toggle checked={marketing} onChange={setMarketing} />
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              <button
                onClick={() => decide('rejected')}
                className="rounded-lg border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
              >
                {t('cookie.reject')}
              </button>
              <button
                onClick={() => decide(JSON.stringify({ essential: true, analytics, marketing }))}
                className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
              >
                {t('cookie.save')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
