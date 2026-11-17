/* eslint-disable @next/next/no-img-element */

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const passwordChecks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "At least one uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "At least one number", valid: /[0-9]/.test(password) },
    {
      label: "At least one special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const passwordIsValid = passwordChecks.every((item) => item.valid);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!passwordIsValid) {
      setErrorMessage("Please complete all password requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      if (data.session) {
        setSuccessMessage(
          "Your account was created successfully! You can now sign in."
        );
      } else {
        setSuccessMessage(
          "Registration successful! Please check your email and confirm your account before signing in."
        );
      }

      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-slate-100 to-blue-100 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-white bg-white p-6 shadow-xl sm:p-9">

        {/* ESSU Logo and Header */}
        <div className="mb-8 text-center">
          <img
            src="/essu-logo.png"
            alt="Eastern Samar State University Logo"
            className="mx-auto mb-4 h-20 w-20 object-contain"
          />

          <h1 className="text-3xl font-bold tracking-tight text-blue-950">
            Create Account
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Register your Student App account
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Eastern Samar State University
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-gray-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-700">
                Password requirements:
              </p>

              <ul className="space-y-1">
                {passwordChecks.map((item) => (
                  <li
                    key={item.label}
                    className={`text-xs ${
                      item.valid ? "text-green-700" : "text-gray-500"
                    }`}
                  >
                    {item.valid ? "✓" : "○"} {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold text-gray-800"
            >
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-gray-900 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-700"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {confirmPassword.length > 0 && (
              <p
                className={`mt-2 text-xs ${
                  password === confirmPassword
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {password === confirmPassword
                  ? "✓ Passwords match"
                  : "Passwords do not match"}
              </p>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div
              role="status"
              className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm leading-relaxed text-green-800"
            >
              {successMessage}
            </div>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-900 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-7 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/"
              className="font-semibold text-blue-700 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-xs text-gray-400">
          <p>For authorized student use only.</p>
          <p className="mt-1">Student App © 2026</p>
        </div>
      </section>
    </main>
  );
}
