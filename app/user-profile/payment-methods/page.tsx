'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PaymentMethodsPage() {
  const { status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-zinc-500">
        Loading payment methods...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black mb-8 text-blue-400">Payment Methods</h1>
      <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 text-center">
        <p className="text-zinc-400">This section is under construction. Please check back later for options to manage your payment methods.</p>
        <button
          className="mt-8 px-6 py-2 border border-zinc-700 rounded-md text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
          onClick={() => router.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
