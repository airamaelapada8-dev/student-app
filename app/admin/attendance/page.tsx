"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Sinusubukan ang mga table na ito, isa-isa, hanggang may makuha
const STUDENT_TABLES = ["students", "student", "profiles", "users"];

// Mga posibleng pangalan ng columns (auto-detect)
const NUMBER_KEYS = [
  "student_number",
  "student_no",
  "studentnumber",
  "student_id",
  "id_number",
  "school_id",
  "number",
];
const EMAIL_KEYS = ["email", "student_email", "email_address", "gmail"];
const NAME_KEYS = ["full_name", "fullname", "student_name", "name"];

type Row = {
  id: string;
  created_at: string;
  student_email: string;
  present: number;
  absent: number;
  late: number;
};

type Student = { number: string; email: string; name: string };

const emptyForm = { student_email: "", present: 0, absent: 0, late: 0 };

function pick(row: Record<string, unknown>, keys: string[]): string {
  const lower: Record<string, unknown> = {};
  Object.keys(row).forEach((k) => (lower[k.toLowerCase()] = row[k]));
  for (const k of keys) {
    const v = lower[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return "";
}

function toStudent(row: Record<string, unknown>): Student {
  let name = pick(row, NAME_KEYS);
  if (!name) {
    const first = pick(row, ["first_name", "firstname"]);
    const last = pick(row, ["last_name", "lastname"]);
    name = `${first} ${last}`.trim();
  }
  return {
    number: pick(row, NUMBER_KEYS),
    email: pick(row, EMAIL_KEYS),
    name,
  };
}

export default function AdminAttendancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadError, setLoadError] = useState("");
  const [studentError, setStudentError] = useState("");
  const [search, setSearch] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [showList, setShowList] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  async function load() {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setLoadError("Hindi ma-load ang attendance: " + error.message);
      return;
    }
    setLoadError("");
    setRows(data ?? []);
  }

  async function loadStudents() {
    let lastError = "";
    for (const table of STUDENT_TABLES) {
      const { data, error } = await supabase.from(table).select("*");
      if (error) {
        lastError = `${table}: ${error.message}`;
        continue;
      }
      const list = ((data ?? []) as Record<string, unknown>[])
        .map(toStudent)
        .filter((s) => s.email);
      if (list.length > 0) {
        setStudents(list);
        setStudentError("");
        return;
      }
    }
    setStudentError(
      "Walang nakuhang students. Posibleng iba ang pangalan ng table, o walang SELECT policy (RLS) sa Supabase." +
        (lastError ? ` (${lastError})` : "")
    );
  }

  useEffect(() => {
    load();
    loadStudents();
  }, []);

  // isara ang dropdown kapag nag-click sa labas
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowList(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const studentByEmail = useMemo(() => {
    const m = new Map<string, Student>();
    students.forEach((s) => m.set(s.email.toLowerCase(), s));
    return m;
  }, [students]);

  const selected = form.student_email
    ? studentByEmail.get(form.student_email.toLowerCase())
    : undefined;

  const matches = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter(
        (s) =>
          s.number.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [students, studentQuery]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const s = studentByEmail.get(r.student_email.toLowerCase());
      return (
        r.student_email.toLowerCase().includes(q) ||
        (s?.number ?? "").toLowerCase().includes(q) ||
        (s?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, studentByEmail]);

  function pickStudent(s: Student) {
    setForm({ ...form, student_email: s.email });
    setStudentQuery(s.number || s.name || s.email);
    setShowList(false);
  }

  async function save() {
    const email = form.student_email.trim();
    if (!email) return alert("Pumili muna ng estudyante (search by student number).");

    // babala kung may existing record na
    if (!editingId) {
      const existing = rows.find(
        (r) => r.student_email.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        const goEdit = confirm(
          "May attendance record na ang estudyanteng ito. I-edit na lang ang existing?\n\nOK = i-edit ang existing\nCancel = magdagdag pa rin ng bago"
        );
        if (goEdit) {
          startEdit(existing);
          return;
        }
      }
    }

    setLoading(true);
    const payload = { ...form, student_email: email };
    const { error } = editingId
      ? await supabase.from("attendance").update(payload).eq("id", editingId)
      : await supabase.from("attendance").insert(payload);
    setLoading(false);
    if (error) return alert(error.message);
    cancelEdit();
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this attendance record?")) return;
    const { error } = await supabase.from("attendance").delete().eq("id", id);
    if (error) return alert(error.message);
    load();
  }

  function startEdit(r: Row) {
    setEditingId(r.id);
    setForm({
      student_email: r.student_email,
      present: r.present,
      absent: r.absent,
      late: r.late,
    });
    const s = studentByEmail.get(r.student_email.toLowerCase());
    setStudentQuery(s?.number || r.student_email);
    setShowList(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setStudentQuery("");
    setShowList(false);
  }

  const card: React.CSSProperties = {
    background: "#fff",
    color: "#0f172a",
    borderRadius: 16,
    padding: 30,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    marginBottom: 24,
  };
  const input: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: 16,
    boxSizing: "border-box",
    color: "#0f172a",
    background: "#fff",
  };
  const btn: React.CSSProperties = {
    background: "#1e2a5e",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 22px",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
  };
  const small: React.CSSProperties = {
    ...btn,
    padding: "6px 12px",
    fontSize: 14,
    marginRight: 8,
  };
  const cell: React.CSSProperties = { padding: "16px 20px" };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "40px clamp(16px, 8vw, 160px)",
        color: "#0f172a",
      }}
    >
      <style>{`input::placeholder { color: #94a3b8; opacity: 1; }`}</style>

      <Link
        href="/admin"
        style={{ ...btn, display: "inline-block", textDecoration: "none", marginBottom: 30 }}
      >
        ← Back to Admin
      </Link>

      <h1 style={{ color: "#1e2a5e", margin: 0, fontSize: 36 }}>Student App</h1>
      <h2 style={{ margin: "10px 0 4px", color: "#0f172a" }}>Manage Attendance</h2>
      <p style={{ color: "#475569", marginBottom: 30 }}>
        Add, edit, and delete student attendance records.
      </p>

      {loadError && (
        <p style={{ color: "#b91c1c", fontWeight: 700, marginBottom: 12 }}>{loadError}</p>
      )}
      {studentError && (
        <p style={{ color: "#b91c1c", fontWeight: 700, marginBottom: 20 }}>{studentError}</p>
      )}

      {/* Add / Edit form */}
      <section style={card}>
        <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Attendance" : "Add Attendance"}</h3>

        <label style={{ fontWeight: 700 }}>Student Number</label>
        <div ref={boxRef} style={{ position: "relative", marginTop: 6, marginBottom: 16 }}>
          <input
            style={input}
            placeholder="I-type ang student number (o pangalan)"
            value={studentQuery}
            onFocus={() => setShowList(true)}
            onChange={(e) => {
              setStudentQuery(e.target.value);
              setForm({ ...form, student_email: "" });
              setShowList(true);
            }}
          />

          {showList && studentQuery.trim() && !form.student_email && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: 10,
                marginTop: 4,
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              {matches.length === 0 ? (
                <div style={{ padding: 14, color: "#64748b" }}>
                  Walang estudyanteng nahanap.
                </div>
              ) : (
                matches.map((s) => (
                  <div
                    key={s.email}
                    onClick={() => pickStudent(s)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <b>{s.number || "—"}</b> · {s.name || "No name"}
                    <div style={{ fontSize: 13, color: "#64748b" }}>{s.email}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {form.student_email && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 16,
            }}
          >
            <b>{selected?.name || "Selected student"}</b>
            {selected?.number ? ` · ${selected.number}` : ""}
            <div style={{ fontSize: 14, color: "#475569" }}>{form.student_email}</div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {(["present", "absent", "late"] as const).map((k) => (
            <div key={k}>
              <label style={{ fontWeight: 700, textTransform: "capitalize" }}>{k}</label>
              <input
                style={{ ...input, marginTop: 6 }}
                type="number"
                min={0}
                value={form[k]}
                onChange={(e) =>
                  setForm({ ...form, [k]: Math.max(0, Number(e.target.value) || 0) })
                }
              />
            </div>
          ))}
        </div>

        <button style={btn} onClick={save} disabled={loading}>
          {loading ? "Saving..." : editingId ? "Save Changes" : "Add Attendance"}
        </button>
        {editingId && (
          <button
            style={{ ...btn, background: "#64748b", marginLeft: 10 }}
            onClick={cancelEdit}
          >
            Cancel
          </button>
        )}
      </section>

      {/* Records table */}
      <section style={card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 24 }}>Attendance Records</h3>
            <p style={{ margin: "4px 0 0", color: "#475569" }}>
              {filtered.length} of {rows.length} record(s)
            </p>
          </div>
          <input
            style={{ ...input, width: 400, maxWidth: "100%" }}
            placeholder="Search by student number, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#1e3a8a", color: "#fff", textAlign: "left" }}>
                {[
                  "Created At",
                  "Student No.",
                  "Name",
                  "Email",
                  "Present",
                  "Absent",
                  "Late",
                  "Actions",
                ].map((h) => (
                  <th key={h} style={cell}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const s = studentByEmail.get(r.student_email.toLowerCase());
                return (
                  <tr key={r.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={cell}>{new Date(r.created_at).toLocaleString()}</td>
                    <td style={cell}>{s?.number || "—"}</td>
                    <td style={cell}>{s?.name || "—"}</td>
                    <td style={cell}>{r.student_email}</td>
                    <td style={cell}>{r.present}</td>
                    <td style={cell}>{r.absent}</td>
                    <td style={cell}>{r.late}</td>
                    <td style={{ ...cell, whiteSpace: "nowrap" }}>
                      <button style={small} onClick={() => startEdit(r)}>
                        Edit
                      </button>
                      <button
                        style={{ ...small, background: "#b91c1c" }}
                        onClick={() => remove(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ padding: 20, textAlign: "center", color: "#64748b" }}
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}