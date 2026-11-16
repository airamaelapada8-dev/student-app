"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Student = {
  full_name: string;
  program: string;
  year_section: string;
};

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "Grades", href: "/dashboard/grades", icon: "📊" },
  { name: "Schedule", href: "/dashboard/schedule", icon: "📅" },
  { name: "Announcements", href: "/dashboard/announcements", icon: "📢" },
  { name: "Attendance", href: "/dashboard/attendance", icon: "✅" },
  { name: "Profile", href: "/dashboard/profile", icon: "👤" },
  { name: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingUser, setCheckingUser] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkUser() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error || !user) {
          router.replace("/");
          return;
        }

        if (user.email) {
          const { data, error: studentError } = await supabase
            .from("students")
            .select("full_name, program, year_section")
            .eq("email", user.email)
            .maybeSingle();

          if (cancelled) return;

          if (!studentError && data) {
            setStudent(data as Student);
          }
        }

        if (!cancelled) {
          setCheckingUser(false);
        }
      } catch (error) {
        console.error("Unable to check user:", error);

        if (!cancelled) {
          router.replace("/");
        }
      }
    }

    checkUser();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const getIsActive = (href: string) => {
    return (
      pathname === href ||
      (href !== "/dashboard" && pathname.startsWith(href))
    );
  };

  const initials =
    student?.full_name
      ?.split(" ")
      .map((name) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    setMobileMenuOpen(false);
    router.replace("/");
  }

  if (checkingUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div
          role="status"
          aria-live="polite"
          className="text-center"
        >
          <div
            aria-hidden="true"
            className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700 motion-reduce:animate-none"
          />

          <p className="mt-4 text-sm font-medium text-gray-600">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-72 shrink-0 flex-col bg-blue-950 p-5 text-white md:flex">
          <div className="mb-7 border-b border-blue-800 pb-6">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-2xl"
              >
                🎓
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wider text-blue-300">
                  Student Portal
                </p>

                <h1 className="mt-1 truncate text-xl font-bold">
                  Student App
                </h1>
              </div>
            </div>
          </div>

          <nav
            aria-label="Main navigation"
            className="flex-1 space-y-1.5 overflow-y-auto"
          >
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-blue-300">
              Main Menu
            </p>

            {menuItems.map((item) => {
              const isActive = getIsActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 ${
                    isActive
                      ? "bg-blue-700 text-white shadow-sm"
                      : "text-blue-100 hover:bg-blue-900 hover:text-white"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-900/60 text-lg"
                  >
                    {item.icon}
                  </span>

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {student && (
            <div className="mb-4 mt-6 rounded-2xl bg-blue-900/70 p-4">
              <div className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-bold"
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {student.full_name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-blue-200">
                    {student.program} • {student.year_section}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-blue-100 transition hover:bg-blue-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900/60"
            >
              🚪
            </span>

            Logout
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* MOBILE HEADER */}
          <header className="border-b border-blue-900 bg-blue-950 p-4 text-white md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-xl"
                >
                  🎓
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-300">
                    Student Portal
                  </p>

                  <h1 className="truncate text-lg font-bold">
                    Student App
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
                aria-label={
                  mobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-700 bg-blue-900 text-2xl transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
              >
                <span aria-hidden="true">
                  {mobileMenuOpen ? "✕" : "☰"}
                </span>
              </button>
            </div>

            {student && (
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-blue-900/70 px-3 py-2.5">
                <div
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-bold"
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {student.full_name}
                  </p>

                  <p className="truncate text-xs text-blue-200">
                    {student.program} • {student.year_section}
                  </p>
                </div>
              </div>
            )}

            {/* COLLAPSIBLE MOBILE MENU */}
            {mobileMenuOpen && (
              <nav
                id="mobile-navigation"
                aria-label="Mobile navigation"
                className="mt-4 border-t border-blue-800 pt-3"
              >
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
                  Navigation
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {menuItems.map((item) => {
                    const isActive = getIsActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950 ${
                          isActive
                            ? "bg-blue-700 text-white"
                            : "text-blue-100 hover:bg-blue-900 hover:text-white"
                        }`}
                      >
                        <span aria-hidden="true">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-900 px-3 py-3 text-sm font-medium text-blue-100 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-950"
                  >
                    <span aria-hidden="true">🚪</span>
                    Logout
                  </button>
                </div>
              </nav>
            )}
          </header>

          {/* PAGE CONTENT */}
          <main className="min-w-0 flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}