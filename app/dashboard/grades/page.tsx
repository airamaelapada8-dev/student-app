
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Breadcrumbs from "../components/Breadcrumbs";

type Grade = {
  subject: string;
  grade: number;
  semester: string;
};

export default function Grades() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function getGrades() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;

        if (!user?.email) {
          if (!cancelled) setGrades([]);
          return;
        }

        const { data, error } = await supabase
          .from("grades")
          .select("subject, grade, semester")
          .eq("student_email", user.email)
          .order("subject");

        if (error) throw error;

        if (!cancelled) {
          setGrades(
            (data || []).map((item) => ({
              subject: item.subject,
              grade: Number(item.grade),
              semester: item.semester,
            }))
          );
        }
      } catch (error) {
        console.error("Unable to load grades:", error);

        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    getGrades();

    return () => {
      cancelled = true;
    };
  }, []);

  // Estimated GWA: assumes all subjects have equal units.
  const validGrades = grades.filter(
    (item) => Number.isFinite(item.grade)
  );

  const gwa =
    validGrades.length > 0
      ? validGrades.reduce((total, item) => total + item.grade, 0) /
        validGrades.length
      : null;

  const currentSemester =
    grades.length > 0 ? grades[0].semester : "No Record";

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs currentPage="Grades" />

        {/* Page Header */}
        <section className="mt-6">
          <div className="rounded-3xl bg-linear-to-br from-blue-950 via-blue-900 to-indigo-800 p-6 text-white shadow-xl sm:p-7 md:p-9">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
              Academic Records
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              My Grades
            </h1>

            <p className="mt-3 max-w-2xl leading-relaxed text-blue-100">
              View your academic grades and semester results in one place.
            </p>
          </div>
        </section>

        {/* Grade Summary */}
        <section
          aria-label="Academic summary"
          className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-medium text-gray-600">
              Total Subjects
            </p>

            <p className="mt-4 text-3xl font-bold text-blue-700">
              {loading ? "—" : grades.length}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Recorded academic subjects
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-medium text-gray-600">
              General Weighted Average
            </p>

            <p className="mt-4 text-3xl font-bold text-green-800">
              {loading || gwa === null ? "—" : gwa.toFixed(2)}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              {loading
                ? "Loading academic records..."
                : gwa === null
                  ? "No grades available"
                  : "Estimated average assuming equal subject units"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-medium text-gray-600">
              Current Semester
            </p>

            <p className="mt-4 text-2xl font-bold text-gray-900">
              {loading ? "—" : currentSemester}
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Based on your academic records
            </p>
          </div>
        </section>

        {/* Academic Grades Table */}
        <section
          aria-labelledby="academic-grades-heading"
          className="mt-7 min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
            <p className="text-sm font-semibold text-blue-700">
              Academic Performance
            </p>

            <h2
              id="academic-grades-heading"
              className="mt-1 text-xl font-bold text-gray-900"
            >
              Academic Grades
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Your recorded grades are shown below.
            </p>
          </div>

          {loading ? (
            <div
              className="px-6 py-12 text-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-sm font-medium text-gray-600">
                Loading grades...
              </p>
            </div>
          ) : loadError ? (
            <div className="px-6 py-12 text-center" role="alert">
              <p className="font-semibold text-gray-900">
                Unable to load grades
              </p>

              <p className="mt-2 text-sm text-gray-600">
                Please refresh the page and try again.
              </p>
            </div>
          ) : grades.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-semibold text-gray-900">
                No grades found
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Your academic grades are not available yet.
              </p>
            </div>
          ) : (
            <div
              className="w-full overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700"
              tabIndex={0}
              role="region"
              aria-label="Academic grades table"
            >
              <table className="w-full min-w-125 border-collapse text-left">
                <caption className="sr-only">
                  Student academic grades by subject and semester
                </caption>

                <thead className="bg-slate-100">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-4 text-sm font-semibold text-gray-700 sm:px-6"
                    >
                      Subject
                    </th>

                    <th
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-700 sm:px-6"
                    >
                      Grade
                    </th>

                    <th
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-700 sm:px-6"
                    >
                      Semester
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {grades.map((item, index) => (
                    <tr
                      key={`${item.subject}-${index}`}
                      className="border-t border-gray-200 transition-colors hover:bg-blue-50"
                    >
                      <th
                        scope="row"
                        className="max-w-55 px-5 py-5 text-sm font-semibold text-gray-900 sm:px-6"
                      >
                        <span className="block whitespace-normal wrap-break-word">
                          {item.subject}
                        </span>
                      </th>

                      <td className="whitespace-nowrap px-5 py-5 text-base font-semibold text-blue-900 sm:px-6">
                        {item.grade.toFixed(2)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-gray-700 sm:px-6">
                        {item.semester}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !loadError && grades.length > 0 && (
            <p className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500 sm:px-6">
              Academic records are based on grades saved by the administrator.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
