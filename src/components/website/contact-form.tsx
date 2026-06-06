'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWT } from '@/lib/website-i18n';
import { API_BASE } from '@/lib/site-settings';
import { cn } from '@/lib/utils';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

// Injected once per page-load; survives SPA navigation.
let scriptInjected = false;

interface Fields {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function ContactForm() {
  const t = useWT();
  const [fields, setFields] = useState<Fields>({
    name: '', email: '', phone: '', subject: '', message: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [captchaToken, setCaptchaToken] = useState('');
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetRendered = useRef(false);

  // Load Turnstile script once across the whole app session.
  useEffect(() => {
    if (!SITE_KEY) return;
    if ((window as any).turnstile) { setTurnstileReady(true); return; }
    if (scriptInjected) return;
    scriptInjected = true;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => setTurnstileReady(true);
    document.head.appendChild(s);
  }, []);

  // Render widget once the script is ready and the div is mounted.
  useEffect(() => {
    if (!turnstileReady || !widgetRef.current || widgetRendered.current || !SITE_KEY) return;
    const w = window as any;
    if (!w.turnstile) return;
    widgetRendered.current = true;
    w.turnstile.render(widgetRef.current, {
      sitekey: SITE_KEY,
      callback: (token: string) => setCaptchaToken(token),
      'expired-callback': () => setCaptchaToken(''),
      'error-callback': () => setCaptchaToken(''),
    });
  }, [turnstileReady]);

  const set = (k: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [k]: e.target.value }));

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!fields.name.trim()) errs.name = t('contact.required');
    if (!fields.email.trim()) {
      errs.email = t('contact.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      errs.email = t('contact.invalidEmail');
    }
    if (!fields.message.trim()) errs.message = t('contact.required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`${API_BASE}/api/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          ...(fields.phone.trim() ? { phone: fields.phone.trim() } : {}),
          ...(fields.subject.trim() ? { subject: fields.subject.trim() } : {}),
          message: fields.message.trim(),
          ...(captchaToken ? { captchaToken } : {}),
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else if (res.status === 429) {
        setSubmitError(t('contact.errorTooMany'));
      } else if (res.status === 403) {
        setSubmitError(t('contact.errorCaptcha'));
      } else {
        setSubmitError(t('contact.errorGeneric'));
      }
    } catch {
      setSubmitError(t('contact.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="my-8 flex flex-col items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-12 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <p className="text-base font-semibold text-emerald-800">{t('contact.success')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="my-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Name */}
      <Field label={t('contact.name')} htmlFor="cf-name" error={errors.name}>
        <Input
          id="cf-name"
          autoComplete="name"
          value={fields.name}
          onChange={set('name')}
          aria-invalid={!!errors.name || undefined}
          aria-required="true"
          placeholder={t('contact.namePlaceholder')}
        />
      </Field>

      {/* Email */}
      <Field label={t('contact.email')} htmlFor="cf-email" error={errors.email}>
        <Input
          id="cf-email"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={set('email')}
          aria-invalid={!!errors.email || undefined}
          aria-required="true"
          placeholder={t('contact.emailPlaceholder')}
        />
      </Field>

      {/* Phone + Subject */}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('contact.phone')} htmlFor="cf-phone">
          <Input
            id="cf-phone"
            type="tel"
            autoComplete="tel"
            value={fields.phone}
            onChange={set('phone')}
            placeholder={t('contact.phonePlaceholder')}
          />
        </Field>
        <Field label={t('contact.subject')} htmlFor="cf-subject">
          <Input
            id="cf-subject"
            value={fields.subject}
            onChange={set('subject')}
            placeholder={t('contact.subjectPlaceholder')}
          />
        </Field>
      </div>

      {/* Message */}
      <Field label={t('contact.message')} htmlFor="cf-message" error={errors.message}>
        <textarea
          id="cf-message"
          value={fields.message}
          onChange={set('message')}
          aria-invalid={!!errors.message || undefined}
          aria-required="true"
          placeholder={t('contact.messagePlaceholder')}
          rows={5}
          className={cn(
            'w-full min-w-0 resize-y rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs',
            'transition-[color,box-shadow] outline-none placeholder:text-muted-foreground',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            errors.message ? 'border-destructive' : 'border-input',
          )}
        />
      </Field>

      {/* Turnstile */}
      {SITE_KEY && <div ref={widgetRef} />}

      {/* Submit error */}
      {submitError && (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('contact.sending')}
          </>
        ) : (
          t('contact.send')
        )}
      </Button>
    </form>
  );
}
