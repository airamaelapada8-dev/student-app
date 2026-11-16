"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Student = {
  full_name: string;
  student_id: string;
  program: string;
  year_section: string;
};

type Grade = {
  subject: string;
  grade: number;
  semester: string;
};

type ScheduleItem = {
  day: string;
  time: string;
  subject: string;
  room: string;
};

type Announcement = {
  id: string;
  title: string;
  date: string;
  message: string;
};

export default function Dashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendance, setAttendance] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboardData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("Logged-in email:", user?.email);

      if (!user?.email) {
        setLoading(false);
        return;
      }

      const [
        studentResult,
        gradesResult,
        scheduleResult,
        announcementsResult,
        attendanceResult,
      ] = await Promise.all([
  supabase
  .from("students")
  .select("full_name, student_id, program, year_section")
  .eq("email", user.email.trim())
  .limit(1)
  .maybeSingle(),

        supabase
          .from("grades")
          .select("subject, grade, semester")
          .eq("student_email", user.email)
          .order("subject"),

        supabase
          .from("schedule")
          .select("day, time, subject, room")
          .eq("student_email", user.email),

        supabase
          .from("announcements")
          .select("id, title, date, message"),

        supabase
          .from("attendance")
          .select("present, absent, late")
          .eq("student_email", user.email)
          .single(),
      ]);

      if (studentResult.data) {
        setStudent(studentResult.data);
      }

      if (gradesResult.data) {
        setGrades(gradesResult.data);
      }

      if (scheduleResult.data) {
        const dayOrder: Record<string, number> = {
          monday: 1,
          tuesday: 2,
          wednesday: 3,
          thursday: 4,
          friday: 5,
          saturday: 6,
          sunday: 7,
        };

        const sortedSchedule = [...scheduleResult.data].sort((a, b) => {
          const dayA = a.day.trim().toLowerCase();
          const dayB = b.day.trim().toLowerCase();

          const dayDifference =
            (dayOrder[dayA] || 99) - (dayOrder[dayB] || 99);

          if (dayDifference !== 0) {
            return dayDifference;
          }

          return getStartMinutes(a.time) - getStartMinutes(b.time);
        });

        setSchedule(sortedSchedule);
      }

      if (announcementsResult.data) {
        const sortedAnnouncements = [...announcementsResult.data].sort(
          (a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setAnnouncements(sortedAnnouncements);
        const storedReadIds = localStorage.getItem(
          "student-app-read-announcements"
        );

        const readIds: string[] = storedReadIds
          ? JSON.parse(storedReadIds)
          : [];

        const unread = sortedAnnouncements.filter(
          (announcement) => !readIds.includes(announcement.id)
        );

        setUnreadCount(unread.length);
      }

      if (attendanceResult.data) {
        const present = Number(attendanceResult.data.present || 0);
        const absent = Number(attendanceResult.data.absent || 0);
        const late = Number(attendanceResult.data.late || 0);

        const total = present + absent + late;

        setAttendance(
          total > 0 ? Math.round((present / total) * 100) : 0
        );
      }

      setLoading(false);
    }

    getDashboardData();
  }, []);

  function markAnnouncementAsRead(id: string) {
    const storedReadIds = localStorage.getItem(
      "student-app-read-announcements"
    );

    const readIds: string[] = storedReadIds
      ? JSON.parse(storedReadIds)
      : [];

    if (!readIds.includes(id)) {
      const updatedReadIds = [...readIds, id];

      localStorage.setItem(
        "student-app-read-announcements",
        JSON.stringify(updatedReadIds)
      );

      setUnreadCount((current) => Math.max(current - 1, 0));
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  const currentSemester =
    grades.length > 0 ? grades[0].semester : "No Record";

  const now = new Date();

  const currentDay = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(now);

  const currentDayNumber = getDayNumber(currentDay);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = schedule
    .filter(
      (item) =>
        item.day.trim().toLowerCase() === currentDay.toLowerCase()
    )
    .sort(
      (a, b) => getStartMinutes(a.time) - getStartMinutes(b.time)
    );

  const nextClass = findNextClass(
    schedule,
    currentDayNumber,
    currentMinutes
  );

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Welcome Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-950 via-blue-900 to-indigo-800 p-7 text-white shadow-xl md:p-9">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />

          <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
                  Student Portal
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  Welcome back, {student?.full_name || "Student"}!
                </h1>

                <p className="mt-3 text-blue-100">
                  {student?.program || "Program"} •{" "}
                  {student?.year_section || "Section"}
                </p>

                <p className="mt-1 text-sm text-blue-200">
                  Student ID: {student?.student_id || "N/A"}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <Link
                  href="/dashboard/announcements"
                  aria-label={
                    unreadCount > 0
                      ? `${unreadCount} unread announcements`
                      : "Announcements"
                  }
                  className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 21h4"
                    />
                  </svg>

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-lg ring-2 ring-blue-900">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Student Icon */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-11 w-11"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8.5 12 4l9 4.5L12 13 3 8.5Z"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.5 10.25V15c3 2.2 8 2.2 11 0v-4.75"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 9v5"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notification Message */}
        {unreadCount > 0 && (
          <Link
            href="/dashboard/announcements"
            className="mt-5 flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-4 transition hover:border-red-200 hover:bg-red-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
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
                  d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 21h4"
                />
              </svg>
            </div>

            <div className="min-w-0">
              <p className="font-bold text-red-900">
                You have {unreadCount} new{" "}
                {unreadCount === 1 ? "announcement" : "announcements"}.
              </p>

              <p className="mt-0.5 text-sm text-red-700">
                Click here to view your latest school updates.
              </p>
            </div>
          </Link>
        )}

        {/* Statistics */}
        <section className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-gray-500">
              Current Semester
            </p>

            <p className="mt-3 text-xl font-bold text-gray-900">
              {currentSemester}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-gray-500">
              Subjects
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-700">
              {grades.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-gray-500">
              Attendance
            </p>

            <p className="mt-3 text-3xl font-bold text-green-600">
              {attendance}%
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-gray-500">
              Announcements
            </p>

            <div className="mt-3 flex items-center gap-2">
              <p className="text-3xl font-bold text-blue-700">
                {announcements.length}
              </p>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              Quick Access
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Student Services
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quickly access your important student information.
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Grades */}
            <Link
              href="/dashboard/grades"
              className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-100 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 19.5V6.5A2.5 2.5 0 0 1 6.5 4H20v15H6.5A2.5 2.5 0 0 0 4 21.5"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 8h8M8 11h6"
                  />
                </svg>
              </div>

              <h3 className="mt-4 font-bold text-gray-900">
                My Grades
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View your academic grades.
              </p>

              <p className="mt-4 text-sm font-semibold text-blue-700 group-hover:text-blue-900">
                Open Grades →
              </p>
            </Link>

            {/* Schedule */}
            <Link
              href="/dashboard/schedule"
              className="group rounded-2xl border border-indigo-100 bg-indigo-50 p-5 transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-100 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-700 text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="2"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 3v4M8 3v4M3 10h18"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"
                  />
                </svg>
              </div>

              <h3 className="mt-4 font-bold text-gray-900">
                Class Schedule
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Check your class schedule.
              </p>

              <p className="mt-4 text-sm font-semibold text-indigo-700 group-hover:text-indigo-900">
                Open Schedule →
              </p>
            </Link>

            {/* Announcements */}
            <Link
              href="/dashboard/announcements"
              className="group rounded-2xl border border-violet-100 bg-violet-50 p-5 transition hover:-translate-y-1 hover:border-violet-200 hover:bg-violet-100 hover:shadow-md"
            >
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-violet-700 text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 11v2a2 2 0 0 0 2 2h2l4 4v-4h2l7 3V6l-7 3H5a2 2 0 0 0-2 2Z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 9v6"
                  />
                </svg>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-violet-50" />
                )}
              </div>

              <h3 className="mt-4 font-bold text-gray-900">
                Announcements
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Read school announcements.
              </p>

              <p className="mt-4 text-sm font-semibold text-violet-700 group-hover:text-violet-900">
                View Updates →
              </p>
            </Link>

            {/* Profile */}
            <Link
              href="/dashboard/profile"
              className="group rounded-2xl border border-sky-100 bg-sky-50 p-5 transition hover:-translate-y-1 hover:border-sky-200 hover:bg-sky-100 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="3.5" />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 20a7 7 0 0 1 14 0"
                  />
                </svg>
              </div>

              <h3 className="mt-4 font-bold text-gray-900">
                My Profile
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View your student profile.
              </p>

              <p className="mt-4 text-sm font-semibold text-sky-700 group-hover:text-sky-900">
                Open Profile →
              </p>
            </Link>
          </div>
        </section>

        {/* Daily Schedule */}
        <section className="mt-7 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Daily Schedule
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Today&apos;s Schedule
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {currentDay} • Your classes for today
              </p>
            </div>

            <Link
              href="/dashboard/schedule"
              className="w-fit text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              View Full Schedule →
            </Link>
          </div>

          {nextClass && (
            <div className="mt-5 rounded-2xl bg-linear-to-r from-blue-700 to-indigo-700 p-5 text-white shadow-md">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-100">
                    Next Class
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    {nextClass.subject}
                  </h3>

                  <p className="mt-1 text-sm text-blue-100">
                    {nextClass.day} • {nextClass.time}
                  </p>
                </div>

                <div className="w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/20">
                  {nextClass.room}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((item, index) => (
                <div
                  key={`${item.day}-${item.subject}-${index}`}
                  className="rounded-xl border border-blue-100 bg-blue-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.subject}
                      </p>

                      <p className="mt-1 text-sm font-medium text-blue-700">
                        {item.time}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                      {item.room}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-slate-50 p-5 text-center">
                <p className="font-semibold text-gray-900">
                  No classes scheduled for today.
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Enjoy your day! Check your full schedule for upcoming
                  classes.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Schedule and Announcements */}
        <section className="mt-7 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Academic Planning
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Class Schedule
                </h2>
              </div>

              <Link
                href="/dashboard/schedule"
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                View All →
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {schedule.map((item, index) => (
                <div
                  key={`${item.day}-${item.subject}-${index}`}
                  className="rounded-xl border border-gray-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.subject}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.day} • {item.time}
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      {item.room}
                    </span>
                  </div>
                </div>
              ))}

              {schedule.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-gray-500">
                  No classes available.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  School Updates
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  Latest Announcements
                </h2>
              </div>

              <Link
                href="/dashboard/announcements"
                className="text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                View All →
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {announcements.slice(0, 2).map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/dashboard/announcements/${announcement.id}`}
                  onClick={() =>
                    markAnnouncementAsRead(announcement.id)
                  }
                  className="block rounded-xl border border-gray-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {!isAnnouncementRead(announcement.id) && (
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                      )}

                      <p className="font-semibold text-gray-900">
                        {announcement.title}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      Update
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium text-blue-700">
                    {announcement.date}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                    {announcement.message}
                  </p>
                </Link>
              ))}

              {announcements.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-gray-500">
                  No announcements available.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Academic Overview */}
        <section className="mt-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Academic Records
              </p>

              <h2 className="mt-1 text-xl font-bold text-gray-900">
                Academic Overview
              </h2>
            </div>

            <Link
              href="/dashboard/grades"
              className="text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              View All Grades →
            </Link>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-125">
              <caption className="sr-only">
                Academic grade overview
              </caption>

              <thead className="border-b border-gray-200">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
                  >
                    Subject
                  </th>

                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-sm font-semibold text-gray-600"
                  >
                    Grade
                  </th>
                </tr>
              </thead>

              <tbody>
                {grades.map((item, index) => (
                  <tr
                    key={`${item.subject}-${index}`}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {item.subject}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        {item.grade}
                      </span>
                    </td>
                  </tr>
                ))}

                {grades.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No grades available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}



function isAnnouncementRead(id: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storedReadIds = localStorage.getItem(
    "student-app-read-announcements"
  );

  if (!storedReadIds) {
    return false;
  }

  try {
    const readIds: string[] = JSON.parse(storedReadIds);

    return readIds.includes(id);
  } catch {
    return false;
  }
}

function getDayNumber(day: string): number {
  const dayOrder: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  return dayOrder[day.trim().toLowerCase()] ?? 99;
}

function getStartMinutes(time: string): number {
  const firstPart = time.split("-")[0].trim();

  const match = firstPart.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)?/i
  );

  if (!match) {
    return 9999;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return hour * 60 + minute;
}

function findNextClass(
  schedule: ScheduleItem[],
  currentDayNumber: number,
  currentMinutes: number
): ScheduleItem | null {
  if (schedule.length === 0) {
    return null;
  }

  const upcomingClasses = schedule
    .map((item) => {
      const dayNumber = getDayNumber(item.day);
      const startMinutes = getStartMinutes(item.time);

      let daysUntil = dayNumber - currentDayNumber;

      if (daysUntil < 0) {
        daysUntil += 7;
      }

      if (daysUntil === 0 && startMinutes <= currentMinutes) {
        daysUntil = 7;
      }

      return {
        item,
        daysUntil,
        startMinutes,
      };
    })
    .sort((a, b) => {
      if (a.daysUntil !== b.daysUntil) {
        return a.daysUntil - b.daysUntil;
      }

      return a.startMinutes - b.startMinutes;
    });

  return upcomingClasses[0]?.item || null;
}
