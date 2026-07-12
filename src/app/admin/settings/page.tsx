'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api, uploadFile, assetUrl } from '@/lib/admin-api';
import {
  PageHeader, Button, Panel, Field, Input, Textarea, Switch, Spinner,
} from '@/components/admin/ui';
import { Save, ImagePlus, X } from 'lucide-react';

// Editable string fields synced back to the backend via partial PATCH.
const STRING_FIELDS = [
  'siteName',
  'primaryColor', 'accentColor', 'heroGradientFrom', 'heroGradientTo', 'navBgColor', 'footerBgColor',
  'heroTitle', 'heroSubtitle', 'heroCta1Text', 'heroCta2Text', 'heroImageUrl', 'heroImage2Url', 'heroImage3Url',
  'contactEmail', 'contactPhone', 'contactWhatsapp',
  'socialFacebook', 'socialInstagram', 'socialTwitter',
  'metaTitle', 'metaDescription',
] as const;
const BOOL_FIELDS = [
  'onlinePaymentEnabled', 'cashOnArrivalEnabled', 'bankPaymentEnabled', 'enableAiMode',
] as const;
const COLOR_FIELDS = [
  'primaryColor', 'accentColor', 'heroGradientFrom', 'heroGradientTo', 'navBgColor', 'footerBgColor',
] as const;

type StringKey = (typeof STRING_FIELDS)[number];
type BoolKey = (typeof BOOL_FIELDS)[number];
type Form = Record<StringKey, string> & Record<BoolKey, boolean>;

const HEX = /^#[0-9a-fA-F]{6}$/;

function buildForm(s: any): Form {
  const f: any = {};
  for (const k of STRING_FIELDS) f[k] = s?.[k] ?? '';
  for (const k of BOOL_FIELDS) f[k] = !!s?.[k];
  return f as Form;
}

