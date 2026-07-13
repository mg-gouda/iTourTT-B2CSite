'use client';

// Role × permission-key matrix for the B2C admin.
// Backend: /api/permissions (V2 registry model — has-key toggles, not CRUD flags).
//   GET  /permissions/roles              → role list
//   GET  /permissions/roles/:id          → { …, permissionKeys: string[] }
//   PUT  /permissions/roles/:id/permissions  body { permissionKeys } (REPLACES all; auto-adds ancestors)
//   POST /permissions/roles              body { name, description? } (slug auto-derived)
// We only surface the B2C-relevant modules; non-B2C keys (dispatch/finance/…) are
// preserved on save so we never wipe a role's ops access.

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Button, Panel, Field, Input, Textarea,
  Switch, Badge, Spinner, EmptyState, cn,
} from '@/components/admin/ui';
import { Modal } from '@/components/admin/dialog';
import { Plus, ShieldCheck, Save, Lock } from 'lucide-react';

// ── B2C permission subset (mirrors backend permission-registry.ts, B2C keys only) ──
type Row = { key: string; label: string; depth: number };
type Group = { key: string; label: string; rows: Row[] };
type Area = { title: string; hint: string; groups: Group[] };

const AREAS: Area[] = [
  {
    title: 'Content',
    hint: 'Website content the marketing team edits.',
    groups: [
      {
        key: 'website-content',
        label: 'Website content',
        rows: [
          { key: 'website-content', label: 'Access website content', depth: 0 },
          { key: 'website-content.cityPages', label: 'City pages', depth: 1 },
          { key: 'website-content.blog', label: 'Blog posts', depth: 1 },
          { key: 'website-content.pageSeo', label: 'Page SEO', depth: 1 },
          { key: 'website-content.pages', label: 'Static pages', depth: 1 },
        ],
      },
    ],
  },
  {
    title: 'Commerce',
    hint: 'Public pricing and booking add-ons.',
    groups: [
      {
        key: 'public-prices',
        label: 'Public prices',
        rows: [
          { key: 'public-prices', label: 'Access public prices', depth: 0 },
          { key: 'public-prices.bulk', label: 'Bulk edit / import', depth: 1 },
          { key: 'public-prices.delete', label: 'Delete prices', depth: 1 },
        ],
      },
      {
        key: 'extras',
        label: 'Extras / add-ons',
        rows: [
          { key: 'extras', label: 'Access extras', depth: 0 },
          { key: 'extras.addButton', label: 'Add extra', depth: 1 },
          { key: 'extras.editButton', label: 'Edit extra', depth: 1 },
          { key: 'extras.deleteButton', label: 'Delete extra', depth: 1 },
        ],
      },
    ],
  },
  {
    title: 'System',
    hint: 'Company settings and account management.',
    groups: [
      {
        key: 'company',
        label: 'Company settings',
        rows: [
          { key: 'company', label: 'Access settings', depth: 0 },
          { key: 'company.editSettings', label: 'Edit settings', depth: 1 },
          { key: 'company.uploadLogo', label: 'Upload logo', depth: 1 },
          { key: 'company.uploadFavicon', label: 'Upload favicon', depth: 1 },
        ],
      },
      {
        key: 'users',
        label: 'Users & roles',
        rows: [
          { key: 'users', label: 'Access users', depth: 0 },
          { key: 'users.addButton', label: 'Add user', depth: 1 },
          { key: 'users.table', label: 'User table', depth: 1 },
          { key: 'users.table.editButton', label: 'Edit user', depth: 2 },
          { key: 'users.table.changeRole', label: 'Change role', depth: 2 },
          { key: 'users.table.deactivate', label: 'Deactivate user', depth: 2 },
          { key: 'users.roles', label: 'Roles management', depth: 1 },
          { key: 'users.roles.addButton', label: 'Create role', depth: 2 },
          { key: 'users.roles.editButton', label: 'Edit role', depth: 2 },
          { key: 'users.roles.deleteButton', label: 'Delete role', depth: 2 },
          { key: 'users.roles.editPermissions', label: 'Edit permissions', depth: 2 },
        ],
      },
    ],
  },
];

