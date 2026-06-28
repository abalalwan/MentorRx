import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { MentorDashboard } from "@/components/dashboard/mentor-dashboard";

export const metadata = { title: "Mentor Dashboard" };

export default async function MentorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "mentor") redirect("/dashboard/mentee");

  const { data: mentor } = await supabase
    .from("mentors")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (!mentor) {
    // First time mentor - redirect to profile setup
    redirect("/dashboard/mentor/setup");
  }

  // Upcoming bookings
  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select(`
      id, session_date, start_time, end_time, duration_minutes, status,
      amount, currency, payment_status,
      profiles:mentee_id(full_name, avatar_url),
      meetings(meeting_url, host_url, status, provider)
    `)
    .eq("mentor_id", mentor.id)
    .in("status", ["pending", "confirmed"])
    .gte("session_date", new Date().toISOString().split("T")[0])
    .order("start_time")
    .limit(10);

  // Earnings summary
  const { data: earnings } = await supabase
    .from("earnings")
    .select("net_amount, currency, status, created_at")
    .eq("mentor_id", mentor.id)
    .order("created_at", { ascending: false });

  const totalEarnings = (earnings || []).reduce((sum, e) => sum + e.net_amount, 0);
  const availableEarnings = (earnings || [])
    .filter((e) => e.status === "available")
    .reduce((sum, e) => sum + e.net_amount, 0);

  // Recent reviews
  const { data: recentReviews } = await supabase
    .from("reviews")
    .select(`
      id, rating, comment, created_at,
      profiles:mentee_id(full_name, avatar_url)
    `)
    .eq("mentor_id", mentor.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(5);

  // Stats
  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("mentor_id", mentor.id);

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} unreadCount={unreadCount || 0} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <MentorDashboard
          profile={profile}
          mentor={mentor}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          upcomingBookings={(upcomingBookings || []) as any}
          totalEarnings={totalEarnings}
          availableEarnings={availableEarnings}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recentReviews={(recentReviews || []) as any}
          totalBookings={totalBookings || 0}
        />
      </main>
    </div>
  );
}
