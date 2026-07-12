'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Button, Panel, Field, Input, Badge, Spinner, EmptyState, cn,
} from '@/components/admin/ui';
import { Radar, Search, ExternalLink, KeyRound } from 'lucide-react';

interface EngineResult {
  engine: string;
  configured: boolean;
  cited: boolean;
  mention: string | null;
  sources: string[];
  error?: string;
}
interface CheckResponse {
  query: string;
  results: EngineResult[];
}
interface Status {
  brand: { name: string; domain: string };
  perplexity: boolean;
  openai: boolean;
  google: boolean;
}

// id must match the backend adapter keys; env is the var the user must set.
const ENGINES = [
  { id: 'perplexity', label: 'Perplexity', env: 'PERPLEXITY_API_KEY' },
  { id: 'openai', label: 'OpenAI / ChatGPT', env: 'OPENAI_API_KEY' },
  { id: 'google', label: 'Google AI Overviews', env: 'SERPAPI_KEY' },
] as const;

const STARTER_QUERIES = [
  'best airport transfer in Hurghada',
  'Cairo airport to pyramids transfer',
  'private transfer Sharm El Sheikh airport to hotel',
  'reliable Egypt airport taxi service',
];

const LABEL: Record<string, string> = Object.fromEntries(
  ENGINES.map((e) => [e.id, e.label]),
);

export default function AiVisibilityPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(ENGINES.map((e) => e.id)),
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CheckResponse | null>(null);

  useEffect(() => {
    api.get<Status>('/ai-visibility/status').then(setStatus).catch(() => {});
  }, []);

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const isConfigured = (id: string) =>
    status ? Boolean((status as any)[id]) : true;

  const run = async (q: string) => {
    if (!q.trim()) return toast.error('Enter a query first');
    if (selected.size === 0) return toast.error('Select at least one engine');
    setLoading(true);
    setData(null);
    try {
      const res = await api.post<CheckResponse>('/ai-visibility/check', {
        query: q.trim(),
        engines: [...selected],
      });
      setData(res);
    } catch (e: any) {
      toast.error(e.message ?? 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  const brand = status?.brand;
  const unconfigured = ENGINES.filter((e) => status && !isConfigured(e.id));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="AI Visibility"
        description={
          brand
            ? `Check whether ${brand.name} (${brand.domain}) is cited by AI answer engines.`
            : 'Check whether the brand is cited by AI answer engines.'
        }
      />

      {/* Setup hints for engines missing an API key */}
      {unconfigured.length > 0 && (
        <Panel className="mb-4 border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
          <div className="flex items-start gap-2.5">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium">Some engines are not configured.</p>
              <p className="mt-1 text-amber-700 dark:text-amber-400/80">
                Add the following to{' '}
                <code className="rounded bg-amber-100 px-1 py-0.5 text-[12px] dark:bg-amber-500/10">
                  backend/.env
                </code>{' '}
                and restart the backend:
              </p>
              <ul className="mt-1.5 space-y-0.5">
                {unconfigured.map((e) => (
                  <li key={e.id}>
                    <code className="rounded bg-amber-100 px-1 py-0.5 text-[12px] dark:bg-amber-500/10">
                      {e.env}
                    </code>{' '}
                    <span className="text-amber-600 dark:text-amber-400/70">→ {e.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      )}

      <Panel className="p-4">
        <Field label="Query">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && run(query)}
              placeholder="e.g. best airport transfer in Hurghada"
            />
            <Button onClick={() => run(query)} disabled={loading} className="shrink-0">
              {loading ? <Spinner /> : <Search className="h-4 w-4" />}
              Check visibility
            </Button>
          </div>
        </Field>

        {/* Engine selection */}
        <div className="mt-3 flex flex-wrap gap-2">
          {ENGINES.map((e) => {
            const on = selected.has(e.id);
            const configured = isConfigured(e.id);
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => toggle(e.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition',
                  on
                    ? 'border-sky-500/60 bg-sky-500/10 text-sky-700 dark:text-sky-300'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    !configured
                      ? 'bg-amber-400'
                      : on
                        ? 'bg-sky-500'
                        : 'bg-slate-300 dark:bg-slate-600',
                  )}
                />
                {e.label}
              </button>
            );
          })}
        </div>

        {/* Starter queries */}
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            Try a starter query
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuery(q);
                  run(q);
                }}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-sky-500/50 dark:hover:text-sky-300"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* Results */}
      <div className="mt-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : !data ? (
          <EmptyState
            title="No check run yet"
            hint="Enter a query and pick engines to see whether your brand is cited."
          />
        ) : data.results.length === 0 ? (
          <EmptyState title="No engines selected" />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Results for{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">
                “{data.query}”
              </span>
            </p>
            {data.results.map((r) => (
              <ResultCard key={r.engine} result={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ result: r }: { result: EngineResult }) {
  const badge = !r.configured ? (
    <Badge tone="amber">Not configured</Badge>
  ) : r.cited ? (
    <Badge tone="green">Cited</Badge>
  ) : (
    <Badge tone="slate">Not cited</Badge>
  );

  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {LABEL[r.engine] ?? r.engine}
          </span>
        </div>
        {badge}
      </div>

      {r.error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{r.error}</p>
      )}

      {!r.configured && !r.error && (
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Add its API key to backend/.env to enable this engine.
        </p>
      )}

      {r.mention && (
        <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
          {r.mention}
        </p>
      )}

      {r.sources.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Sources ({r.sources.length})
          </p>
          <ul className="space-y-1">
            {r.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-sky-600 hover:underline dark:text-sky-400"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{s}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
