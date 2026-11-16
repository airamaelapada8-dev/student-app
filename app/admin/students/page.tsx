"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Student = {
  id: number | string;
  full_name: string | null;
  student_id: string | null;
  email: string | null;
  program: string | null;
  year_section: string | null;
  status: string | null;
};

export default function ManageStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadStudents() {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setStudents((data ?? []) as Student[]);
      }

      setLoading(false);
    }

    loadStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const searchText = search.toLowerCase();

    return [
      student.full_name,
      student.student_id,
      student.email,
      student.program,
      student.year_section,
    ].some((value) => value?.toLowerCase().includes(searchText));
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
              Manage Students
            </h1>
            <p className="mt-2 text-slate-600">
              View and search student records.
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
            <p className="text-sm text-slate-600">Total Student Records</p>
            <p className="mt-2 text-3xl font-bold text-blue-800">
              {students.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Matching Records</p>
            <p className="mt-2 text-3xl font-bold text-blue-800">
              {filteredStudents.length}
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <label
            htmlFor="student-search"
            className="mb-2 block font-semibold text-slate-800"
          >
            Search Students
          </label>

          <input
            id="student-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, student ID, email, or program..."
            className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />

          {loading ? (
            <p className="py-8 text-center text-slate-600">
              Loading student records...
            </p>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              <p className="font-semibold">Unable to load student records.</p>
              <p className="mt-1 wrap-break-word text-sm">{error}</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <p className="py-8 text-center text-slate-600">
              No student records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-187.5 border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Full Name
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Program
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Year & Section
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id ?? student.student_id ?? index}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {student.student_id || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {student.full_name || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {student.email || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {student.program || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {student.year_section || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                          {student.status || "Not set"}
                        </span>
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