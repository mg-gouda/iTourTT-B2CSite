'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Button, Table, THead, TH, TR, TD, Panel, Field, Input, Select,
  EmptyState, Spinner, Badge,
} from '@/components/admin/ui';
import { Modal, ConfirmDialog } from '@/components/admin/dialog';
import { Plus, Trash2, Check } from 'lucide-react';

interface PriceRow {
  id: string;
  serviceType: string; transferType: string;
  fromZoneId: string; toZoneId: string; vehicleTypeId: string;
  price: string | number; currency: string;
  fromZone?: { name: string }; toZone?: { name: string }; vehicleType?: { name: string };
}
interface Zone { id: string; name: string }
interface VehicleType { id: string; name: string }

const SERVICE_TYPES = ['ARR', 'DEP', 'DAY_TOUR', 'ONE_WAY_TRANSFER', 'TWO_WAY_TRANSFER', 'CITY_TO_CITY'];
const CURRENCIES = ['EGP', 'USD', 'EUR', 'GBP', 'SAR'];

function flattenZones(tree: any[]): Zone[] {
  const out: Zone[] = [];
  const walk = (nodes: any[]) => {
    for (const n of nodes ?? []) {
      if (n.type === 'ZONE') out.push({ id: n.id, name: n.name });
      if (n.children) walk(n.children);
    }
  };
  walk(tree);
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export default function PricingPage() {
  const [rows, setRows] = useState<PriceRow[] | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [del, setDel] = useState<PriceRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const load = () =>
    api.get<PriceRow[]>('/public-prices').then(setRows).catch((e) => { toast.error(e.message); setRows([]); });

  useEffect(() => {
    load();
    api.get<any[]>('/public/locations').then((t) => setZones(flattenZones(t))).catch(() => {});
    api.get<VehicleType[]>('/public/vehicle-types').then(setVehicles).catch(() => {});
  }, []);

  const zoneName = (id: string) => zones.find((z) => z.id === id)?.name ?? id.slice(0, 6);
  const vehName = (id: string) => vehicles.find((v) => v.id === id)?.name ?? id.slice(0, 6);

  const savePrice = async (row: PriceRow) => {
    const val = editing[row.id];
    if (val === undefined) return;
    try {
      await api.patch(`/public-prices/${row.id}`, { price: Number(val) });
      toast.success('Price updated & synced to ops');
      setEditing((e) => { const n = { ...e }; delete n[row.id]; return n; });
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (row: PriceRow) => {
    await api.del(`/public-prices/${row.id}`);
    toast.success('Price removed');
    load();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Pricing"
        description="Public transfer prices — saved here and synced to iTourTT for job costing."
        actions={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add price</Button>}
      />

      {rows === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : rows.length === 0 ? (
        <EmptyState title="No prices yet" hint="Add your first route price." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>Route</TH>
              <TH className="w-32">Vehicle</TH>
              <TH className="w-40">Service</TH>
              <TH className="w-44">Price</TH>
              <TH className="w-16 text-right">·</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD>
                  <span className="text-slate-100">{r.fromZone?.name ?? zoneName(r.fromZoneId)}</span>
                  <span className="mx-1.5 text-slate-600">→</span>
                  <span className="text-slate-100">{r.toZone?.name ?? zoneName(r.toZoneId)}</span>
                </TD>
                <TD>{r.vehicleType?.name ?? vehName(r.vehicleTypeId)}</TD>
                <TD>
                  <Badge tone="sky">{r.serviceType}</Badge>{' '}
                  <span className="text-xs text-slate-500">{r.transferType}</span>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={editing[r.id] ?? String(r.price)}
                      onChange={(e) => setEditing((s) => ({ ...s, [r.id]: e.target.value }))}
                      className="h-8 w-24 px-2 py-1"
                      type="number"
                    />
                    <span className="text-xs text-slate-400">{r.currency}</span>
                    {editing[r.id] !== undefined && editing[r.id] !== String(r.price) && (
                      <button onClick={() => savePrice(r)} className="rounded-md p-1 text-emerald-400 hover:bg-slate-800" title="Save">
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </TD>
                <TD>
                  <div className="flex justify-end">
                    <button onClick={() => setDel(r)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-red-400" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}

      <AddPriceModal
        open={addOpen}
        onOpenChange={setAddOpen}
        zones={zones}
        vehicles={vehicles}
        onSaved={() => { setAddOpen(false); load(); }}
      />
      <ConfirmDialog
        open={!!del}
        onOpenChange={(v) => !v && setDel(null)}
        title="Delete price"
        message="Remove this route price? It will also stop syncing to ops."
        onConfirm={() => del && remove(del)}
      />
    </div>
  );
}

function AddPriceModal({
  open, onOpenChange, zones, vehicles, onSaved,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  zones: Zone[]; vehicles: VehicleType[]; onSaved: () => void;
}) {
  const [f, setF] = useState({
    serviceType: 'ARR', transferType: 'PRIVATE',
    fromZoneId: '', toZoneId: '', vehicleTypeId: '', price: '', currency: 'USD',
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.fromZoneId && f.toZoneId && f.vehicleTypeId && f.price !== '';

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/public-prices/bulk', {
        items: [{ ...f, price: Number(f.price) }],
      });
      toast.success('Price added & synced to ops');
      onSaved();
      setF({ serviceType: 'ARR', transferType: 'PRIVATE', fromZoneId: '', toZoneId: '', vehicleTypeId: '', price: '', currency: 'USD' });
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add price" size="lg">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="From zone">
          <Select value={f.fromZoneId} onChange={(e) => set('fromZoneId', e.target.value)}>
            <option value="">Select…</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </Select>
        </Field>
        <Field label="To zone">
          <Select value={f.toZoneId} onChange={(e) => set('toZoneId', e.target.value)}>
            <option value="">Select…</option>
            {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </Select>
        </Field>
        <Field label="Vehicle">
          <Select value={f.vehicleTypeId} onChange={(e) => set('vehicleTypeId', e.target.value)}>
            <option value="">Select…</option>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </Select>
        </Field>
        <Field label="Service">
          <Select value={f.serviceType} onChange={(e) => set('serviceType', e.target.value)}>
            {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Transfer type">
          <Select value={f.transferType} onChange={(e) => set('transferType', e.target.value)}>
            <option value="PRIVATE">PRIVATE</option>
            <option value="SHARED">SHARED</option>
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Price">
            <Input type="number" value={f.price} onChange={(e) => set('price', e.target.value)} />
          </Field>
          <Field label="Currency">
            <Select value={f.currency} onChange={(e) => set('currency', e.target.value)}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={save} disabled={!valid || saving}>Add price</Button>
      </div>
    </Modal>
  );
}
