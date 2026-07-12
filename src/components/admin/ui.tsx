'use client';

import * as React from 'react';

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

// WordPress wp-admin components. Styling lives in src/app/admin/wp-admin.css
// (exact WP tokens/metrics); these just emit the WP class names + markup.

// ── Page header: <h1 class="wp-heading-inline"> + inline action(s) + subtitle ──
export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h1 className="wp-heading-inline">{title}</h1>
        {actions}
      </div>
      {description && <p className="wp-subtitle">{description}</p>}
      <hr style={{ border: 0, borderTop: '1px solid #c3c4c7', margin: '10px 0 16px' }} />
    </div>
  );
}

// ── Button ──
type BtnVariant = 'primary' | 'outline' | 'ghost' | 'danger';
const BTN: Record<BtnVariant, string> = {
  primary: 'wp-button wp-button-primary',
  outline: 'wp-button',
  ghost: 'wp-button wp-button-link',
  danger: 'wp-button wp-button-danger',
};
export function Button({
  variant = 'primary', className, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return <button className={cn(BTN[variant], className)} {...props} />;
}

// ── Form controls ──
export function Label({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('wp-label', className)} {...p} />;
}
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...p }, ref) => <input ref={ref} className={cn('wp-field', className)} {...p} />,
);
Input.displayName = 'Input';
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...p }, ref) => <textarea ref={ref} className={cn('wp-field', className)} {...p} />,
);
Textarea.displayName = 'Textarea';
export function Select({ className, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('wp-field', className)} {...p} />;
}
export function Field({
  label, children, hint,
}: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="wp-muted" style={{ fontSize: 12, margin: '4px 0 0' }}>{hint}</p>}
    </div>
  );
}
// WP uses checkboxes for booleans.
export function Switch({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', color: '#3c434a' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: '#2271b1', width: 16, height: 16, margin: 0 }}
      />
      {label}
    </label>
  );
}

// ── Panel (postbox / meta box) ──
export function Panel({ className, children, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('wp-postbox', className)} {...p}>{children}</div>;
}

// ── Badge (status pill) ──
export function Badge({
  children, tone = 'slate',
}: { children: React.ReactNode; tone?: 'slate' | 'green' | 'amber' | 'sky' | 'red' }) {
  const map: Record<string, string> = {
    slate: 'wp-pill-grey', green: 'wp-pill-green', amber: 'wp-pill-amber',
    sky: 'wp-pill-blue', red: 'wp-pill-red',
  };
  return <span className={cn('wp-pill', map[tone])}>{children}</span>;
}

// ── List table ──
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="wp-list-table">{children}</table>
    </div>
  );
}
export const THead = ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>;
export const TH = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <th className={className}>{children}</th>
);
export const TR = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={className}>{children}</tr>
);
export const TD = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={className}>{children}</td>
);

// ── Empty / loading ──
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="wp-postbox" style={{ padding: '36px 20px', textAlign: 'center' }}>
      <p style={{ margin: 0, color: '#1d2327', fontSize: 14 }}>{title}</p>
      {hint && <p className="wp-muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{hint}</p>}
    </div>
  );
}
export function Spinner() {
  return <div className="wp-spinner" />;
}
