"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Breadcrumbs from "../../components/Breadcrumbs";

type Announcement = {
  id: string;
  title: string;
  date: string;
  message: string;
};

export default function AnnouncementDetails() {
  const params = useParams();
  const id = params.id as string;

  const [announcement, setAnnouncement] =
    useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAnnouncement() {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, date, message")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Announcement query error:", error);
      } else {
        setAnnouncement(data);
      }

      setLoading(false);
    }

    if (id) {
      getAnnouncement();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading announcement...
          </p>
        </div>
      </main>
    );
  }

  if (!announcement) {
    return (
      <main className="min-h-screen bg-slate-50 p-5 md:p-8">
        <div className="mx-auto max-w-4xl">
          <Breadcrumbs currentPage="Announcement" />

          <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="font-semibold text-gray-900">
              Announcement not found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              The announcement may no longer be available.
            </p>

            <Link
              href="/dashboard/announcements"
              className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to Announcements
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Breadcrumbs currentPage="Announcement" />

        <section className="mt-6">
          <div className="rounded-3xl bg-bg-linear-to-br from-blue-950 via-blue-900 to-indigo-800 p-7 text-white shadow-xl md:p-9">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
              School Updates
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Announcement
            </h1>

            <p className="mt-3 max-w-2xl text-blue-100">
              View the complete announcement and important school information.
            </p>
          </div>
        </section>

        <article className="mt-7 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-white px-6 py-6 md:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  School Announcement
                </p>

                <h2 className="mt-2 text-2xl font-bold leading-tight text-gray-900 md:text-3xl">
                  {announcement.title}
                </h2>

                <p className="mt-3 text-sm font-medium text-gray-500">
                  {announcement.date}
                </p>
              </div>

              <span className="w-fit shrink-0 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Announcement
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="rounded-2xl bg-slate-50 p-6 md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
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

                <p className="font-semibold text-gray-900">
                  Announcement Details
                </p>
              </div>

              <p className="mt-5 whitespace-pre-line leading-8 text-gray-700">
                {announcement.message}
              </p>
            </div>

            <div className="mt-7 border-t border-gray-100 pt-6">
              <Link
                href="/dashboard/announcements"
                className="inline-flex items-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                ← Back to Announcements
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}