'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 border border-[#E5E5E5]">
          <div className="text-center mb-8">
            <Link href="/" className="text-xl font-semibold tracking-tight text-[#222222]">
              AM MARKETPLACE
            </Link>
            <h1 className="mt-6 text-2xl font-semibold text-[#222222]">Sign In</h1>
            <p className="mt-2 text-sm text-[#757575]">
              Welcome back! Sign in to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#222222] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#222222] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-[#E5E5E5] focus:border-[#222222] focus:outline-none text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#222222] hover:bg-[#333333] disabled:bg-[#757575] text-white font-medium py-2.5 text-sm transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#757575]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-[#222222] font-medium hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

