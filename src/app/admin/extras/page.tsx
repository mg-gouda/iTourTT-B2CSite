'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api, uploadFile, assetUrl } from '@/lib/admin-api';
import {
  PageHeader, Button, Table, THead, TH, TR, TD, Panel, Field, Input, Textarea,
  Select, Switch, EmptyState, Spinner, Badge,
} from '@/components/admin/ui';
import { Modal, ConfirmDialog } from '@/components/admin/dialog';
import { TranslationPanel } from '@/components/admin/translation-panel';
import { Plus, Pencil, Trash2, ImagePlus, X } from 'lucide-react';

interface Extra {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  currency: string;
  imageUrl?: string;
  isActive: boolean;
  occupiesSeat: boolean;
  allowedVehicleTypeIds: string[];
  sortOrder: number;
}
interface VehicleType { id: string; name: string }

const CURRENCIES = ['EGP', 'USD', 'EUR', 'GBP', 'SAR'];

interface ExtraForm {
  name: string;
  description: string;
  price: string;
  currency: string;
  imageUrl: string;
  isActive: boolean;
  occupiesSeat: boolean;
  allowedVehicleTypeIds: string[];
  sortOrder: string;
}

const EMPTY: ExtraForm = {
  name: '', description: '', price: '', currency: 'USD', imageUrl: '',
  isActive: true, occupiesSeat: false, allowedVehicleTypeIds: [], sortOrder: '0',
};

