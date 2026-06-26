import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { AdminBookingsView } from "@/components/dashboard/admin-bookings-view";

export const metadata = { title: "All Bookings — Admin" };

export default async function AdminBookingsPage() {
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

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, mentor_id, mentee_id, session_date, start_time, end_time, duration_minutes, status, amount, currency, payment_status, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  type BookingRow = {
    id: string;
    mentor_id: string;
    mentee_id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    status: string;
    amount: number;
    currency: string;
    payment_status: string;
    created_at: string;
  };

  const rows = (bookings as BookingRow[] | null) || [];
  const allProfileIds = [...new Set([...rows.map((b) => b.mentor_id), ...rows.map((b) => b.mentee_id)])];

  // Get mentor profile_ids first
  const mentorIds = [...new Set(rows.map((b) => b.mentor_id))];
  const { data: mentorRows } = mentorIds.length
    ? await supabase.from("mentors").select("id, profile_id").in("id", mentorIds)
    : { data: [] };

  type MentorMinRow = { id: string; profile_id: string };
  const mentorProfileMap = new Map(
    ((mentorRows as MentorMinRow[] | null) || []).map((m) => [m.id, m.profile_id])
  );

  const mentorProfileIds = ((mentorRows as MentorMinRow[] | null) || []).map((m) => m.profile_id);
  const menteeIds = [...new Set(rows.map((b) => b.mentee_id))];
  const allIds = [...new Set([...mentorProfileIds, ...menteeIds])];

  const { data: profileRows } = allIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", allIds)
    : { data: [] };

  type ProfileMin = { id: string; full_name: string | null };
  const profileMap = new Map(
    ((profileRows as ProfileMin[] | null) || []).map((p) => [p.id, p.full_name])
  );

  const enriched = rows.map((b) => ({
    ...b,
    mentor_name: profileMap.get(mentorProfileMap.get(b.mentor_id) || "") || null,
    mentee_name: profileMap.get(b.mentee_id) || null,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <AdminBookingsView bookings={enriched} />
      </main>
    </div>
  );
}
