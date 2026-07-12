'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Panel, Button, Field, Input, Badge, Spinner,
} from '@/components/admin/ui';
import { ShieldCheck, ShieldOff, Copy, KeyRound } from 'lucide-react';

interface Me { id: string; name: string; email: string; twoFactorEnabled?: boolean }

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [phase, setPhase] = useState<'idle' | 'setup' | 'recovery'>('idle');
  const [secret, setSecret] = useState('');
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = () => api.get<Me>('/users/me').then(setMe).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, []);

  const startSetup = async () => {
    setBusy(true);
    try {
      const r = await api.post<{ secret: string; otpauthUri: string }>('/auth/2fa/setup');
      setSecret(r.secret);
      setQr(await QRCode.toDataURL(r.otpauthUri, { margin: 1, width: 200 }));
      setPhase('setup');
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const enable = async () => {
    setBusy(true);
    try {
      const r = await api.post<{ recoveryCodes: string[] }>('/auth/2fa/enable', { code });
      setRecovery(r.recoveryCodes);
      setPhase('recovery');
      setCode('');
      toast.success('Two-factor authentication enabled');
      load();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const disable = async () => {
    const c = window.prompt('Enter a current authenticator or recovery code to disable 2FA');
    if (!c) return;
    try {
      await api.post('/auth/2fa/disable', { code: c });
      toast.success('Two-factor authentication disabled');
      setPhase('idle'); setSecret(''); setQr('');
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  if (!me) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="My account" description="Security settings for your admin account." />

      <Panel className="mb-5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {me.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <div className="font-medium">{me.name}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{me.email}</div>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#2271b1]" />
            <h2 className="text-sm font-semibold">Two-factor authentication</h2>
          </div>
          {me.twoFactorEnabled
            ? <Badge tone="green">Enabled</Badge>
            : <Badge tone="amber">Disabled</Badge>}
        </div>

        {me.twoFactorEnabled ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your account is protected with an authenticator app.
            </p>
            <Button variant="danger" onClick={disable}>
              <ShieldOff className="h-4 w-4" /> Disable 2FA
            </Button>
          </div>
        ) : phase === 'idle' ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add a second step at sign-in using an authenticator app (Google Authenticator, Authy, 1Password).
            </p>
            <Button onClick={startSetup} disabled={busy}>
              <KeyRound className="h-4 w-4" /> Set up 2FA
            </Button>
          </div>
        ) : phase === 'setup' ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              1. Scan this QR code with your authenticator app (or enter the key manually).
            </p>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              {qr && <img src={qr} alt="2FA QR" className="rounded-lg bg-white p-2" />}
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Manual key</div>
                <button
                  onClick={() => { navigator.clipboard.writeText(secret); toast.success('Key copied'); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 font-mono text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {secret} <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
            <Field label="2. Enter the 6-digit code from your app">
              <Input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="max-w-40 text-center tracking-[0.3em]"
                placeholder="000000"
              />
            </Field>
            <div className="flex gap-2">
              <Button onClick={enable} disabled={busy || code.length !== 6}>Verify & enable</Button>
              <Button variant="ghost" onClick={() => { setPhase('idle'); setCode(''); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Save these recovery codes somewhere safe. Each can be used once if you lose your device.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 font-mono text-sm sm:grid-cols-2">
              {recovery.map((c) => <div key={c} className="text-slate-700 dark:text-slate-300">{c}</div>)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(recovery.join('\n')); toast.success('Codes copied'); }}
              >
                <Copy className="h-4 w-4" /> Copy codes
              </Button>
              <Button onClick={() => setPhase('idle')}>Done</Button>
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
