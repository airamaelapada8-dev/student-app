"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Breadcrumbs from "../components/Breadcrumbs";

type Announcement = {
  id: string;
  title: string;
  date: string;
  message: string;
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAnnouncements() {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, date, message")
        .order("date", { ascending: false });

      if (error) {
        console.error("Announcements query error:", error);
      } else {
        const announcementData = data || [];

        setAnnouncements(announcementData);

        const announcementIds = announcementData.map(
          (announcement) => announcement.id
        );

        localStorage.setItem(
          "student-app-read-announcements",
          JSON.stringify(announcementIds)
        );
      }

      setLoading(false);
    }

    getAnnouncements();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs currentPage="Announcements" />

        {/* Hero */}
        <section className="mt-6">
          <div className="overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-900 to-indigo-800 text-white shadow-xl">
            <div className="p-7 md:p-9">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-100 ring-1 ring-white/10">
                    <span className="h-2 w-2 rounded-full bg-blue-300" />
                    School Updates
                  </div>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                    Announcements
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
                    Stay updated with important school announcements,
                    reminders, and information.
                  </p>
                </div>

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 shadow-lg ring-1 ring-white/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-10 w-10 text-white"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3v-3.5A2.5 2.5 0 0 1 3 14V6.5Z"
                    />
                    <path
                      strokeLinecap="round"
                      d="M8 8h8M8 11h5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Header */}
        <section className="mt-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Latest Updates
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                School Announcements
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select an announcement to view the complete message.
              </p>
            </div>

            {!loading && announcements.length > 0 && (
              <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm ring-1 ring-gray-100">
                {announcements.length}{" "}
                {announcements.length === 1
                  ? "Announcement"
                  : "Announcements"}
              </div>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
                </div>

                <p className="mt-4 text-sm font-semibold text-gray-700">
                  Loading announcements...
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Please wait while we load the latest school updates.
                </p>
              </div>
            </div>
          ) : announcements.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3v-3.5A2.5 2.5 0 0 1 3 14V6.5Z"
                  />
                </svg>
              </div>

              <p className="mt-5 text-lg font-semibold text-gray-900">
                No announcements found
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
                There are no school announcements available at the moment.
                Please check again later.
              </p>
            </div>
          ) : (
            /* Announcement List */
            <div className="grid max-w-5xl gap-5">
              {announcements.map((announcement, index) => (
                <Link
                  key={announcement.id}
                  href={`/dashboard/announcements/${announcement.id}`}
                  className="group block rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:p-7"
                >
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
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
                              d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3v-3.5A2.5 2.5 0 0 1 3 14V6.5Z"
                            />
                          </svg>
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 transition group-hover:text-blue-700 md:text-xl">
                              {announcement.title}
                            </h3>

                            {index === 0 && (
                              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                Latest
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-700">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4"
                              aria-hidden="true"
                            >
                              <rect
                                width="18"
                                height="18"
                                x="3"
                                y="4"
                                rx="2"
                                ry="2"
                              />
                              <path
                                strokeLinecap="round"
                                d="M16 2v4M8 2v4M3 10h18"
                              />
                            </svg>

                            {announcement.date}
                          </div>
                        </div>
                      </div>

                      <span className="w-fit shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
                        Announcement
                      </span>
                    </div>

                    <p className="line-clamp-2 leading-7 text-gray-600">
                      {announcement.message}
                    </p>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <span className="text-sm font-semibold text-blue-700">
                        View Announcement
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-lg text-blue-700 transition group-hover:translate-x-1 group-hover:bg-blue-100">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}