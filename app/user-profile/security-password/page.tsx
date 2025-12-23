'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SecurityPasswordPage() {
  const { status } = useSession();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (status === 'loading') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-zinc-500">
        Loading security settings...
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirmation do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setError(data.message || 'Failed to change password.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-black mb-8 text-blue-400">Security & Password</h1>
      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 space-y-6">
        <div>
          <label htmlFor="oldPassword" className="block text-sm font-medium text-zinc-300 mb-2">
            Old Password
          </label>
          <input
            type="password"
            id="oldPassword"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500 text-zinc-100 placeholder-zinc-500"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-zinc-300 mb-2">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500 text-zinc-100 placeholder-zinc-500"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
          />
        </div>
        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-zinc-300 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500 text-zinc-100 placeholder-zinc-500"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={loading}
            required
            minLength={6}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-emerald-500 text-sm">{success}</p>}

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
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
