'use client';

import * as React from 'react';
import { Dialog as RxDialog } from 'radix-ui';
import { X } from 'lucide-react';
import { Button, cn } from './ui';

export function Modal({
  open, onOpenChange, title, description, children, size = 'md',
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  const width = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size];
  return (
    <RxDialog.Root open={open} onOpenChange={onOpenChange}>
      <RxDialog.Portal>
        <RxDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <RxDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-100 shadow-2xl',
            width,
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <RxDialog.Title className="text-base font-semibold">{title}</RxDialog.Title>
              {description && (
                <RxDialog.Description className="mt-0.5 text-xs text-slate-400">
                  {description}
                </RxDialog.Description>
              )}
            </div>
            <RxDialog.Close className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
              <X className="h-4 w-4" />
            </RxDialog.Close>
          </div>
          {children}
        </RxDialog.Content>
      </RxDialog.Portal>
    </RxDialog.Root>
  );
}

export function ConfirmDialog({
  open, onOpenChange, title, message, confirmLabel = 'Delete', onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="md">
      <p className="text-sm text-slate-300">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button
          variant="danger"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try { await onConfirm(); onOpenChange(false); } finally { setBusy(false); }
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
