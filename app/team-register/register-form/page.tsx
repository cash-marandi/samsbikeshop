'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserRole } from '../../../app/types'; // Adjust path if necessary

export default function TeamRegisterFormPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.VIEWER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/team-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Team member registered successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/team-login');
        }, 2000); // Redirect after 2 seconds
      } else {
        setError(data.message || 'Team registration failed.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred during team registration.');
      console.error('Team registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-lg w-full max-w-md border border-zinc-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-400">Register Team Member</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500 text-zinc-100 placeholder-zinc-500"
              placeholder="Team Member Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500 text-zinc-100 placeholder-zinc-500"
              placeholder="team@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500 text-zinc-100 placeholder-zinc-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-zinc-300 mb-2">
              Role
            </label>
            <select
              id="role"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md focus:ring-blue-500 focus:border-blue-500 text-zinc-100"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
              disabled={loading}
            >
              {Object.values(UserRole).map((r) => (
                // Only show roles that are typically for team members (not just 'USER')
                // For this form, we might want to restrict initial roles or provide full access
                // For simplicity, I'll show all roles from UserRole
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {successMessage && <p className="text-emerald-500 text-sm text-center">{successMessage}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Team Member'}
          </button>
        </form>
        <p className="text-center text-sm text-zinc-400 mt-6">
          Already have a team account?{' '}
          <Link href="/team-login" className="text-blue-400 hover:text-blue-300 font-medium">
            Team Login
          </Link>
        </p>
      </div>
    </div>
  );
}
