'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

function CancelInner() {
  const ref = useSearchParams().get('ref');
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center space-y-5">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Not Completed</h1>
        <p className="text-sm text-gray-500">
          We couldn&apos;t confirm your online payment, so no charge was taken.
          Don&apos;t worry — your booking is still held and has been switched to
          <span className="font-semibold text-gray-700"> Pay on Arrival</span>.
          Please pay your driver in cash when you arrive.
        </p>
        {ref && (
          <p className="text-gray-500">
            Your reference: <span className="font-bold text-gray-900">{ref}</span>
          </p>
        )}
        <p className="text-xs text-gray-400">
          Want to pay online instead? Contact us and we&apos;ll send you a new payment link.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Link href="/booking/lookup"
            className="w-full rounded-xl px-8 py-3 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition">
            Track My Booking
          </Link>
          <Link href="/"
            className="w-full rounded-xl px-8 py-3 text-sm font-bold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PaymentCancelClient() {
  return (
    <Suspense fallback={null}>
      <CancelInner />
    </Suspense>
  );
}
