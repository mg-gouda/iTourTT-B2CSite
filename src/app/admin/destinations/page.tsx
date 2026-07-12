'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/admin-api';
import {
  PageHeader, Table, THead, TH, TR, TD, Badge, EmptyState, Spinner,
} from '@/components/admin/ui';
import { Pencil } from 'lucide-react';

interface City { id: string; name: string }
interface CityPage {
  cityId: string;
  slug?: string;
  isPublished?: boolean;
}

function flattenCities(tree: any[]): City[] {
  const out: City[] = [];
  const walk = (nodes: any[]) => {
    for (const n of nodes ?? []) {
      if (n.type === 'CITY') out.push({ id: n.id, name: n.name });
      if (n.children) walk(n.children);
    }
  };
  walk(tree);
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export default function DestinationsPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[] | null>(null);
  const [pages, setPages] = useState<CityPage[]>([]);

  useEffect(() => {
    api.get<any[]>('/public/locations')
      .then((t) => setCities(flattenCities(t)))
      .catch((e) => { toast.error(e.message); setCities([]); });
    api.get<CityPage[]>('/city-pages')
      .then((p) => setPages(p ?? []))
      .catch(() => {});
  }, []);

  const pageByCity = useMemo(() => {
    const m: Record<string, CityPage> = {};
    for (const p of pages) m[p.cityId] = p;
    return m;
  }, [pages]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Destinations"
        description="City landing pages for transferra.ae — one page per city in the location tree."
      />

      {cities === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : cities.length === 0 ? (
        <EmptyState title="No cities yet" hint="Add cities to the location tree to build destination pages." />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>City</TH>
              <TH className="w-40">Page</TH>
              <TH className="w-28 text-right">Actions</TH>
            </tr>
          </THead>
          <tbody>
            {cities.map((c) => {
              const page = pageByCity[c.id];
              const tone = !page ? 'slate' : page.isPublished ? 'green' : 'amber';
              const label = !page ? 'No page' : page.isPublished ? 'Published' : 'Draft';
              return (
                <TR key={c.id}>
                  <TD>
                    <div className="font-medium text-slate-100">{c.name}</div>
                    {page?.slug && <div className="text-xs text-slate-500">/{page.slug}</div>}
                  </TD>
                  <TD><Badge tone={tone}>{label}</Badge></TD>
                  <TD>
                    <div className="flex items-center justify-end">
                      <button
                        title={page ? 'Edit page' : 'Create page'}
                        onClick={() => router.push(`/admin/destinations/${c.id}`)}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-sky-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
