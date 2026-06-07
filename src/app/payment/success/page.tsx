'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

function SuccessInner() {
  const ref = useSearchParams().get('ref');
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center space-y-5">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
        <p className="text-sm text-gray-500">
          Thank you — your payment has been received and your booking is confirmed.
          A receipt has been emailed to you.
        </p>
        {ref && (
          <p className="text-gray-500">
            Your reference: <span className="font-bold text-gray-900">{ref}</span>
          </p>
        )}
        <div className="flex flex-col gap-2 pt-2">
          <Link href="/booking/lookup"
            className="w-full rounded-xl px-8 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition">
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  );
}
