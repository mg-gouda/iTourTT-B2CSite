'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import { Button, Field, Input, Textarea, Panel, Spinner, cn } from './ui';
import { ConfirmDialog } from './dialog';
import { Languages, Sparkles, Save, Trash2, ChevronDown } from 'lucide-react';

export const LOCALES: { code: string; label: string; flag: string }[] = [
  { code: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { code: 'de', label: 'German', flag: '🇩🇪' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
  { code: 'it', label: 'Italian', flag: '🇮🇹' },
  { code: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { code: 'ru', label: 'Russian', flag: '🇷🇺' },
];

export interface TransField {
  key: string;
  label: string;
  type?: 'input' | 'textarea' | 'html';
}

/**
 * Reusable translations editor embedded in each content editor.
 * - entity: the /translate AI entity key (e.g. 'blog_post')
 * - basePath: translation route prefix, e.g. `/blog/${id}` — panel hits
 *   `${basePath}/translations` (GET) and `${basePath}/translations/${locale}` (PUT/DELETE)
 * - id: the same identifier the AI endpoint expects (post id / cityId / pageKey / …)
 */
export function TranslationPanel({
  entity, basePath, id, fields, disabled, disabledHint,
}: {
  entity: string;
  basePath: string;
  id: string;
  fields: TransField[];
  disabled?: boolean;
  disabledHint?: string;
}) {
  const [openPanel, setOpenPanel] = useState(false);
  const [locale, setLocale] = useState(LOCALES[0].code);
  const [byLocale, setByLocale] = useState<Record<string, any>>({});
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const load = async () => {
    if (disabled) return;
    setLoading(true);
    try {
      const res = await api.get<{ translations: Record<string, any> }>(`${basePath}/translations`);
      setByLocale(res?.translations ?? {});
    } catch {
      setByLocale({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (openPanel) load(); /* eslint-disable-next-line */ }, [openPanel, basePath]);

  // Populate the form when switching locale or after (re)load.
  useEffect(() => {
    const t = byLocale[locale] ?? {};
    const next: Record<string, string> = {};
    for (const f of fields) next[f.key] = t[f.key] ?? '';
    setForm(next);
    // eslint-disable-next-line
  }, [locale, byLocale]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      for (const f of fields) if (form[f.key]?.trim()) body[f.key] = form[f.key];
      await api.put(`${basePath}/translations/${locale}`, body);
      toast.success(`${localeLabel(locale)} translation saved`);
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    try {
      await api.del(`${basePath}/translations/${locale}`);
      toast.success(`${localeLabel(locale)} translation removed`);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const aiTranslate = async () => {
    setTranslating(true);
    try {
      const res = await api.post<{ translation: Record<string, any> }>('/translate', {
        entity, id, locale, save: true,
      });
      const t = res?.translation ?? {};
      setForm((f) => {
        const next = { ...f };
        for (const fld of fields) if (t[fld.key] != null) next[fld.key] = String(t[fld.key]);
        return next;
      });
      toast.success(`Auto-translated to ${localeLabel(locale)}`);
      load();
    } catch (e: any) {
      toast.error(e.message?.includes('GEMINI') || e.status === 502
        ? 'AI translate unavailable — set a valid GEMINI_API_KEY on the server.'
        : e.message);
    } finally { setTranslating(false); }
  };

  const hasTranslation = (code: string) => !!byLocale[code];

  return (
    <Panel className="overflow-hidden">
      <button
        type="button"
        onClick={() => !disabled && setOpenPanel((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Languages className="h-4 w-4 text-sky-400" /> Translations
          <span className="text-xs font-normal text-slate-500">
            {disabled ? '(save first)' : `${Object.keys(byLocale).length}/${LOCALES.length} locales`}
          </span>
        </span>
        {!disabled && <ChevronDown className={cn('h-4 w-4 text-slate-500 dark:text-slate-400 transition', openPanel && 'rotate-180')} />}
      </button>

      {disabled && disabledHint && (
        <p className="px-4 pb-3 text-xs text-slate-500">{disabledHint}</p>
      )}

      {openPanel && !disabled && (
        <div className="border-t border-slate-200 dark:border-slate-800 p-4">
          {/* Locale tabs */}
          <div className="mb-4 flex flex-wrap gap-1">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLocale(l.code)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition',
                  locale === l.code ? 'bg-sky-500/15 text-sky-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
                )}
              >
                <span>{l.flag}</span> {l.label}
                {hasTranslation(l.code) && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Editing <b className="text-slate-700 dark:text-slate-300">{localeLabel(locale)}</b> — English is the base.
                </span>
                <Button variant="outline" onClick={aiTranslate} disabled={translating} className="h-8 px-2.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5" /> {translating ? 'Translating…' : 'AI translate'}
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((f) => (
                  <Field key={f.key} label={f.label}>
                    {f.type === 'textarea' || f.type === 'html' ? (
                      <Textarea
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        value={form[f.key] ?? ''}
                        onChange={(e) => set(f.key, e.target.value)}
                        className={f.type === 'html' ? 'min-h-32 font-mono text-xs' : ''}
                      />
                    ) : (
                      <Input
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        value={form[f.key] ?? ''}
                        onChange={(e) => set(f.key, e.target.value)}
                      />
                    )}
                  </Field>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button onClick={save} disabled={saving} className="h-8 px-3 text-xs">
                  <Save className="h-3.5 w-3.5" /> Save {localeLabel(locale)}
                </Button>
                {hasTranslation(locale) && (
                  <Button variant="ghost" onClick={() => setConfirmDel(true)} className="h-8 px-2.5 text-xs text-red-400">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmDel}
        onOpenChange={setConfirmDel}
        title="Remove translation"
        message={`Remove the ${localeLabel(locale)} translation?`}
        confirmLabel="Remove"
        onConfirm={remove}
      />
    </Panel>
  );
}

function localeLabel(code: string) {
  return LOCALES.find((l) => l.code === code)?.label ?? code;
}
