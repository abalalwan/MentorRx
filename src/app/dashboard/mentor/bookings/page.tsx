import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { MentorBookingsView } from "@/components/dashboard/mentor-bookings-view";

export const metadata = { title: "My Bookings — Mentor" };

export default async function MentorBookingsPage() {
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

  if (!profile || profile.role !== "mentor") redirect("/dashboard/mentee");

  const { data: mentor } = await supabase
    .from("mentors")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!mentor) redirect("/dashboard/mentor/setup");

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, session_date, start_time, end_time, duration_minutes, status, amount, currency, payment_status, notes, created_at"
    )
    .eq("mentor_id", mentor.id)
    .order("session_date", { ascending: false })
    .limit(100);

  const bookingIds = ((bookings as Array<{ id: string }> | null) || []).map(
    (b) => b.id
  );

  // Fetch mentee profiles for each booking
  const { data: bookingMentees } = bookingIds.length
    ? await supabase
        .from("bookings")
        .select("id, mentee_id")
        .in("id", bookingIds)
    : { data: [] };

  const menteeIds = [
    ...new Set(
      ((bookingMentees as Array<{ id: string; mentee_id: string }> | null) || []).map(
        (b) => b.mentee_id
      )
    ),
  ];

  const { data: menteeProfiles } = menteeIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", menteeIds)
    : { data: [] };

  type MenteeRow = { id: string; full_name: string | null; avatar_url: string | null };
  const profileMap = new Map(
    ((menteeProfiles as MenteeRow[] | null) || []).map((p) => [p.id, p])
  );
  const menteeIdMap = new Map(
    ((bookingMentees as Array<{ id: string; mentee_id: string }> | null) || []).map(
      (b) => [b.id, b.mentee_id]
    )
  );

  type BookingRow = {
    id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    status: string;
    amount: number;
    currency: string;
    payment_status: string;
    notes: string | null;
    created_at: string;
  };

  const enrichedBookings = ((bookings as BookingRow[] | null) || []).map((b) => {
    const menteeId = menteeIdMap.get(b.id);
    const menteeProfile = menteeId ? profileMap.get(menteeId) : null;
    return {
      ...b,
      mentee: menteeProfile
        ? { full_name: menteeProfile.full_name, avatar_url: menteeProfile.avatar_url }
        : null,
    };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <MentorBookingsView bookings={enrichedBookings} />
      </main>
    </div>
  );
}
