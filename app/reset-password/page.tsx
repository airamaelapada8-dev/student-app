"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleUpdatePassword() {
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError("Unable to update your password. Please try again.");
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully!");

    setTimeout(() => {
      router.push("/");
    }, 1200);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-blue-950 via-blue-800 to-indigo-700 p-6">
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-2xl sm:p-10">

          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
              🔐
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Student Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Reset Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Create a new password for your student account.
            </p>
          </div>

          <div className="mt-8 space-y-5">

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                New Password
              </label>

              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-16 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700"
              >
                Confirm Password
              </label>

              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 pr-16 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                role="alert"
              >
                <p className="text-sm font-medium text-red-600">
                  {error}
                </p>
              </div>
            )}

            {message && (
              <div
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3"
                role="status"
              >
                <p className="text-sm font-semibold text-green-700">
                  {message}
                </p>

                <p className="mt-1 text-xs text-green-600">
                  Returning to login...
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={loading}
              className="w-full rounded-xl bg-blue-800 px-4 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Back to Login
            </button>

          </div>

          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-xs text-gray-500">
              Student Information and Academic Management System
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}