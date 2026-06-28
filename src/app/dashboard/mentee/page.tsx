import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { MenteeDashboard } from "@/components/dashboard/mentee-dashboard";

export const metadata = {
  title: "My Dashboard",
};

export default async function MenteeDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/auth/login");
  if (profile.role === "mentor") redirect("/dashboard/mentor");
  if (profile.role === "admin") redirect("/dashboard/admin");

  // Upcoming bookings
  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select(`
      id, session_date, start_time, end_time, duration_minutes,
      status, amount, currency, payment_status,
      mentors:mentor_id(
        id,
        profiles:profile_id(full_name, avatar_url, country)
      ),
      meetings(meeting_url, status, provider)
    `)
    .eq("mentee_id", user.id)
    .in("status", ["pending", "confirmed"])
    .gte("session_date", new Date().toISOString().split("T")[0])
    .order("start_time")
    .limit(5);

  // Past bookings
  const { data: pastBookings } = await supabase
    .from("bookings")
    .select(`
      id, session_date, start_time, duration_minutes, status, amount, currency,
      mentors:mentor_id(
        id,
        profiles:profile_id(full_name, avatar_url)
      ),
      reviews(id)
    `)
    .eq("mentee_id", user.id)
    .in("status", ["completed", "cancelled"])
    .order("start_time", { ascending: false })
    .limit(10);

  // Favorites
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      id, mentor_id,
      mentors(
        id, hourly_rate, currency, average_rating,
        profiles:profile_id(full_name, avatar_url, country)
      )
    `)
    .eq("mentee_id", user.id)
    .limit(6);

  // Notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} unreadCount={unreadCount || 0} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <MenteeDashboard
          profile={profile}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          upcomingBookings={(upcomingBookings || []) as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pastBookings={(pastBookings || []) as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          favorites={(favorites || []) as any}
          notifications={notifications || []}
        />
      </main>
    </div>
  );
}
