'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadFile, assetUrl } from '@/lib/admin-api';
import {
  PageHeader, Panel, EmptyState, Spinner, Button,
} from '@/components/admin/ui';
import { UploadCloud, Copy, X } from 'lucide-react';

interface MediaItem { url: string; name: string }

const STORAGE_KEY = 'b2c_admin_media';

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* fail-soft */ }
  }, []);

  const persist = (next: MediaItem[]) => {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* fail-soft */ }
  };

  const uploadMany = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;
    setUploading(true);
    const added: MediaItem[] = [];
    for (const file of list) {
      try {
        const url = await uploadFile('/website-content/upload-image', file);
        if (url) added.push({ url, name: file.name });
      } catch (e: any) {
        toast.error(`${file.name}: ${e.message ?? 'Upload failed'}`);
      }
    }
    if (added.length) {
      persist([...added, ...items]);
      toast.success(`${added.length} image${added.length > 1 ? 's' : ''} uploaded`);
    }
    setUploading(false);
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(assetUrl(url));
      toast.success('Copied');
    } catch (e: any) { toast.error(e.message ?? 'Copy failed'); }
  };

  const removeAt = (i: number) => persist(items.filter((_, idx) => idx !== i));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Media"
        description="Upload images and grab their URLs for use across the site."
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) uploadMany(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center transition ${
          dragging ? 'border-sky-500/60 bg-sky-500/5 text-slate-200' : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
        }`}
      >
        {uploading ? <Spinner /> : <UploadCloud className="h-7 w-7" />}
        <span className="text-sm font-medium">{uploading ? 'Uploading…' : 'Drop images here or click to upload'}</span>
        <span className="text-xs text-slate-500">PNG, JPG, WebP — multiple files supported</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) uploadMany(e.target.files); e.target.value = ''; }}
      />

      <p className="mt-2 text-xs text-slate-500">
        This library tracks images you upload here. The backend stores all uploads under /uploads.
      </p>

      <div className="mt-5">
        {items.length === 0 ? (
          <EmptyState title="No images yet" hint="Upload an image to build your library." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((m, i) => (
              <Panel key={`${m.url}-${i}`} className="group overflow-hidden">
                <div className="relative aspect-video bg-slate-950">
                  <img src={assetUrl(m.url)} alt={m.name} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeAt(i)}
                    className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
                    title="Remove from library"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <span className="truncate text-xs text-slate-400" title={m.name}>{m.name}</span>
                  <Button variant="ghost" onClick={() => copy(m.url)} className="h-7 shrink-0 px-2 py-1 text-xs">
                    <Copy className="h-3.5 w-3.5" /> Copy URL
                  </Button>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
