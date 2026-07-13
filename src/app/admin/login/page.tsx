'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, adminToken, ApiError } from '@/lib/admin-api';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface LoginResult {
  accessToken?: string;
  refreshToken?: string;
  user?: { id: string; email: string; name: string; role: string };
  twoFactorRequired?: boolean;
  challengeToken?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'credentials' | 'twofactor'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finish = (r: LoginResult) => {
    if (r.accessToken) {
      adminToken.set(r.accessToken, r.refreshToken);
      if (r.user) localStorage.setItem('b2c_admin_user', JSON.stringify(r.user));
      router.push('/admin');
    }
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api.post<LoginResult>(
        '/auth/login',
        { identifier: email, password },
        { auth: false },
      );
      if (r.twoFactorRequired && r.challengeToken) {
        setChallenge(r.challengeToken);
        setStep('twofactor');
      } else {
        finish(r);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await api.post<LoginResult>(
        '/auth/2fa/verify',
        { challengeToken: challenge, code },
        { auth: false },
      );
      finish(r);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-slate-100">
      {/* Black abstract blurred backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-600/25 blur-[120px]" />
        <div className="absolute right-[-6rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-cyan-500/15 blur-[130px]" />
        <div className="absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-indigo-700/20 blur-[130px]" />
        <div className="absolute inset-0 backdrop-blur-[10px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        {/* Compact glass card */}
        <div className="w-full max-w-sm animate-fade-in rounded-2xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/20 ring-1 ring-sky-400/30">
              <ShieldCheck className="h-5 w-5 text-sky-400" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Transferra Admin</h1>
            <p className="mt-1 text-xs text-slate-400">
              {step === 'credentials' ? 'Sign in to continue' : 'Enter your authenticator code'}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </div>
          )}

          {step === 'credentials' ? (
            <form onSubmit={submitCredentials} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Email</label>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20"
                  placeholder="you@transferra.ae"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </button>
            </form>
          ) : (
            <form onSubmit={submitCode} className="space-y-3">
              <input
                inputMode="numeric"
                autoFocus
                maxLength={8}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9a-f-]/gi, ''))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-center text-lg tracking-[0.3em] outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/20"
                placeholder="000000"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify
              </button>
              <button
                type="button"
                onClick={() => { setStep('credentials'); setCode(''); setError(''); }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
