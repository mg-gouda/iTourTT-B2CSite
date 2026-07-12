'use client';

import * as React from 'react';

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

// Theme-aware: light base + `dark:` overrides. The admin root toggles `.dark`
// on <html> (see AdminShell / admin layout). Login stays dark by design.

// ── Page header ──
export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Button ──
type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger';
const BTN: Record<BtnVariant, string> = {
  primary: 'bg-sky-500 text-white hover:bg-sky-400',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-500/90 dark:hover:bg-red-500',
};
export function Button({
  variant = 'primary', className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-60',
        BTN[variant], className,
      )}
      {...props}
    />
  );
}

// ── Form controls ──
export function Label({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300', className)} {...p} />;
}
const FIELD =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500/60 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500';
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...p }, ref) => <input ref={ref} className={cn(FIELD, className)} {...p} />,
);
Input.displayName = 'Input';
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...p }, ref) => <textarea ref={ref} className={cn(FIELD, 'min-h-24', className)} {...p} />,
);
Textarea.displayName = 'Textarea';
export function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(FIELD, 'appearance-none', className)} {...p} />;
}
export function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}
export function Switch({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
    >
      <span
        className={cn(
          'relative h-5 w-9 rounded-full transition',
          checked ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-700',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white transition',
            checked ? 'left-4' : 'left-0.5',
          )}
        />
      </span>
      {label}
    </button>
  );
}

// ── Panel / Card ──
export function Panel({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900', className)} {...p} />;
}

// ── Badge ──
export function Badge({
  children, tone = 'slate',
}: { children: React.ReactNode; tone?: 'slate' | 'green' | 'amber' | 'sky' | 'red' }) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  };
  return (
    <span className={cn('inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium', tones[tone])}>
      {children}
    </span>
  );
}

// ── Table ──
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </Panel>
  );
}
export const THead = ({ children }: { children: React.ReactNode }) => (
  <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-500">
    {children}
  </thead>
);
export const TH = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <th className={cn('px-4 py-2.5 font-medium', className)}>{children}</th>
);
export const TR = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={cn('border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/30', className)}>{children}</tr>
);
export const TD = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={cn('px-4 py-2.5 text-slate-600 dark:text-slate-300', className)}>{children}</td>
);

// ── Empty / loading states ──
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-800">
      <p className="text-sm text-slate-700 dark:text-slate-300">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}
export function Spinner() {
  return <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500 dark:border-slate-600 dark:border-t-sky-400" />;
}
