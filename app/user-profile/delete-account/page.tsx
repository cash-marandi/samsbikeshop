'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (status === 'loading') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-zinc-500">
        Loading account deletion options...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (res.ok) {
        await signOut({ callbackUrl: '/' }); // Sign out and redirect to home
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete account.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black mb-8 text-blue-400">Delete Account</h1>
      <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 space-y-6">
        <p className="text-red-500 text-lg font-bold">
          Warning: Deleting your account is a permanent action and cannot be undone.
        </p>
        <p className="text-zinc-300">
          All your data, including your profile, order history, and bids, will be permanently removed.
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="confirmDelete"
            checked={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.checked)}
            className="form-checkbox h-5 w-5 text-red-600"
          />
          <label htmlFor="confirmDelete" className="text-zinc-300">
            I understand the consequences and wish to delete my account.
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-zinc-700 rounded-md text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md disabled:opacity-50"
            disabled={loading || !confirmDelete}
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
