"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ScheduleItem = {
  id?: string | number;
  day: string;
  time: string;
  subject: string;
  room: string | null;
};

export default function ManageSchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadSchedules() {
      const { data, error } = await supabase
        .from("schedule")
        .select("*");

      if (error) {
        setError(error.message);
      } else {
        setSchedules((data ?? []) as ScheduleItem[]);
      }

      setLoading(false);
    }

    loadSchedules();
  }, []);

  const filteredSchedules = schedules.filter((item) => {
    const text = search.toLowerCase();

    return (
      (item.day ?? "").toLowerCase().includes(text) ||
      (item.time ?? "").toLowerCase().includes(text) ||
      (item.subject ?? "").toLowerCase().includes(text) ||
      (item.room ?? "").toLowerCase().includes(text)
    );
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Student App
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              Manage Schedule
            </h1>
            <p className="mt-2 text-slate-600">
              View and search class schedules.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            ← Back to Admin
          </Link>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Total Schedules</p>
            <p className="mt-2 text-3xl font-bold text-blue-800">
              {schedules.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Matching Schedules</p>
            <p className="mt-2 text-3xl font-bold text-blue-800">
              {filteredSchedules.length}
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <label
            htmlFor="schedule-search"
            className="mb-2 block font-semibold text-slate-800"
          >
            Search Schedules
          </label>

          <input
            id="schedule-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search day, time, subject, or room..."
            className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />

          {loading ? (
            <p className="py-8 text-center text-slate-600">
              Loading schedules...
            </p>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              <p className="font-semibold">Unable to load schedules.</p>
              <p className="mt-1 wrap-break-word text-sm">{error}</p>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <p className="py-8 text-center text-slate-600">
              No schedule records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-162.5 border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Day
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Time
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Room
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSchedules.map((item, index) => (
                    <tr
                      key={`${item.day}-${item.subject}-${index}`}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.day || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.time || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {item.subject || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.room || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}