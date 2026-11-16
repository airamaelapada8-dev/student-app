"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Breadcrumbs from "../components/Breadcrumbs";

type ScheduleItem = {
  day: string;
  time: string;
  subject: string;
  room: string;
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchSchedule() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You are not logged in.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("schedule")
        .select("day, time, subject, room")
        .eq("student_email", user.email);

      if (error) {
        setErrorMessage("Unable to load your schedule.");
      } else {
        setSchedule(data || []);
      }

      setLoading(false);
    }

    fetchSchedule();
  }, []);

  const sortedSchedule = [...schedule].sort((a, b) => {
    const dayA = days.indexOf(a.day);
    const dayB = days.indexOf(b.day);

    if (dayA !== dayB) {
      return dayA - dayB;
    }

    return a.time.localeCompare(b.time);
  });

  const totalDays = new Set(schedule.map((item) => item.day)).size;
  const totalRooms = new Set(schedule.map((item) => item.room)).size;

  return (
    <div className="space-y-6">
      <Breadcrumbs currentPage="Schedule" />

      <div className="rounded-2xl bg-blue-700 p-6 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
            <CalendarDays size={30} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">My Schedule</h1>
            <p className="mt-1 text-sm text-blue-100">
              View your weekly class schedule.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Classes</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {schedule.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">School Days</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalDays}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Rooms</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {totalRooms}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Weekly Class Schedule
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Your current class timetable.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading schedule...
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center text-red-600">
            {errorMessage}
          </div>
        ) : schedule.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No schedule available yet.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Day
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Time
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                      Room
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedSchedule.map((item, index) => (
                    <tr
                      key={`${item.day}-${item.time}-${index}`}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                          {item.day}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-blue-600" />
                          {item.time}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        {item.subject}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          {item.room}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 p-4 md:hidden">
              {sortedSchedule.map((item, index) => (
                <div
                  key={`${item.day}-${item.time}-${index}`}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {item.day}
                    </span>

                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={15} />
                      {item.time}
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900">
                    {item.subject}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={15} />
                    {item.room}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}