export default function SettingsPage() {
  const [form, setForm] = useState<Form | null>(null);
  const [initial, setInitial] = useState<Form | null>(null);
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<any>('/settings/website')
      .then((s) => {
        setForm(buildForm(s));
        setInitial(buildForm(s));
        setLogo(s?.logoUrl ?? s?.logo ?? '');
        setFavicon(s?.faviconUrl ?? s?.favicon ?? '');
      })
      .catch((e) => { toast.error(e.message); setForm(buildForm({})); setInitial(buildForm({})); });
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const upload = async (path: string, file: File, onUrl: (u: string) => void) => {
    try {
      const url = await uploadFile(path, file);
      onUrl(url);
      toast.success('Uploaded');
    } catch (e: any) { toast.error(e.message); }
  };

  const save = async () => {
    if (!form || !initial) return;
    const patch: Record<string, any> = {};
    for (const k of STRING_FIELDS) if (form[k] !== initial[k]) patch[k] = form[k];
    for (const k of BOOL_FIELDS) if (form[k] !== initial[k]) patch[k] = form[k];

    for (const k of COLOR_FIELDS) {
      if (k in patch && !HEX.test(patch[k])) {
        toast.error(`${k} must be a #rrggbb hex color`);
        return;
      }
    }
    if (Object.keys(patch).length === 0) { toast('No changes to save'); return; }

    setSaving(true);
    try {
      await api.patch('/settings/website', patch);
      setInitial({ ...form });
      toast.success('Settings saved');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (!form) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="sticky top-14 z-10 -mx-4 mb-4 border-b border-slate-200 dark:border-slate-800 bg-slate-950/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <PageHeader
          title="Settings"
          description="Website appearance, hero, contact, payments and SEO."
          actions={
            <Button onClick={save} disabled={saving}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
          }
        />
      </div>

      <div className="space-y-5">
        {/* ── Brand ── */}
        <Panel className="p-4">
          <h3 className="mb-4 text-sm font-semibold">Brand</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Site name">
              <Input value={form.siteName} onChange={(e) => set('siteName', e.target.value)} />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ColorField label="Primary color" value={form.primaryColor} onChange={(v) => set('primaryColor', v)} />
            <ColorField label="Accent color" value={form.accentColor} onChange={(v) => set('accentColor', v)} />
            <ColorField label="Hero gradient from" value={form.heroGradientFrom} onChange={(v) => set('heroGradientFrom', v)} />
            <ColorField label="Hero gradient to" value={form.heroGradientTo} onChange={(v) => set('heroGradientTo', v)} />
            <ColorField label="Nav background" value={form.navBgColor} onChange={(v) => set('navBgColor', v)} />
            <ColorField label="Footer background" value={form.footerBgColor} onChange={(v) => set('footerBgColor', v)} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <UploadTile
              label="Logo"
              value={logo}
              onPick={(file) => upload('/settings/website/logo', file, setLogo)}
              onClear={() => setLogo('')}
            />
            <UploadTile
              label="Favicon"
              value={favicon}
              onPick={(file) => upload('/settings/website/favicon', file, setFavicon)}
              onClear={() => setFavicon('')}
            />
          </div>
        </Panel>

        {/* ── Hero ── */}
        <Panel className="p-4">
          <h3 className="mb-4 text-sm font-semibold">Hero</h3>
          <div className="grid gap-4">
            <Field label="Hero title">
              <Input value={form.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} />
            </Field>
            <Field label="Hero subtitle">
              <Textarea value={form.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary CTA text">
                <Input value={form.heroCta1Text} onChange={(e) => set('heroCta1Text', e.target.value)} />
              </Field>
              <Field label="Secondary CTA text">
                <Input value={form.heroCta2Text} onChange={(e) => set('heroCta2Text', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <UploadTile
                label="Hero image 1"
                value={form.heroImageUrl}
                onPick={(file) => upload('/settings/website/hero-image', file, (u) => set('heroImageUrl', u))}
                onClear={() => set('heroImageUrl', '')}
              />
              <UploadTile
                label="Hero image 2"
                value={form.heroImage2Url}
                onPick={(file) => upload('/settings/website/hero-image-2', file, (u) => set('heroImage2Url', u))}
                onClear={() => set('heroImage2Url', '')}
              />
              <UploadTile
                label="Hero image 3"
                value={form.heroImage3Url}
                onPick={(file) => upload('/settings/website/hero-image-3', file, (u) => set('heroImage3Url', u))}
                onClear={() => set('heroImage3Url', '')}
              />
            </div>
          </div>
        </Panel>

        {/* ── Contact ── */}
        <Panel className="p-4">
          <h3 className="mb-4 text-sm font-semibold">Contact</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact email">
              <Input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
            </Field>
            <Field label="Contact phone">
              <Input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} />
            </Field>
            <Field label="WhatsApp">
              <Input value={form.contactWhatsapp} onChange={(e) => set('contactWhatsapp', e.target.value)} />
            </Field>
            <Field label="Facebook">
              <Input value={form.socialFacebook} onChange={(e) => set('socialFacebook', e.target.value)} />
            </Field>
            <Field label="Instagram">
              <Input value={form.socialInstagram} onChange={(e) => set('socialInstagram', e.target.value)} />
            </Field>
            <Field label="Twitter / X">
              <Input value={form.socialTwitter} onChange={(e) => set('socialTwitter', e.target.value)} />
            </Field>
          </div>
        </Panel>

        {/* ── Payments ── */}
        <Panel className="p-4">
          <h3 className="mb-4 text-sm font-semibold">Payments</h3>
          <div className="space-y-3">
            <ToggleRow
              label="Online payment"
              hint="Accept card payments at checkout."
              checked={form.onlinePaymentEnabled}
              onChange={(v) => set('onlinePaymentEnabled', v)}
            />
            <ToggleRow
              label="Cash on arrival"
              hint="Allow guests to pay the driver on arrival."
              checked={form.cashOnArrivalEnabled}
              onChange={(v) => set('cashOnArrivalEnabled', v)}
            />
            <ToggleRow
              label="Bank transfer"
              hint="Show bank payment instructions."
              checked={form.bankPaymentEnabled}
              onChange={(v) => set('bankPaymentEnabled', v)}
            />
            <ToggleRow
              label="AI mode"
              hint="Enable AI-assisted features on the site."
              checked={form.enableAiMode}
              onChange={(v) => set('enableAiMode', v)}
            />
          </div>
        </Panel>

        {/* ── SEO ── */}
        <Panel className="p-4">
          <h3 className="mb-4 text-sm font-semibold">SEO</h3>
          <div className="grid gap-4">
            <Field label="Meta title" hint={`${form.metaTitle.length}/180`}>
              <Input maxLength={180} value={form.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} />
            </Field>
            <Field label="Meta description" hint={`${form.metaDescription.length}/320`}>
              <Textarea maxLength={320} value={form.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
            </Field>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// ── Color picker + hex text input ──
function ColorField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={HEX.test(value) ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="font-mono"
        />
      </div>
    </Field>
  );
}

// ── Boolean switch row ──
function ToggleRow({
  label, hint, checked, onChange,
}: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2.5">
      <div>
        <div className="text-sm text-slate-800 dark:text-slate-200">{label}</div>
        {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Image upload tile with preview ──
function UploadTile({
  label, value, onPick, onClear, wide,
}: {
  label: string;
  value: string;
  onPick: (file: File) => void;
  onClear: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-1">
      <div className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">{label}</div>
      {value ? (
        <div className="relative inline-block">
          <img
            src={assetUrl(value)}
            alt=""
            className={`rounded-lg border border-slate-200 dark:border-slate-800 object-contain ${wide ? 'max-h-40 w-full' : 'h-20 w-20'}`}
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 rounded-md bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-8 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200 ${wide ? 'w-full' : 'w-full'}`}
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs">Upload {label.toLowerCase()}</span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
      />
    </div>
  );
}
