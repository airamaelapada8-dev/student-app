"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        if (active) router.replace("/admin-login");
        return;
      }

      const { data, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (active) {
        if (adminError || !data) {
          await supabase.auth.signOut();
          router.replace("/");
          return;
        }

        setAuthorized(true);
        setChecking(false);
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, [router]);

  if (checking || !authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg font-semibold text-blue-950">
          Checking administrator access...
        </p>
      </main>
    );
  }

  return <>{children}</>;
}