'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

const BikeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>
  </svg>
);

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          router.push('/user-profile');
        }
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err: any) {
      setError('An unexpected error occurred during registration.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl border border-ink-200/50 shadow-large p-8 lg:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-flame-50 rounded-xl text-flame-500 mb-4">
              <BikeIcon />
            </div>
            <h2 className="font-display text-3xl font-bold text-ink-900">Create Account</h2>
            <p className="text-ink-500 mt-2 text-sm">Join the Sam&apos;s Bike Shop community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-ink-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-flame-500 hover:bg-flame-600 text-white font-bold py-3.5 px-4 rounded-xl transition-colors disabled:opacity-50 shadow-glow hover:shadow-glow-lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-flame-500 hover:text-flame-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
