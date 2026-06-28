import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { AdminMentorsView } from "@/components/dashboard/admin-mentors-view";

export const metadata = { title: "Mentor Verification — Admin" };

export default async function AdminMentorsPage() {
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

  const { data: mentorRows } = await supabase
    .from("mentors")
    .select(
      "id, profile_id, headline, current_title, current_company, years_experience, hourly_rate, currency, is_verified, is_featured, is_accepting_bookings, total_sessions, total_reviews, average_rating, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  type MentorRow = {
    id: string;
    profile_id: string;
    headline: string | null;
    current_title: string | null;
    current_company: string | null;
    years_experience: number | null;
    hourly_rate: number;
    currency: string;
    is_verified: boolean;
    is_featured: boolean;
    is_accepting_bookings: boolean;
    total_sessions: number;
    total_reviews: number;
    average_rating: number;
    created_at: string;
  };

  const rows = (mentorRows as MentorRow[] | null) || [];
  const profileIds = rows.map((m) => m.profile_id);

  const { data: profileRows } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .in("id", profileIds)
    : { data: [] };

  type ProfileRow = { id: string; full_name: string | null; email: string; avatar_url: string | null };
  const profileMap = new Map(
    ((profileRows as ProfileRow[] | null) || []).map((p) => [p.id, p])
  );

  const enriched = rows.map((m) => ({
    ...m,
    profile: profileMap.get(m.profile_id) || null,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <AdminMentorsView mentors={enriched} />
      </main>
    </div>
  );
}
