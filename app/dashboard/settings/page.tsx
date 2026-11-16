"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Breadcrumbs from "../components/Breadcrumbs";

type Student = {
  email: string;
  student_id: string;
  full_name: string;
  program: string;
  year_section: string;
  status: string;
};

export default function Settings() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  useEffect(() => {
    async function getStudent() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select(
          "email, student_id, full_name, program, year_section, status"
        )
        .eq("email", user.email)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Settings query error:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
      } else if (data) {
        setStudent(data);
      }

      setLoading(false);
    }

    getStudent();
  }, []);

  function toggleNotifications() {
    setNotificationsEnabled((current) => !current);
  }

  function toggleProfileVisibility() {
    setProfileVisible((current) => !current);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs currentPage="Settings" />

        <section className="mt-5 md:mt-6">
          <div className="rounded-3xl bg-linear-to-br from-blue-950 via-blue-900 to-indigo-800 p-6 text-white shadow-xl sm:p-7 md:p-9">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 sm:text-sm">
              Student Account
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Settings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Manage your student account settings and personal preferences.
            </p>
          </div>
        </section>

        <section className="mt-6 md:mt-7">
          <div className="mb-5">
            <p className="text-sm font-semibold text-blue-700">
              Account Information
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Account Settings
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              View the account information connected to your student profile.
            </p>
          </div>

          {loading ? (
            <div className="max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-4">
                <div className="h-9 w-9 shrink-0 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

                <p className="text-sm font-medium text-gray-500">
                  Loading account information...
                </p>
              </div>
            </div>
          ) : student ? (
            <div className="max-w-4xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 md:p-7">
              <div className="mb-6 flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Student Account
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Your official student information.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  {student.status || "Active"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-slate-50 p-4 sm:p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Full Name
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {student.full_name}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-slate-50 p-4 sm:p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Student ID
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {student.student_id}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-slate-50 p-4 sm:p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Email
                  </p>

                  <p className="mt-2wrap-break-wordwrap-break-word font-semibold text-gray-900">
                    {student.email}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-slate-50 p-4 sm:p-5">
                  <p className="text-sm font-medium text-gray-500">
                    Program
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {student.program}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 bg-slate-50 p-4 sm:p-5 sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Year and Section
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {student.year_section}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm leading-6 text-blue-800">
                  Official student information is managed by the school and
                  cannot be edited from this page.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl rounded-2xl border border-red-100 bg-white p-6 shadow-sm sm:p-8">
              <p className="font-medium text-red-600">
                Account information could not be found.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Please make sure your student account is registered correctly.
              </p>
            </div>
          )}
        </section>

        <section className="mt-6 md:mt-7">
          <div className="mb-5">
            <p className="text-sm font-semibold text-blue-700">
              Preferences
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Notifications
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Manage your notification preferences and school updates.
            </p>
          </div>

          <div className="max-w-4xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 md:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17H9m8-2H7l1.5-2.5V9a3.5 3.5 0 0 1 7 0v3.5L17 15Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 19a2 2 0 0 0 4 0"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">
                    School Notifications
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Receive important school announcements and updates.
                  </p>

                  <p
                    className={`mt-3 text-sm font-semibold ${
                      notificationsEnabled
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {notificationsEnabled ? "ON" : "OFF"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleNotifications}
                aria-pressed={notificationsEnabled}
                aria-label="Toggle school notifications"
                className={`relative h-8 w-14 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notificationsEnabled ? "bg-blue-700" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                    notificationsEnabled ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 md:mt-7">
          <div className="mb-5">
            <p className="text-sm font-semibold text-blue-700">
              Privacy
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Privacy Settings
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Manage how your profile information is displayed within the app.
            </p>
          </div>

          <div className="max-w-4xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 md:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3 5 6v5c0 4.5 2.9 7.5 7 9 4.1-1.5 7-4.5 7-9V6l-7-3Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9.5 12 1.7 1.7 3.5-3.5"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-gray-900">
                    Profile Visibility
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Control whether your profile information is visible within
                    the app.
                  </p>

                  <p
                    className={`mt-3 text-sm font-semibold ${
                      profileVisible ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    {profileVisible ? "ON" : "OFF"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleProfileVisibility}
                aria-pressed={profileVisible}
                aria-label="Toggle profile visibility"
                className={`relative h-8 w-14 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  profileVisible ? "bg-blue-700" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
                    profileVisible ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 pb-5 md:mt-7 md:pb-8">
          <div className="max-w-4xl rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 10v6"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 7h.01"
                  />
                </svg>
              </div>

              <div>
                <h3 className="font-bold text-gray-900">
                  Settings Information
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  These settings are available for your student account.
                  Changes to official student information should be handled
                  through the appropriate school office.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}