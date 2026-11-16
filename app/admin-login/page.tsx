/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        setErrorMessage("Invalid email or password.");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      console.log("Admin verification result:", {
        authenticatedUserId: data.user.id,
        authenticatedEmail: data.user.email,
        adminFound: Boolean(admin),
        adminRecord: admin,
        adminError: adminError
          ? {
              message: adminError.message,
              code: adminError.code,
              details: adminError.details,
              hint: adminError.hint,
            }
          : null,
      });

      if (adminError || !admin) {
        await supabase.auth.signOut();

        setErrorMessage(
          adminError
            ? `Admin verification failed: ${adminError.message}`
            : "Admin record not found. Check the admin_users table."
        );

        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error("Admin login exception:", error);

      setErrorMessage(
        "Something went wrong. Please check the browser console."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <form
        onSubmit={handleLogin}
        autoComplete="off"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8"
      >
        <div className="mb-5 flex justify-center">
          <img
           src="/logo1-removebg-preview-removebg-preview.png"
            alt="Eastern Samar State University Logo"
            className="h-20 w-20 object-contain"
          />
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-950">
            Admin Login
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Eastern Samar State University
          </p>

          <p className="mt-1 text-sm text-slate-600">
            Sign in using your authorized administrator account.
          </p>
        </div>

        <div className="mt-7">
          <label
            htmlFor="admin-email"
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Admin Email
          </label>

          <input
            id="admin-email"
            name="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            required
            placeholder="Enter your email"
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="admin-password"
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Password
          </label>

          <div className="flex rounded-lg border border-slate-300 focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-200">
            <input
              id="admin-password"
              name="admin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              placeholder="Enter your password"
              className="min-w-0 flex-1 rounded-l-lg px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="px-4 text-sm font-medium text-blue-700"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-blue-800 px-4 py-3 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Checking account..." : "Login as Admin"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-semibold text-blue-900 transition hover:bg-slate-50"
        >
          Back to Student Login
        </button>

        <div className="mt-6 border-t border-slate-200 pt-5 text-center">
          <p className="text-xs text-slate-500">
            For authorized administrator use only.
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Student App © 2026
          </p>
        </div>
      </form>
    </main>
  );
}