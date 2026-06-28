import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { PayoutsView } from "@/components/dashboard/payouts-view";

export const metadata = { title: "Earnings & Payouts" };

export default async function PayoutsPage() {
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
    .select("id, currency")
    .eq("profile_id", user.id)
    .single();

  if (!mentor) redirect("/dashboard/mentor/setup");

  const { data: earnings } = await supabase
    .from("earnings")
    .select("id, gross_amount, platform_fee, net_amount, currency, status, paid_at, created_at")
    .eq("mentor_id", mentor.id)
    .order("created_at", { ascending: false });

  const { data: payouts } = await supabase
    .from("payouts")
    .select("id, amount, currency, status, payout_method, reference_id, requested_at, processed_at")
    .eq("mentor_id", mentor.id)
    .order("requested_at", { ascending: false });

  type EarningRow = {
    id: string;
    gross_amount: number;
    platform_fee: number;
    net_amount: number;
    currency: string;
    status: string;
    paid_at: string | null;
    created_at: string;
  };

  type PayoutRow = {
    id: string;
    amount: number;
    currency: string;
    status: string;
    payout_method: string;
    reference_id: string | null;
    requested_at: string;
    processed_at: string | null;
  };

  const earningsData = (earnings as EarningRow[] | null) || [];
  const payoutsData = (payouts as PayoutRow[] | null) || [];

  const totalEarned = earningsData.reduce((sum, e) => sum + e.net_amount, 0);
  const available = earningsData
    .filter((e) => e.status === "available")
    .reduce((sum, e) => sum + e.net_amount, 0);
  const pending = earningsData
    .filter((e) => e.status === "pending")
    .reduce((sum, e) => sum + e.net_amount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header profile={profile} />
      <main className="flex-1 bg-slate-50 dark:bg-slate-900/50">
        <PayoutsView
          mentorId={mentor.id}
          currency={(mentor as { id: string; currency: string }).currency}
          totalEarned={totalEarned}
          available={available}
          pending={pending}
          earnings={earningsData}
          payouts={payoutsData}
        />
      </main>
    </div>
  );
}
