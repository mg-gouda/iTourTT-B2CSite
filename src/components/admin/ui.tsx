'use client';

import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2, Inbox } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Page header ──────────────────────────────────────────────────────────
export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Button ───────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger';
const BTN: Record<BtnVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
  outline: 'border border-border bg-transparent hover:bg-secondary hover:text-secondary-foreground',
  ghost: 'hover:bg-secondary hover:text-secondary-foreground',
  danger: 'bg-destructive text-white hover:bg-destructive/90 shadow-sm',
};
export function Button({
  variant = 'primary', className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        BTN[variant],
        className,
      )}
      {...props}
    />
  );
}

// ── Form controls ────────────────────────────────────────────────────────
export function Label({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-xs font-medium text-muted-foreground', className)} {...p} />;
}

const CONTROL =
  'flex w-full rounded-md border border-input bg-background/50 text-sm shadow-sm transition-colors ' +
  'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...p }, ref) => (
    <input ref={ref} className={cn(CONTROL, 'h-9 px-3 py-1', className)} {...p} />
  ),
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...p }, ref) => (
    <textarea ref={ref} className={cn(CONTROL, 'min-h-[72px] px-3 py-2', className)} {...p} />
  ),
);
Textarea.displayName = 'Textarea';

export function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(CONTROL, 'h-9 px-3 py-1', className)} {...p} />;
}

export function Field({
  label, htmlFor, hint, error, children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

export function Switch({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          checked ? 'bg-primary' : 'bg-secondary',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}

// ── Panel (card) ─────────────────────────────────────────────────────────
export function Panel({ className, children, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)}
      {...p}
    >
      {children}
    </div>
  );
}

// ── Badge (status pill) ──────────────────────────────────────────────────
export function Badge({
  children, tone = 'slate',
}: { children: React.ReactNode; tone?: 'slate' | 'green' | 'amber' | 'sky' | 'red' }) {
  const map: Record<string, string> = {
    slate: 'border-transparent bg-secondary text-secondary-foreground',
    green: 'border-transparent bg-emerald-500/15 text-emerald-300',
    amber: 'border-transparent bg-amber-500/15 text-amber-300',
    sky: 'border-transparent bg-primary/15 text-primary',
    red: 'border-transparent bg-red-500/15 text-red-300',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', map[tone])}>
      {children}
    </span>
  );
}

// ── List table ───────────────────────────────────────────────────────────
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin rounded-lg border border-border bg-card">
      <table className={cn('w-full caption-bottom text-sm', className)}>{children}</table>
    </div>
  );
}
export const THead = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <thead className={cn('[&_tr]:border-b [&_tr]:border-border', className)}>{children}</thead>
);
export const TBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)}>{children}</tbody>
);
export const TR = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={cn('border-b border-border transition-colors hover:bg-secondary/40', className)}>{children}</tr>
);
export const TH = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <th className={cn('h-10 px-3 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground', className)}>
    {children}
  </th>
);
export const TD = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={cn('px-3 py-2.5 align-middle', className)}>{children}</td>
);

// ── Empty / loading ──────────────────────────────────────────────────────
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-14 text-center">
      <div className="rounded-full bg-secondary p-3">
        <Inbox className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin text-muted-foreground', className)} aria-label="Loading" />;
}
