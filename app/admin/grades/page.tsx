"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
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

type StudentOption = {
  email: string;
  student_id: string | null;
};

type FormState = {
  student_email: string;
  subject: string;
  grade: string;
  semester: string;
};

const emptyForm: FormState = {
  student_email: "",
  subject: "",
  grade: "",
  semester: "",
};

export default function ManageGradesPage() {
  const [grades, setGrades] = useState<GradeWithStudentId[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageIsError, setMessageIsError] = useState(false);

  const loadGrades = useCallback(async () => {
    const { data: gradeData, error: gradeError } = await supabase
      .from("grades")
      .select("*");

    if (gradeError) {
      setError(gradeError.message);
      setLoading(false);
      return;
    }

    const records = gradeData ?? [];

    const { data: allStudents, error: studentError } = await supabase
      .from("students")
      .select("email, student_id");

    if (studentError) {
      setError(studentError.message);
      setLoading(false);
      return;
    }

    const studentList: StudentOption[] = (allStudents ?? []).filter(
      (student) => typeof student.email === "string"
    );

    setStudents(studentList);

    const updatedGrades: GradeWithStudentId[] = records.map((item) => {
      const email =
        typeof item.student_email === "string"
          ? item.student_email.trim().toLowerCase()
          : "";

      const student = studentList.find(
        (entry) => entry.email.trim().toLowerCase() === email
      );

      return {
        ...item,
        displayStudentId: student?.student_id ?? "",
      };
    });

    setError("");
    setGrades(updatedGrades);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(item: GradeWithStudentId) {
    if (item.id === undefined) {
      setMessageIsError(true);
      setMessage(
        "This record has no id column yet. Run the SQL that adds the id column first."
      );
      return;
    }

    setEditingId(item.id);
    setForm({
      student_email: item.student_email ?? "",
      subject: item.subject ?? "",
      grade: String(item.grade ?? ""),
      semester: item.semester ?? "",
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

    const email = form.student_email.trim().toLowerCase();
    const subject = form.subject.trim();
    const semester = form.semester.trim();
    const gradeNumber = Number(form.grade);

    if (!email || !subject || !semester || form.grade.trim() === "") {
      setMessageIsError(true);
      setMessage("Please fill out all fields.");
      return;
    }

    if (!Number.isFinite(gradeNumber)) {
      setMessageIsError(true);
      setMessage("Grade must be a number.");
      return;
    }

    setSaving(true);

    const payload = {
      student_email: email,
      subject,
      grade: gradeNumber,
      semester,
    };

    const { error: saveError } =
      editingId !== null
        ? await supabase.from("grades").update(payload).eq("id", editingId)
        : await supabase.from("grades").insert(payload);

    if (saveError) {
      console.error("Save grade error:", saveError);
      setMessageIsError(true);
      setMessage(`Unable to save: ${saveError.message}`);
    } else {
      setMessage(editingId !== null ? "Grade updated." : "Grade added.");
      setEditingId(null);
      setForm(emptyForm);
      await loadGrades();
    }

    setSaving(false);
  }

  async function handleDelete(item: GradeWithStudentId) {
    if (item.id === undefined) {
      setMessageIsError(true);
      setMessage(
        "This record has no id column yet. Run the SQL that adds the id column first."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete the ${item.subject} grade of ${item.student_email}?`
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("grades")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      console.error("Delete grade error:", deleteError);
      setMessageIsError(true);
      setMessage(`Unable to delete: ${deleteError.message}`);
      return;
    }

    setMessageIsError(false);
    setMessage("Grade deleted.");
    await loadGrades();
  }

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
              Add, edit, and search student grades.
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

        {/* Add / Edit Form */}
        <section className="mb-6 rounded-xl bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {editingId !== null ? "Edit Grade" : "Add Grade"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label
                htmlFor="student_email"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Student Email
              </label>
              <input
                id="student_email"
                type="email"
                list="student-emails"
                value={form.student_email}
                onChange={(e) => updateField("student_email", e.target.value)}
                placeholder="Type or choose a student email"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
              <datalist id="student-emails">
                {students.map((student) => (
                  <option key={student.email} value={student.email}>
                    {student.student_id ?? ""}
                  </option>
                ))}
              </datalist>
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
                placeholder="e.g. Software Development"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="grade"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Grade
              </label>
              <input
                id="grade"
                type="number"
                step="0.01"
                value={form.grade}
                onChange={(e) => updateField("grade", e.target.value)}
                placeholder="e.g. 1.75"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="semester"
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                Semester
              </label>
              <input
                id="semester"
                type="text"
                value={form.semester}
                onChange={(e) => updateField("semester", e.target.value)}
                placeholder="e.g. 1st Semester 2026-2027"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
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
                    ? "Update Grade"
                    : "Add Grade"}
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
                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGrades.map((item, index) => (
                    <tr
                      key={
                        item.id !== undefined
                          ? String(item.id)
                          : `${item.student_email ?? "student"}-${item.subject}-${index}`
                      }
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