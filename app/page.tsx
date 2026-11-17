
/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data.session || !data.user) {
        setMessage("Login failed. Please try again.");
        return;
      }

      window.location.assign("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage("Please enter your email address first.");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "If your account exists, password reset instructions will be sent to your email."
        );
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setMessage("Unable to send the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 sm:py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">

        {/* ESSU Logo */}
        <header className="mb-7 text-center">
          <img
            src="/essu-logo.png"
            alt="ESSU Logo"
            className="mx-auto mb-4 h-24 w-24 object-contain"
          />

          <h1 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl">
            Student App
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Eastern Samar State University
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Sign in to access your student account
          </p>
        </header>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="space-y-5"
          autoComplete="off"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email Address
            </label>

            <input
              id="email"
              name="student-app-email-field"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onFocus={() => setEmailFocused(true)}
              placeholder="Enter your email"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              readOnly={!emailFocused}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-700"
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
                name="student-app-password-field"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onFocus={() => setPasswordFocused(true)}
                placeholder="Enter your password"
                autoComplete="new-password"
                readOnly={!passwordFocused}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-20 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-3 text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm leading-relaxed text-blue-800"
            >
              {message}
            </div>
          )}

          {/* Sign In */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-900 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Create Account */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-700 hover:text-blue-900 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Footer */}
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
