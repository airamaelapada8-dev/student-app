"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Breadcrumbs from "../components/Breadcrumbs";

type AttendanceData = {
  present: number;
  absent: number;
  late: number;
};

export default function Attendance() {
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function getAttendance() {
      try {
        setLoading(true);
        setErrorMessage("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Authentication error:", authError.message);

          if (isMounted) {
            setErrorMessage(
              "Unable to verify your account. Please log in again."
            );
          }
          return;
        }

        if (!user?.email) {
          if (isMounted) {
            setErrorMessage("No signed-in student account was found.");
          }
          return;
        }

        console.log("SIGNED-IN USER:", user.email);

        const { data, error } = await supabase
          .from("attendance")
          .select("present, absent, late")
          .eq("student_email", user.email)
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Attendance query error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });

          if (isMounted) {
            setErrorMessage(
              error.message || "Unable to load attendance records."
            );
          }
          return;
        }

        if (!data) {
          if (isMounted) {
            setAttendance(null);
            setErrorMessage(
              "No attendance record was found for your account."
            );
          }
          return;
        }

        if (isMounted) {
          setAttendance({
            present: Number(data.present) || 0,
            absent: Number(data.absent) || 0,
            late: Number(data.late) || 0,
          });
        }
      } catch (error) {
        console.error("Unexpected attendance error:", error);

        if (isMounted) {
          setErrorMessage(
            "Something went wrong while loading your attendance."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    getAttendance();

    return () => {
      isMounted = false;
    };
  }, []);

  const total = attendance
    ? attendance.present + attendance.absent + attendance.late
    : 0;

  const attendanceRate =
    attendance && total > 0
      ? Math.round((attendance.present / total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 text-gray-800 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs currentPage="Attendance" />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-2 text-gray-600">
            View your attendance records and attendance summary.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="text-gray-600">Loading attendance records...</p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-700">
              Unable to load attendance
            </h2>
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          </div>
        ) : attendance ? (
          <>
            <div className="mb-6 rounded-xl bg-blue-900 p-6 text-white shadow-sm">
              <p className="text-sm font-medium text-blue-100">
                Overall Attendance Rate
              </p>

              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-bold">
                  {attendanceRate}%
                </span>
                <span className="mb-1 text-blue-100">
                  Attendance rate
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-blue-700">
                <div
                  className="h-full rounded-full bg-green-400 transition-all"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-blue-100">
                Based on {total} recorded attendance entries.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Present</p>
                <p className="mt-3 text-3xl font-bold text-green-600">
                  {attendance.present}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Classes attended
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Absent</p>
                <p className="mt-3 text-3xl font-bold text-red-600">
                  {attendance.absent}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Classes missed
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Late</p>
                <p className="mt-3 text-3xl font-bold text-yellow-600">
                  {attendance.late}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Late arrivals
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Attendance Summary
              </h2>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Total Records</span>
                  <span className="font-semibold text-gray-900">
                    {total}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Present</span>
                  <span className="font-semibold text-green-600">
                    {attendance.present}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <span className="text-gray-600">Absent</span>
                  <span className="font-semibold text-red-600">
                    {attendance.absent}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Late</span>
                  <span className="font-semibold text-yellow-600">
                    {attendance.late}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}