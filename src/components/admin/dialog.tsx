'use client';

import * as React from 'react';
import { Dialog as RxDialog } from 'radix-ui';
import { X } from 'lucide-react';
import { Button } from './ui';

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
  const maxW = { md: 480, lg: 720, xl: 960 }[size];
  return (
    <RxDialog.Root open={open} onOpenChange={onOpenChange}>
      <RxDialog.Portal>
        <RxDialog.Overlay
          className="fixed inset-0 z-[100010] bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in"
        />
        <RxDialog.Content
          className="fixed left-1/2 top-1/2 z-[100011] max-h-[90vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto scrollbar-thin rounded-lg border border-border bg-card text-card-foreground p-5 shadow-xl data-[state=open]:animate-fade-in"
          style={{ maxWidth: maxW }}
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <RxDialog.Title className="text-base font-semibold text-foreground">{title}</RxDialog.Title>
              {description && (
                <RxDialog.Description className="text-xs text-muted-foreground">{description}</RxDialog.Description>
              )}
            </div>
            <RxDialog.Close
              className="rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close"
            >
              <X className="size-4" />
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
  onConfirm: () => unknown | Promise<unknown>;
}) {
  const [busy, setBusy] = React.useState(false);
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} size="md">
      <p className="text-sm text-muted-foreground">{message}</p>
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
