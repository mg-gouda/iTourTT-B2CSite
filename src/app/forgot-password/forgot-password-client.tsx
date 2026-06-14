'use client';

import { useState } from 'react';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SiteSettings } from '@/lib/site-settings';

const API = `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/w-api`;

interface Props { settings: SiteSettings; }

export function ForgotPasswordClient({ settings }: Props) {
  const pc = settings.primaryColor;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch { /* ignore — always show success to avoid enumeration */ }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {settings.siteLogoUrl && (
            <img src={settings.siteLogoUrl} alt={settings.siteName} className="h-10 mx-auto mb-4 object-contain" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-1 text-sm text-gray-500">We&apos;ll email you a link to set a new password</p>
        </div>

        {sent ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 mx-auto" style={{ color: pc }} />
            <p className="text-sm text-gray-700">
              If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.
              Please check your inbox.
            </p>
            <a href="/login" className="inline-block text-sm font-medium" style={{ color: pc }}>← Back to Sign In</a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email Address
              </Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-200 bg-gray-50 focus-visible:ring-1"
                style={{ '--tw-ring-color': pc } as React.CSSProperties}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-md transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              style={{ backgroundColor: pc }}
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : 'Send Reset Link'}
            </button>

            <p className="text-center">
              <a href="/login" className="text-xs text-gray-400 hover:text-gray-700 transition">← Back to Sign In</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
