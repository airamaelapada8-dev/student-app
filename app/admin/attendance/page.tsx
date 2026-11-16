"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Attendance = {
  id?: number | string;
  student_id?: string | null;
  student_email?: string | null;
  student_name?: string | null;
  subject?: string | null;
  date?: string | null;
  day?: string | null;
  status?: string | null;
  remarks?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
};

export default function AdminAttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadAttendance() {
      const { data, error } = await supabase
        .from("attendance")
        .select("*");

      if (error) {
        setError(error.message);
        setRecords([]);
      } else {
        setRecords((data ?? []) as Attendance[]);
      }

      setLoading(false);
    }

    loadAttendance();
  }, []);

  const filteredRecords = records.filter((record) =>
    Object.values(record).some((value) =>
      String(value ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const columns = Array.from(
    new Set(records.flatMap((record) => Object.keys(record)))
  );

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="mb-6 inline-block rounded-lg bg-blue-900 px-4 py-2 text-white hover:bg-blue-800"
        >
          ← Back to Admin
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-950">
            Student App
          </h1>
          <h2 className="mt-2 text-2xl font-semibold">
            Manage Attendance
          </h2>
          <p className="mt-2 text-slate-600">
            View student attendance records.
          </p>
        </header>

        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Attendance Records
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {records.length} total record(s)
              </p>
            </div>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search attendance..."
              aria-label="Search attendance records"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200 sm:max-w-xs"
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-slate-600">
              Loading attendance records...
            </p>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              <p className="font-semibold">Unable to load attendance.</p>
              <p className="mt-1 wrap-break-word text-sm">{error}</p>
              <p className="mt-2 text-sm">
                Check that the attendance table exists and that its
                Supabase permissions allow this page to read records.
              </p>
            </div>
          ) : records.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-6 text-center text-slate-600">
              No attendance records found.
            </p>
          ) : filteredRecords.length === 0 ? (
            <p className="py-8 text-center text-slate-600">
              No matching records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap px-4 py-3 font-semibold"
                      >
                        {column
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (letter) =>
                            letter.toUpperCase()
                          )}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record, index) => (
                    <tr
                      key={String(record.id ?? index)}
                      className="border-b border-slate-200 hover:bg-blue-50"
                    >
                      {columns.map((column) => (
                        <td
                          key={column}
                          className="whitespace-nowrap px-4 py-3"
                        >
                          {record[column] == null
                            ? "—"
                            : typeof record[column] === "object"
                              ? JSON.stringify(record[column])
                              : String(record[column])}
                        </td>
                      ))}
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