"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Schedule = {
  id: string | number;
  day: string;
  time: string;
  subject: string;
  room: string;
};

type FormState = {
  day: string;
  time: string;
  subject: string;
  room: string;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "TBA",
];

const emptyForm: FormState = { day: "Monday", time: "", subject: "", room: "" };

const TABLE_CHOICES = ["schedule", "schedules"];

const inputClass =
  "w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200";

export default function ManageSchedulePage() {
  const [items, setItems] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  // alin sa "schedule" o "schedules" ang tamang table
  const tableRef = useRef<string>(TABLE_CHOICES[0]);

  const loadData = useCallback(async () => {
    let lastError = "";

    for (const table of TABLE_CHOICES) {
      const { data, error: loadError } = await supabase
        .from(table)
        .select("*");

      if (loadError) {
        lastError = loadError.message;
        continue;
      }

      tableRef.current = table;
      setItems((data ?? []) as Schedule[]);
      setError("");
      setLoading(false);
      return;
    }

    setError(lastError || "Hindi makita ang schedule table.");
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(item: Schedule) {
    setEditingId(item.id);
    setForm({
      day: item.day ?? "Monday",
      time: item.time ?? "",
      subject: item.subject ?? "",
      room: item.room ?? "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setMessageIsError(false);

    const payload = {
      day: form.day.trim(),
      time: form.time.trim(),
      subject: form.subject.trim(),
      room: form.room.trim(),
    };

    if (!payload.day || !payload.time || !payload.subject || !payload.room) {
      setMessageIsError(true);
      setMessage("Please fill out all fields.");
      return;
    }

    setSaving(true);

    const table = tableRef.current;
    const { error: saveError } =
      editingId !== null
        ? await supabase.from(table).update(payload).eq("id", editingId)
        : await supabase.from(table).insert(payload);

    if (saveError) {
      console.error("Save schedule error:", saveError);
      setMessageIsError(true);
      setMessage(`Unable to save: ${saveError.message}`);
    } else {
      setMessage(editingId !== null ? "Schedule updated." : "Schedule added.");
      setEditingId(null);
      setForm(emptyForm);
      await loadData();
    }

    setSaving(false);
  }

  async function handleDelete(item: Schedule) {
    const confirmed = window.confirm(
      `Delete ${item.subject} (${item.day}, ${item.time})?`
    );
    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from(tableRef.current)
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      console.error("Delete schedule error:", deleteError);
      setMessageIsError(true);
      setMessage(`Unable to delete: ${deleteError.message}`);
      return;
    }

    setMessageIsError(false);
    setMessage("Schedule deleted.");
    await loadData();
  }

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (item.day ?? "").toLowerCase().includes(q) ||
      (item.time ?? "").toLowerCase().includes(q) ||
      (item.subject ?? "").toLowerCase().includes(q) ||
      (item.room ?? "").toLowerCase().includes(q)
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
              Add, edit, and search class schedules.
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
              {items.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Matching Schedules</p>
            <p className="mt-2 text-3xl font-bold text-blue-800">
              {filtered.length}
            </p>
          </div>
        </section>

        {/* Add / Edit Form */}
        <section className="mb-6 rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {editingId !== null ? "Edit Schedule" : "Add Schedule"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="day"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Day
              </label>
              <select
                id="day"
                value={form.day}
                onChange={(e) => updateField("day", e.target.value)}
                className={inputClass}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="time"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Time
              </label>
              <input
                id="time"
                type="text"
                value={form.time}
                onChange={(e) => updateField("time", e.target.value)}
                placeholder="e.g. 8:00 AM - 10:00 AM"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={form.subject}
                onChange={(e) => updateField("subject", e.target.value)}
                placeholder="e.g. Web Development"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="room"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Room
              </label>
              <input
                id="room"
                type="text"
                value={form.room}
                onChange={(e) => updateField("room", e.target.value)}
                placeholder="e.g. Room 101"
                className={inputClass}
              />
            </div>

            {message && (
              <div
                role="alert"
                className={`rounded-lg border p-3 text-sm sm:col-span-2 ${
                  messageIsError
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-green-200 bg-green-50 text-green-800"
                }`}
              >
                {message}
              </div>
            )}

            <div className="flex gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-950 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Schedule"
                    : "Add Schedule"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-950 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Search + Table */}
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search day, time, subject, or room..."
            className={`${inputClass} mb-5`}
          />

          {loading ? (
            <p className="py-8 text-center text-slate-600">
              Loading schedules...
            </p>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              <p className="font-semibold">Unable to load schedules.</p>
              <p className="mt-1 break-words text-sm">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-slate-600">
              No schedules found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {["Day", "Time", "Subject", "Room"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        {h}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item) => (
                    <tr
                      key={String(item.id)}
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
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="mr-4 font-semibold text-blue-700 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="font-semibold text-red-600 hover:underline"
                        >
                          Delete
                        </button>
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