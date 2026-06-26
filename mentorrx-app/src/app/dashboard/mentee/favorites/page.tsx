import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { FavoritesView } from "@/components/dashboard/favorites-view";

export const metadata = { title: "Saved Mentors" };

export default async function FavoritesPage() {
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

  if (!profile) redirect("/auth/login");

  const { data: favRows } = await supabase
    .from("favorites")
    .select("id, mentor_id, created_at")
    .eq("mentee_id", user.id)
    .order("created_at", { ascending: false });

  type FavRow = { id: string; mentor_id: string; created_at: string };
  const favs = (favRows as FavRow[] | null) || [];
  const mentorIds = favs.map((f) => f.mentor_id);

  const { data: mentorRows } = mentorIds.length
    ? await supabase
        .from("mentors")
        .select("id, profile_id, headline, hourly_rate, currency, average_rating, total_reviews, is_accepting_bookings")
        .in("id", mentorIds)
    : { data: [] };

  type MentorRow = {
    id: string;
    profile_id: string;
    headline: string | null;
    hourly_rate: number;
    currency: string;
    average_rating: number;
    total_reviews: number;
    is_accepting_bookings: boolean;
  };

  const mentorMap = new Map(
    ((mentorRows as MentorRow[] | null) || []).map((m) => [m.id, m])
  );

  const profileIds = [...new Set(((mentorRows as MentorRow[] | null) || []).map((m) => m.profile_id))];
  const { data: profileRows } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", profileIds)
    : { data: [] };

  type ProfileRow = { id: string; full_name: string | null; avatar_url: string | null };
  const profileMap = new Map(
    ((profileRows as ProfileRow[] | null) || []).map((p) => [p.id, p])
  );

  const enrichedFavorites = favs.map((fav) => {
    const mentor = mentorMap.get(fav.mentor_id);
    const mentorProfile = mentor ? profileMap.get(mentor.profile_id) : null;
    return {
      favId: fav.id,
      mentorId: fav.mentor_id,
      full_name: mentorProfile?.full_name || null,
      avatar_url: mentorProfile?.avatar_url || null,
      headline: mentor?.headline || null,
      hourly_rate: mentor?.hourly_rate || 0,
      currency: mentor?.currency || "SAR",
      average_rating: mentor?.average_rating || 0,
      total_reviews: mentor?.total_reviews || 0,
      is_accepting_bookings: mentor?.is_accepting_bookings ?? false,
    };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <FavoritesView userId={user.id} favorites={enrichedFavorites} />
      </main>
    </div>
  );
}
