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
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', zIndex: 100010 }}
        />
        <RxDialog.Content
          className="wpwrap"
          style={{
            position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)',
            width: 'calc(100vw - 2rem)', maxWidth: maxW, maxHeight: '90vh', overflowY: 'auto',
            background: '#fff', border: '1px solid #c3c4c7', boxShadow: '0 3px 6px rgba(0,0,0,.3)',
            zIndex: 100011,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '12px 16px', borderBottom: '1px solid #c3c4c7' }}>
            <div>
              <RxDialog.Title style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1d2327' }}>{title}</RxDialog.Title>
              {description && (
                <RxDialog.Description style={{ margin: '2px 0 0', fontSize: 13, color: '#646970' }}>
                  {description}
                </RxDialog.Description>
              )}
            </div>
            <RxDialog.Close
              style={{ background: 'transparent', border: 0, cursor: 'pointer', color: '#646970', padding: 2, lineHeight: 0 }}
              aria-label="Close"
            >
              <X style={{ width: 18, height: 18 }} />
            </RxDialog.Close>
          </div>
          <div style={{ padding: 16 }}>{children}</div>
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
      <p style={{ fontSize: 13, color: '#3c434a', margin: 0 }}>{message}</p>
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
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
