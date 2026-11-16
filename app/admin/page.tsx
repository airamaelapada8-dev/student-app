"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const cards = [
  {
    title: "Manage Students",
    description: "Add, edit, and view student records.",
    href: "/admin/students",
    icon: "🎓",
  },
  {
    title: "Manage Grades",
    description: "Encode and update student grades.",
    href: "/admin/grades",
    icon: "📝",
  },
  {
    title: "Manage Schedule",
    description: "Set up class schedules for each section.",
    href: "/admin/schedule",
    icon: "📅",
  },
  {
    title: "Announcements",
    description: "Post news and updates for students.",
    href: "/admin/announcements",
    icon: "📢",
  },
  {
    title: "Attendance",
    description: "Record and review student attendance.",
    href: "/admin/attendance",
    icon: "✅",
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Logout failed. Please try again.");
      return;
    }

    router.replace("/admin-login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Header */}
      <header className="bg-blue-950 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
              Student App
            </p>
            <h1 className="mt-1 text-2xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-950 transition hover:bg-blue-100"
            >
              Student Side
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            Welcome, Administrator
          </h2>
          <p className="mt-2 text-slate-600">
            Manage student records, grades, schedules, announcements, and
            attendance here.
          </p>
        </section>

        {/* Information Banner */}
        <section className="mb-8 rounded-2xl bg-blue-900 p-6 text-white shadow-md">
          <h3 className="text-xl font-bold">School Records</h3>
          <p className="mt-2 text-sm leading-relaxed text-blue-100">
            Keep all school information organized and accessible in one place.
          </p>
        </section>

        {/* Dashboard Cards */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex min-h-52.5 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-3xl transition group-hover:bg-blue-900 group-hover:text-white">
                {card.icon}
              </div>

              <h4 className="text-lg font-bold text-slate-800 transition group-hover:text-blue-900">
                {card.title}
              </h4>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                {card.description}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-blue-900">
                  Open section
                </span>
                <span className="text-lg text-blue-900 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 py-4 text-center text-sm text-blue-200">
        © 2026 Student App. All rights reserved.
      </footer>
    </div>
  );
}