/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage('Please enter your email address first.');
      return;
    }

    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo: `${window.location.origin}/login`,
        }
      );

      setMessage(
        error
          ? error.message
          : 'If your account exists, password reset instructions will be sent to your email.'
      );
    } catch {
      setMessage('Unable to send the reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <header className="mb-6 text-center">
          <img
            src="/logo1-removebg-preview-removebg-preview.png"
            alt="ESSU Logo"
            className="mx-auto mb-4 h-20 w-20 object-contain"
          />

          <h1 className="text-2xl font-bold tracking-tight text-blue-950">
            Student App
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Eastern Samar State University
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your student account
          </p>
        </header>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
          autoComplete="off"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>

            <input
              id="email"
              name="student-login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline disabled:opacity-50"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <input
                id="password"
                name="student-login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-20 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 text-sm font-medium text-blue-700 hover:text-blue-900"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {message && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800"
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-900 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Create Account Link */}
        <div className="mt-5 text-center">
          <p className="text-sm text-slate-600">
            Don&#39;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        <footer className="mt-6 border-t border-slate-200 pt-5 text-center">
          <p className="text-xs leading-5 text-slate-500">
            For authorized student use only.
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Student App © {new Date().getFullYear()}
          </p>
        </footer>
      </section>
    </main>
  );
}