const ALL_ROWS: Row[] = AREAS.flatMap((a) => a.groups.flatMap((g) => g.rows));
const MANAGED = new Set(ALL_ROWS.map((r) => r.key));

// Ancestor keys within the managed subset, e.g. users.table.editButton → [users, users.table].
function managedAncestors(key: string): string[] {
  const parts = key.split('.');
  const out: string[] = [];
  for (let i = 1; i < parts.length; i++) {
    const anc = parts.slice(0, i).join('.');
    if (MANAGED.has(anc)) out.push(anc);
  }
  return out;
}
// Managed descendants, e.g. users.table → [users.table.editButton, …].
function managedDescendants(key: string): string[] {
  return ALL_ROWS.map((r) => r.key).filter((k) => k.startsWith(key + '.'));
}

interface RoleSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  isActive: boolean;
  userCount: number;
  permissionCount: number;
}
interface RoleDetail extends RoleSummary {
  permissionKeys: string[];
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function PermissionsPage() {
  const [roles, setRoles] = useState<RoleSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RoleDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [enabled, setEnabled] = useState<Set<string>>(new Set());
  const [original, setOriginal] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const loadRoles = async (selectAfter?: string) => {
    try {
      const list = await api.get<RoleSummary[]>('/permissions/roles');
      const arr = Array.isArray(list) ? list : [];
      setRoles(arr);
      const pick = selectAfter ?? selectedId ?? arr.find((r) => r.slug !== 'admin')?.id ?? arr[0]?.id;
      if (pick) setSelectedId(pick);
    } catch (e: any) {
      toast.error(e.message);
      setRoles([]);
    }
  };

  useEffect(() => { loadRoles(); /* eslint-disable-next-line */ }, []);

  const selected = roles?.find((r) => r.id === selectedId) ?? null;
  const isAdmin = selected?.slug === 'admin';

  // Load the selected role's full permission set.
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoadingDetail(true);
    api
      .get<RoleDetail>(`/permissions/roles/${selectedId}`)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        const b2c = isAdmin
          ? new Set(MANAGED)                                   // Admin implicitly holds everything
          : new Set((d.permissionKeys ?? []).filter((k) => MANAGED.has(k)));
        setEnabled(b2c);
        setOriginal(new Set(b2c));
      })
      .catch((e: any) => { if (!cancelled) toast.error(e.message); })
      .finally(() => { if (!cancelled) setLoadingDetail(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const dirty = useMemo(() => {
    if (enabled.size !== original.size) return true;
    for (const k of enabled) if (!original.has(k)) return true;
    return false;
  }, [enabled, original]);

  const toggleKey = (key: string, on: boolean) => {
    if (isAdmin) return;
    setEnabled((prev) => {
      const next = new Set(prev);
      if (on) {
        next.add(key);
        managedAncestors(key).forEach((k) => next.add(k));
      } else {
        next.delete(key);
        managedDescendants(key).forEach((k) => next.delete(k));
      }
      return next;
    });
  };

  const toggleGroup = (g: Group, on: boolean) => {
    if (isAdmin) return;
    setEnabled((prev) => {
      const next = new Set(prev);
      for (const r of g.rows) {
        if (on) next.add(r.key);
        else { next.delete(r.key); managedDescendants(r.key).forEach((k) => next.delete(k)); }
      }
      return next;
    });
  };

  const save = async () => {
    if (!selected || isAdmin) return;
    setSaving(true);
    try {
      // Preserve every non-B2C key the role already had, merge with the toggled B2C keys.
      const preserved = (detail?.permissionKeys ?? []).filter((k) => !MANAGED.has(k));
      const permissionKeys = Array.from(new Set([...preserved, ...enabled]));
      await api.put(`/permissions/roles/${selected.id}/permissions`, { permissionKeys });
      toast.success(`Permissions saved for ${selected.name}`);
      setOriginal(new Set(enabled));
      // Refetch to reflect backend-added ancestors and refresh counts.
      const d = await api.get<RoleDetail>(`/permissions/roles/${selected.id}`);
      setDetail(d);
      loadRoles(selected.id);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Roles & permissions"
        description="Grant granular access to B2C content, pricing and settings — per role."
        actions={
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="h-4 w-4" /> New role
          </Button>
        }
      />

      {roles === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : roles.length === 0 ? (
        <EmptyState title="No roles yet" hint="Create your first role to assign permissions." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[230px_1fr]">
          {/* ── Role selector ── */}
          <Panel className="h-max p-2">
            <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Roles
            </div>
            <div className="space-y-0.5">
              {roles.map((r) => {
                const active = r.id === selectedId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      'flex w-full flex-col items-start gap-1 rounded-lg px-2.5 py-2 text-left transition',
                      active ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{r.name}</span>
                      {r.slug === 'admin' && <Lock className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
                    </span>
                    <span className="flex flex-wrap gap-1">
                      {r.isSystem
                        ? <Badge tone="slate">System</Badge>
                        : <Badge tone="sky">Custom</Badge>}
                      <Badge tone="slate">{r.userCount} user{r.userCount === 1 ? '' : 's'}</Badge>
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* ── Matrix ── */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {selected?.name ?? '—'}
                    {dirty && !isAdmin && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Unsaved changes" />}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isAdmin
                      ? 'Admin always has full access — permissions are locked.'
                      : `${enabled.size} of ${MANAGED.size} B2C permissions granted`}
                  </div>
                </div>
              </div>
              <Button onClick={save} disabled={!dirty || saving || isAdmin || loadingDetail}>
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-16"><Spinner /></div>
            ) : isAdmin ? (
              <Panel className="p-6">
                <EmptyState
                  title="Admin role is fully privileged"
                  hint="The Admin role always has every permission and cannot be edited. Pick another role to configure access."
                />
              </Panel>
            ) : (
              AREAS.map((area) => (
                <Panel key={area.title} className="overflow-hidden">
                  <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-900/60 px-4 py-2.5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{area.title}</div>
                    <div className="text-[11px] text-slate-500">{area.hint}</div>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {area.groups.map((g) => {
                      const on = g.rows.filter((r) => enabled.has(r.key)).length;
                      const all = on === g.rows.length;
                      return (
                        <div key={g.key}>
                          <div className="flex items-center justify-between gap-3 bg-slate-900/40 px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{g.label}</span>
                              <Badge tone={on === 0 ? 'slate' : all ? 'green' : 'amber'}>{on}/{g.rows.length}</Badge>
                            </div>
                            <Switch checked={all} onChange={(v) => toggleGroup(g, v)} label={all ? 'All' : 'Select all'} />
                          </div>
                          {g.rows.map((r) => (
                            <div
                              key={r.key}
                              className="flex items-center justify-between gap-3 px-4 py-1.5 hover:bg-slate-800/30"
                              style={{ paddingLeft: 16 + r.depth * 20 }}
                            >
                              <div className="min-w-0">
                                <div className="truncate text-sm text-slate-700 dark:text-slate-300">{r.label}</div>
                                <code className="text-[10px] text-slate-600">{r.key}</code>
                              </div>
                              <Switch checked={enabled.has(r.key)} onChange={(v) => toggleKey(r.key, v)} />
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              ))
            )}
          </div>
        </div>
      )}

      <NewRoleModal
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreated={(id) => { setNewOpen(false); loadRoles(id); }}
      />
    </div>
  );
}

function NewRoleModal({
  open, onOpenChange, onCreated,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const slug = slugify(name);

  const save = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const role = await api.post<{ id: string }>('/permissions/roles', {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success(`Role “${name.trim()}” created — grant its access below`);
      setName(''); setDescription('');
      onCreated(role.id);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="New role"
      description="Create a role (e.g. “SEO Agency”) then grant it only the content & pricing it needs."
      size="md"
    >
      <div className="grid gap-3">
        <Field label="Role name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="SEO Agency" />
        </Field>
        {slug && (
          <p className="-mt-1 text-[11px] text-slate-500">
            Slug: <code className="text-slate-500 dark:text-slate-400">{slug}</code>
          </p>
        )}
        <Field label="Description" hint="Optional — what this role is for.">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="External agency — edits blog, city pages & public prices only."
          />
        </Field>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={save} disabled={!name.trim() || saving}>Create role</Button>
      </div>
    </Modal>
  );
}
