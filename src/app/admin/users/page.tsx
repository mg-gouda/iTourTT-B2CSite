'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Button, Table, THead, TH, TR, TD, Field, Input, Select,
  EmptyState, Spinner, Badge,
} from '@/components/admin/ui';
import { Modal, ConfirmDialog } from '@/components/admin/dialog';
import { Plus, Pencil, UserX, UserCheck } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

const ROLES = [
  'ADMIN', 'DISPATCHER', 'ACCOUNTANT', 'AGENT_MANAGER', 'VIEWER',
  'REP', 'DRIVER', 'SUPPLIER', 'B2C_CLIENT',
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState<User | null>(null);
  const [deact, setDeact] = useState<User | null>(null);

  const load = async () => {
    try {
      const res = await api.get<any>('/users?page=1&limit=50');
      const list = res?.data ?? res ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e: any) { toast.error(e.message); setUsers([]); }
  };

  useEffect(() => { load(); }, []);

  const reactivate = async (u: User) => {
    try {
      await api.patch(`/users/${u.id}/reactivate`, {});
      toast.success('User reactivated');
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const deactivate = async (u: User) => {
    await api.del(`/users/${u.id}`);
    toast.success('User deactivated');
    load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Users"
        description="Admin & staff accounts, roles and access."
        actions={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add user</Button>}
      />

      {users === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : users.length === 0 ? (
        <EmptyState title="No users yet" hint="Add your first admin account." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH className="w-40">Role</TH>
              <TH className="w-28">Status</TH>
              <TH className="w-28 text-right">·</TH>
            </tr>
          </THead>
          <tbody>
            {users.map((u) => (
              <TR key={u.id}>
                <TD><span className="text-slate-100">{u.name || '—'}</span></TD>
                <TD>{u.email}</TD>
                <TD><Badge tone="sky">{u.role}</Badge></TD>
                <TD>
                  {u.isActive
                    ? <Badge tone="green">Active</Badge>
                    : <Badge tone="red">Inactive</Badge>}
                </TD>
                <TD>
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setEdit(u)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {u.isActive ? (
                      <button
                        onClick={() => setDeact(u)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400"
                        title="Deactivate"
                      >
                        <UserX className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => reactivate(u)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
                        title="Reactivate"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}

      <AddUserModal open={addOpen} onOpenChange={setAddOpen} onSaved={() => { setAddOpen(false); load(); }} />
      <EditUserModal user={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />
      <ConfirmDialog
        open={!!deact}
        onOpenChange={(v) => !v && setDeact(null)}
        title="Deactivate user"
        message={`Deactivate ${deact?.name || deact?.email}? They will lose access until reactivated.`}
        confirmLabel="Deactivate"
        onConfirm={() => deact && deactivate(deact)}
      />
    </div>
  );
}

function AddUserModal({
  open, onOpenChange, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'VIEWER' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.name.trim() && f.email.trim() && f.password.length >= 6;

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/users', {
        name: f.name.trim(), email: f.email.trim(), password: f.password, role: f.role,
      });
      toast.success('User created');
      onSaved();
      setF({ name: '', email: '', password: '', role: 'VIEWER' });
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add user" size="md">
      <div className="grid gap-3">
        <Field label="Name">
          <Input value={f.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Password" hint="At least 6 characters">
          <Input type="password" value={f.password} onChange={(e) => set('password', e.target.value)} />
        </Field>
        <Field label="Role">
          <Select value={f.role} onChange={(e) => set('role', e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={save} disabled={!valid || saving}>Create user</Button>
      </div>
    </Modal>
  );
}

function EditUserModal({
  user, onClose, onSaved,
}: { user: User | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ name: '', email: '', role: 'VIEWER', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (user) setF({ name: user.name ?? '', email: user.email ?? '', role: user.role ?? 'VIEWER', newPassword: '' });
  }, [user]);

  const save = async () => {
    if (!user) return;
    if (f.newPassword && f.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const profile: Record<string, string> = {};
      if (f.name !== (user.name ?? '')) profile.name = f.name;
      if (f.email !== (user.email ?? '')) profile.email = f.email;
      if (Object.keys(profile).length) await api.patch(`/users/${user.id}`, profile);
      if (f.role !== user.role) await api.patch(`/users/${user.id}/role`, { role: f.role });
      if (f.newPassword) await api.patch(`/users/${user.id}/password`, { newPassword: f.newPassword });
      toast.success('User updated');
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={!!user} onOpenChange={(v) => !v && onClose()} title="Edit user" size="md">
      <div className="grid gap-3">
        <Field label="Name">
          <Input value={f.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Role">
          <Select value={f.role} onChange={(e) => set('role', e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
        </Field>
        <Field label="Reset password" hint="Leave blank to keep current password">
          <Input
            type="password"
            value={f.newPassword}
            onChange={(e) => set('newPassword', e.target.value)}
            placeholder="New password"
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={saving}>Save changes</Button>
      </div>
    </Modal>
  );
}
