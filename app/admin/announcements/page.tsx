"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Announcement = {
  id: number;
  title: string;
  message: string;
  created_at: string | null;
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAnnouncements = useCallback(async () => {
    setError("");

    const { data, error: fetchError } = await supabase
      .from("announcements")
      .select("id, title, message, created_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(`Unable to load announcements: ${fetchError.message}`);
      setAnnouncements([]);
    } else {
      setAnnouncements((data ?? []) as Announcement[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialAnnouncements() {
      const { data, error: fetchError } = await supabase
        .from("announcements")
        .select("id, title, message, created_at")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (fetchError) {
        setError(`Unable to load announcements: ${fetchError.message}`);
        setAnnouncements([]);
      } else {
        setAnnouncements((data ?? []) as Announcement[]);
      }

      setLoading(false);
    }

    loadInitialAnnouncements();

    return () => {
      cancelled = true;
    };
  }, []);

  async function publishAnnouncement(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle || !cleanMessage) {
      setError("Please enter both a title and a message.");
      return;
    }

    setPublishing(true);
    setError("");
    setSuccess("");

    const { error: insertError } = await supabase
      .from("announcements")
      .insert({
        title: cleanTitle,
        message: cleanMessage,
      });

    if (insertError) {
      setError(`Unable to publish announcement: ${insertError.message}`);
    } else {
      setTitle("");
      setMessage("");
      setSuccess("Announcement published successfully!");
      await loadAnnouncements();
    }

    setPublishing(false);
  }

  async function deleteAnnouncement(announcement: Announcement) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(announcement.id);
    setError("");
    setSuccess("");

    const { data, error: deleteError } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcement.id)
      .select("id");

    if (deleteError) {
      setError(`Unable to delete announcement: ${deleteError.message}`);
    } else if (!data || data.length === 0) {
      setError(
        "The announcement was not deleted. Check your Supabase DELETE policy and permissions."
      );
    } else {
      setAnnouncements((current) =>
        current.filter((item) => item.id !== announcement.id)
      );

      setSuccess("Announcement deleted successfully!");
    }

    setDeletingId(null);
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-5xl">
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
            Manage Announcements
          </h2>

          <p className="mt-2 text-slate-600">
            Create, view, and delete announcements for students.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-5 wrap-break-word rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
          >
            {success}
          </div>
        )}

        <section className="mb-8 rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <h3 className="mb-5 text-xl font-semibold">
            Create Announcement
          </h3>

          <form onSubmit={publishAnnouncement} className="space-y-4">
            <div>
              <label
                htmlFor="announcement-title"
                className="mb-1 block font-medium"
              >
                Title
              </label>

              <input
                id="announcement-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={150}
                required
                placeholder="Enter announcement title"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="announcement-message"
                className="mb-1 block font-medium"
              >
                Message
              </label>

              <textarea
                id="announcement-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={5}
                required
                placeholder="Write your announcement here..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {publishing
                ? "Publishing..."
                : "Publish Announcement"}
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Published Announcements
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                {announcements.length} total
              </p>
            </div>

            <button
              type="button"
              onClick={loadAnnouncements}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-6 text-center text-slate-600">
              Loading announcements...
            </p>
          ) : announcements.length === 0 ? (
            <p className="rounded-lg bg-slate-50 p-6 text-center text-slate-600">
              No announcements published yet.
            </p>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="wrap-break-word text-lg font-semibold text-blue-950">
                        {announcement.title}
                      </h4>

                      <p className="mt-2 whitespace-pre-wrap wrap-break-word text-slate-700">
                        {announcement.message}
                      </p>

                      {announcement.created_at && (
                        <p className="mt-3 text-sm text-slate-500">
                          Published:{" "}
                          {new Date(
                            announcement.created_at
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        deleteAnnouncement(announcement)
                      }
                      disabled={deletingId === announcement.id}
                      className="shrink-0 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === announcement.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}