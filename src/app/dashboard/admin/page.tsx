import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { AdminDashboard, type AdminDashboardProps } from "@/components/dashboard/admin-dashboard";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/dashboard/mentee");

  // Platform stats
  const [
    { count: totalUsers },
    { count: totalMentors },
    { count: totalBookings },
    { count: pendingMentors },
    { data: recentBookings },
    { data: recentPayments },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("mentors").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("mentors").select("*", { count: "exact", head: true }).eq("is_verified", false),
    supabase
      .from("bookings")
      .select(`
        id, status, amount, currency, created_at, session_date,
        mentors:mentor_id(profiles:profile_id(full_name)),
        profiles:mentee_id(full_name)
      `)
      .order("created_at", { ascending: false })
      .limit(10) as unknown as Promise<{ data: AdminDashboardProps["recentBookings"] | null; error: unknown }>,
    supabase
      .from("payments")
      .select("id, amount, currency, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  // Revenue stats
  const { data: completedPayments } = await supabase
    .from("payments")
    .select("amount, platform_fee")
    .eq("status", "completed");

  const totalRevenue = (completedPayments || []).reduce((sum, p) => sum + p.amount, 0);
  const platformRevenue = (completedPayments || []).reduce((sum, p) => sum + p.platform_fee, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <AdminDashboard
          profile={profile}
          stats={{
            totalUsers: totalUsers || 0,
            totalMentors: totalMentors || 0,
            totalBookings: totalBookings || 0,
            pendingMentors: pendingMentors || 0,
            totalRevenue,
            platformRevenue,
          }}
          recentBookings={recentBookings || []}
          recentPayments={recentPayments || []}
        />
      </main>
    </div>
  );
}
