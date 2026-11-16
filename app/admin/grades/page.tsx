"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Grade = {
  id?: string | number;
  student_email: string | null;
  subject: string;
  grade: number | string;
  semester: string;
};

type GradeWithStudentId = Grade & {
  displayStudentId: string;
};

export default function ManageGradesPage() {
  const [grades, setGrades] = useState<GradeWithStudentId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadGrades() {
      const { data: gradeData, error: gradeError } = await supabase
        .from("grades")
        .select("*");

      if (gradeError) {
        setError(gradeError.message);
        setLoading(false);
        return;
      }

      const records = gradeData ?? [];

      const emails = [
        ...new Set(
          records
            .map((item) =>
              typeof item.student_email === "string"
                ? item.student_email.trim().toLowerCase()
                : ""
            )
            .filter(Boolean)
        ),
      ];

      let studentData: { email: string; student_id: string | null }[] = [];

      if (emails.length > 0) {
        const { data, error: studentError } = await supabase
          .from("students")
          .select("email, student_id");

        if (studentError) {
          setError(studentError.message);
          setLoading(false);
          return;
        }

        studentData = (data ?? []).filter(
          (student) =>
            typeof student.email === "string" &&
            emails.includes(student.email.trim().toLowerCase())
        );
      }

      const updatedGrades: GradeWithStudentId[] = records.map((item) => {
        const email =
          typeof item.student_email === "string"
            ? item.student_email.trim().toLowerCase()
            : "";

        const student = studentData.find(
          (entry) => entry.email.trim().toLowerCase() === email
        );

        return {
          ...item,
          displayStudentId: student?.student_id ?? "",
        };
      });

      setGrades(updatedGrades);
      setLoading(false);
    }

    loadGrades();
  }, []);

  const filteredGrades = grades.filter((item) => {
    const text = search.toLowerCase();

    return (
      (item.subject ?? "").toLowerCase().includes(text) ||
      (item.semester ?? "").toLowerCase().includes(text) ||
      (item.student_email ?? "").toLowerCase().includes(text) ||
      item.displayStudentId.toLowerCase().includes(text)
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
              Manage Grades
            </h1>
            <p className="mt-2 text-slate-600">
              View and search student grades.
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
            <p className="text-sm text-slate-600">Total Grade Records</p>
            <p className="mt-2 text-3xl font-bold text-blue-800">
              {grades.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Matching Records</p>
            <p className="mt-2 text-3xl font-bold text-blue-800">
              {filteredGrades.length}
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <label
            htmlFor="grade-search"
            className="mb-2 block font-semibold text-slate-800"
          >
            Search Grades
          </label>

          <input
            id="grade-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subject, semester, email, or student ID..."
            className="mb-5 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
          />

          {loading ? (
            <p className="py-8 text-center text-slate-600">
              Loading grade records...
            </p>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              <p className="font-semibold">Unable to load grades.</p>
              <p className="mt-1 wrap-break-word text-sm">{error}</p>
            </div>
          ) : filteredGrades.length === 0 ? (
            <p className="py-8 text-center text-slate-600">
              No grade records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-175 border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Student Email
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                      Semester
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGrades.map((item, index) => (
                    <tr
                      key={`${item.student_email ?? "student"}-${item.subject}-${index}`}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.displayStudentId || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.student_email || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {item.subject || "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.grade ?? "—"}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.semester || "—"}
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