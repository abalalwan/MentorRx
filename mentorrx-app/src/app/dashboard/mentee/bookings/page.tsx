import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { MenteeBookingsView } from "@/components/dashboard/mentee-bookings-view";

export const metadata = { title: "My Sessions" };

export default async function MenteeBookingsPage() {
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

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, mentor_id, session_date, start_time, end_time, duration_minutes, status, amount, currency, payment_status, notes, created_at"
    )
    .eq("mentee_id", user.id)
    .order("session_date", { ascending: false })
    .limit(100);

  type BookingRow = {
    id: string;
    mentor_id: string;
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

  const bookingRows = (bookings as BookingRow[] | null) || [];
  const mentorIds = [...new Set(bookingRows.map((b) => b.mentor_id))];

  // Fetch mentor profiles
  const { data: mentorRows } = mentorIds.length
    ? await supabase
        .from("mentors")
        .select("id, profile_id, headline")
        .in("id", mentorIds)
    : { data: [] };

  type MentorRow = { id: string; profile_id: string; headline: string | null };
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

  // Fetch meetings for each booking
  const bookingIds = bookingRows.map((b) => b.id);
  const { data: meetingRows } = bookingIds.length
    ? await supabase
        .from("meetings")
        .select("booking_id, meeting_url, status")
        .in("booking_id", bookingIds)
    : { data: [] };

  type MeetingRow = { booking_id: string; meeting_url: string; status: string };
  const meetingMap = new Map(
    ((meetingRows as MeetingRow[] | null) || []).map((m) => [m.booking_id, m])
  );

  // Check which bookings have reviews
  const { data: reviewRows } = bookingIds.length
    ? await supabase
        .from("reviews")
        .select("booking_id")
        .in("booking_id", bookingIds)
    : { data: [] };

  const reviewedBookingIds = new Set(
    ((reviewRows as Array<{ booking_id: string }> | null) || []).map((r) => r.booking_id)
  );

  const enriched = bookingRows.map((b) => {
    const mentorRow = mentorMap.get(b.mentor_id);
    const mentorProfile = mentorRow ? profileMap.get(mentorRow.profile_id) : null;
    const meeting = meetingMap.get(b.id);
    return {
      ...b,
      mentor: mentorProfile
        ? { full_name: mentorProfile.full_name, avatar_url: mentorProfile.avatar_url, headline: mentorRow?.headline || null }
        : null,
      meeting_url: meeting?.meeting_url || null,
      has_review: reviewedBookingIds.has(b.id),
    };
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <MenteeBookingsView bookings={enriched} />
      </main>
    </div>
  );
}
