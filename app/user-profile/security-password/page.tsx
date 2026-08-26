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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-ink-500">
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
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-ink-200">
            <h1 className="text-2xl font-bold text-ink-900">Security & Password</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-ink-700 mb-2">
                Old Password
              </label>
              <input
                type="password"
                id="oldPassword"
                className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flame-500 focus:border-flame-500 text-ink-900 placeholder-ink-500"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-ink-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flame-500 focus:border-flame-500 text-ink-900 placeholder-ink-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-ink-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmNewPassword"
                className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flame-500 focus:border-flame-500 text-ink-900 placeholder-ink-500"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                className="px-6 py-2 border border-ink-200 rounded-lg text-ink-700 hover:bg-ink-50 font-medium transition-colors"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-flame-500 hover:bg-flame-600 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
                disabled={loading}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
