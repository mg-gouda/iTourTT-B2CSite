import { redirect } from 'next/navigation';

// The middleware handles this redirect for most clients.
// This fallback covers the rare case where middleware is bypassed.
export default function RootPage() {
  redirect('/en');
}