export default function ExtrasPage() {
  const [rows, setRows] = useState<Extra[] | null>(null);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [editing, setEditing] = useState<Extra | 'new' | null>(null);
  const [del, setDel] = useState<Extra | null>(null);

  const load = () =>
    api.get<Extra[]>('/extras').then(setRows).catch((e) => { toast.error(e.message); setRows([]); });

  useEffect(() => {
    load();
    api.get<VehicleType[]>('/public/vehicle-types').then(setVehicles).catch(() => {});
  }, []);

  const toggleStatus = async (r: Extra) => {
    // Optimistic flip, roll back on failure.
    setRows((rs) => rs?.map((x) => (x.id === r.id ? { ...x, isActive: !x.isActive } : x)) ?? rs);
    try {
      await api.patch(`/extras/${r.id}/status`);
    } catch (e: any) {
      toast.error(e.message);
      load();
    }
  };

  const remove = async (r: Extra) => {
    try {
      await api.del(`/extras/${r.id}`);
      toast.success('Extra removed');
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Extras"
        description="Booking add-ons offered at checkout — luggage, child seats, meet & greet, and more."
        actions={<Button onClick={() => setEditing('new')}><Plus className="h-4 w-4" /> Add extra</Button>}
      />

      {rows === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No extras yet" hint="Add your first booking add-on." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Name</TH>
              <TH className="w-40">Price</TH>
              <TH className="w-28">Status</TH>
              <TH className="w-24 text-right">·</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD>
                  <div className="flex items-center gap-3">
                    {r.imageUrl && (
                      <img src={assetUrl(r.imageUrl)} alt="" className="h-9 w-9 shrink-0 rounded-md border border-slate-200 dark:border-slate-800 object-cover" />
                    )}
                    <div>
                      <div className="text-slate-900 dark:text-slate-100">{r.name}</div>
                      {r.description && <div className="mt-0.5 line-clamp-1 text-xs text-slate-500">{r.description}</div>}
                    </div>
                  </div>
                </TD>
                <TD>
                  <span className="text-slate-900 dark:text-slate-100">{r.price}</span>{' '}
                  <span className="text-xs text-slate-500 dark:text-slate-400">{r.currency}</span>
                </TD>
                <TD>
                  <button onClick={() => toggleStatus(r)} title="Toggle status">
                    <Badge tone={r.isActive ? 'green' : 'slate'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                  </button>
                </TD>
                <TD>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => setEditing(r)} className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sky-400" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDel(r)} className="rounded-md p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-400" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}

      <ExtraModal
        target={editing}
        vehicles={vehicles}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
      <ConfirmDialog
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        title="Delete extra"
        message="Remove this booking add-on? Existing bookings are unaffected."
        onConfirm={() => del && remove(del)}
      />
    </div>
  );
}

function ExtraModal({
  target, vehicles, onClose, onSaved,
}: {
  target: Extra | 'new' | null;
  vehicles: VehicleType[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const open = target !== null;
  const isNew = target === 'new';
  const [f, setF] = useState<ExtraForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (target === null) return;
    if (target === 'new') { setF(EMPTY); return; }
    setF({
      name: target.name ?? '',
      description: target.description ?? '',
      price: String(target.price ?? ''),
      currency: target.currency ?? 'USD',
      imageUrl: target.imageUrl ?? '',
      isActive: target.isActive ?? true,
      occupiesSeat: target.occupiesSeat ?? false,
      allowedVehicleTypeIds: target.allowedVehicleTypeIds ?? [],
      sortOrder: String(target.sortOrder ?? 0),
    });
  }, [target]);

  const set = <K extends keyof ExtraForm>(k: K, v: ExtraForm[K]) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.name.trim() !== '' && f.price !== '' && Number(f.price) >= 0;

  const upload = async (file: File) => {
    try {
      const url = await uploadFile('/website-content/upload-image', file);
      set('imageUrl', url);
      toast.success('Image uploaded');
    } catch (e: any) { toast.error(e.message); }
  };

  const save = async () => {
    if (!valid) { toast.error('Name and a non-negative price are required'); return; }
    setSaving(true);
    const body = {
      name: f.name.trim(),
      description: f.description.trim() || undefined,
      price: Number(f.price),
      currency: f.currency,
      imageUrl: f.imageUrl || undefined,
      isActive: f.isActive,
      occupiesSeat: f.occupiesSeat,
      allowedVehicleTypeIds: f.allowedVehicleTypeIds,
      sortOrder: Number(f.sortOrder) || 0,
    };
    try {
      if (isNew) await api.post('/extras', body);
      else if (target) await api.patch(`/extras/${target.id}`, body);
      toast.success(isNew ? 'Extra added' : 'Extra saved');
      onSaved();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()} title={isNew ? 'Add extra' : 'Edit extra'} size="lg">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Name">
            <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Child seat" />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Description">
            <Textarea value={f.description} onChange={(e) => set('description', e.target.value)} placeholder="Shown to guests at checkout" />
          </Field>
        </div>
        <Field label="Price">
          <Input type="number" min={0} value={f.price} onChange={(e) => set('price', e.target.value)} />
        </Field>
        <Field label="Currency">
          <Select value={f.currency} onChange={(e) => set('currency', e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Field>

        <div className="sm:col-span-2">
          <Field label="Image">
            {f.imageUrl ? (
              <div className="relative w-fit">
                <img src={assetUrl(f.imageUrl)} alt="" className="h-28 rounded-lg border border-slate-200 dark:border-slate-800 object-cover" />
                <button
                  onClick={() => set('imageUrl', '')}
                  className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-6 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <ImagePlus className="h-6 w-6" />
                <span className="text-xs">Upload image</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </Field>
        </div>

        <Field label="Sort order">
          <Input type="number" value={f.sortOrder} onChange={(e) => set('sortOrder', e.target.value)} />
        </Field>
        <div className="flex items-end gap-6 pb-1">
          <Switch checked={f.isActive} onChange={(v) => set('isActive', v)} label="Active" />
          <Switch checked={f.occupiesSeat} onChange={(v) => set('occupiesSeat', v)} label="Occupies seat" />
        </div>

        <div className="sm:col-span-2">
          <Field label="Allowed vehicle types" hint="Leave all unchecked to allow any vehicle.">
            {vehicles.length === 0 ? (
              <p className="text-xs text-slate-500">No vehicle types available.</p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {vehicles.map((v) => {
                  const on = f.allowedVehicleTypeIds.includes(v.id);
                  return (
                    <label key={v.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() =>
                          set('allowedVehicleTypeIds', on
                            ? f.allowedVehicleTypeIds.filter((x) => x !== v.id)
                            : [...f.allowedVehicleTypeIds, v.id])
                        }
                        className="accent-sky-500"
                      />
                      {v.name}
                    </label>
                  );
                })}
              </div>
            )}
          </Field>
        </div>
      </div>

      {target && target !== 'new' && (
        <div className="mt-4">
          <TranslationPanel
            entity="extra"
            basePath={`/extras/${target.id}`}
            id={target.id}
            fields={[
              { key: 'name', label: 'Name', type: 'input' },
              { key: 'description', label: 'Description', type: 'textarea' },
            ]}
          />
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={save} disabled={!valid || saving}>{isNew ? 'Add extra' : 'Save'}</Button>
      </div>
    </Modal>
  );
}
