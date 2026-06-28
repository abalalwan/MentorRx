import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { AdminUsersView } from "@/components/dashboard/admin-users-view";

export const metadata = { title: "User Management — Admin" };

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/dashboard/mentee");

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, avatar_url, is_active, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  type UserRow = {
    id: string;
    full_name: string | null;
    email: string;
    role: string;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <AdminUsersView users={(users as UserRow[] | null) || []} />
      </main>
    </div>
  );
}
