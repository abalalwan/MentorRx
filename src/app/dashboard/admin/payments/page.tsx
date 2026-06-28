import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { AdminPaymentsView } from "@/components/dashboard/admin-payments-view";

export const metadata = { title: "Payment Tracking — Admin" };

export default async function AdminPaymentsPage() {
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

  const { data: payments } = await supabase
    .from("payments")
    .select("id, booking_id, amount, currency, status, provider, provider_payment_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: payouts } = await supabase
    .from("payouts")
    .select("id, mentor_id, amount, currency, status, payout_method, requested_at, processed_at")
    .order("requested_at", { ascending: false })
    .limit(100);

  type PaymentRow = {
    id: string;
    booking_id: string;
    amount: number;
    currency: string;
    status: string;
    provider: string;
    provider_payment_id: string | null;
    created_at: string;
  };

  type PayoutRow = {
    id: string;
    mentor_id: string;
    amount: number;
    currency: string;
    status: string;
    payout_method: string;
    requested_at: string;
    processed_at: string | null;
  };

  // Fetch mentor names for payouts
  const mentorIds = [...new Set(((payouts as PayoutRow[] | null) || []).map((p) => p.mentor_id))];
  const { data: mentorRows } = mentorIds.length
    ? await supabase.from("mentors").select("id, profile_id").in("id", mentorIds)
    : { data: [] };

  type MentorMin = { id: string; profile_id: string };
  const mentorProfileIds = ((mentorRows as MentorMin[] | null) || []).map((m) => m.profile_id);
  const { data: profileRows } = mentorProfileIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", mentorProfileIds)
    : { data: [] };

  type ProfileMin = { id: string; full_name: string | null };
  const profileMap = new Map(((profileRows as ProfileMin[] | null) || []).map((p) => [p.id, p.full_name]));
  const mentorProfileMap = new Map(((mentorRows as MentorMin[] | null) || []).map((m) => [m.id, m.profile_id]));

  const enrichedPayouts = ((payouts as PayoutRow[] | null) || []).map((p) => ({
    ...p,
    mentor_name: profileMap.get(mentorProfileMap.get(p.mentor_id) || "") || null,
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <AdminPaymentsView
          payments={(payments as PaymentRow[] | null) || []}
          payouts={enrichedPayouts}
        />
      </main>
    </div>
  );
}
