"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Breadcrumbs from "../components/Breadcrumbs";

type Student = {
  email: string;
  student_id: string;
  full_name: string;
  program: string;
  year_section: string;
  status: string;
  avatar_url: string | null;
};

export default function Profile() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    async function getStudent() {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        setErrorMessage("You are not logged in.");
        setLoading(false);
        return;
      }
const { data, error } = await supabase
  .from("students")
  .select(
    "email, student_id, full_name, program, year_section, status, avatar_url"
  )
  .eq("email", user.email)
  .limit(1)
  .maybeSingle();
      if (error) {
        console.error("Student query error:", error);
        setErrorMessage(`Unable to load profile: ${error.message}`);
      } else if (!data) {
        setErrorMessage(
          `Student information not found for: ${user.email}`
        );
      } else {
        setStudent(data);
      }

      setLoading(false);
    }

    getStudent();
  }, []);

  const initials =
    student?.full_name
      ?.split(" ")
      .map((name) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  async function handleProfilePictureChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !student) {
      return;
    }

    setMessage("");
    setErrorMessage("");

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be smaller than 5 MB.");
      return;
    }

    try {
      setUploading(true);

      const fileExtension = file.name.split(".").pop() || "jpg";

      const safeStudentId = student.student_id.replace(
        /[^a-zA-Z0-9_-]/g,
        "_"
      );

      const filePath = `${safeStudentId}-${Date.now()}.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setErrorMessage("Unable to upload the picture.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from("students")
        .update({
          avatar_url: publicUrl,
        })
        .eq("email", student.email);

      if (updateError) {
        console.error("Profile update error:", updateError);
        setErrorMessage("Picture uploaded, but profile could not be updated.");
        return;
      }

      setStudent({
        ...student,
        avatar_url: publicUrl,
      });

      setMessage("Profile picture updated successfully.");
    } catch (error) {
      console.error("Unexpected upload error:", error);
      setErrorMessage("Something went wrong while uploading the picture.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-6xl">
        <Breadcrumbs currentPage="Profile" />

        <div className="mt-6 rounded-2xl bg-blue-700 p-6 text-white shadow-sm">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="mt-1 text-sm text-blue-100">
            View your student information and profile details.
          </p>
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
            <p className="mt-4 text-sm text-gray-500">
              Loading profile...
            </p>
          </div>
        ) : student ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative">
                  {student.avatar_url ? (
                    <Image
                      src={student.avatar_url}
                      alt="Profile picture"
                      width={96}
                      height={96}
                      unoptimized
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-50"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-700 text-2xl font-bold text-white ring-4 ring-blue-50">
                      {initials}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-700 text-white shadow-sm hover:bg-blue-800 disabled:opacity-50"
                  >
                    ✎
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-700">
                    Student Information
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    {student.full_name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {student.program} • {student.year_section}
                  </p>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading..."
                      : student.avatar_url
                        ? "Change Photo"
                        : "Add Profile Photo"}
                  </button>

                  {message && (
                    <p className="mt-2 text-sm text-green-600">{message}</p>
                  )}

                  {errorMessage && (
                    <p className="mt-2 text-sm text-red-600">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  {student.status}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Student Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your registered student information.
                </p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-gray-900">
                    {student.email}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Student ID
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {student.student_id}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Full Name
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {student.full_name}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Program
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {student.program}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Year & Section
                  </p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {student.year_section}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase text-gray-400">
                    Status
                  </p>
                  <p className="mt-2 text-sm font-semibold text-green-600">
                    {student.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">
              Student information not found
            </p>

            {errorMessage && (
              <p className="mt-2 break-all text-sm text-red-600">
                {errorMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}