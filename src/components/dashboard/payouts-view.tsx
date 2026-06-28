"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Earning = {
  id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  currency: string;
  status: string;
  paid_at: string | null;
  created_at: string;
};

type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payout_method: string;
  reference_id: string | null;
  requested_at: string;
  processed_at: string | null;
};

interface PayoutsViewProps {
  mentorId: string;
  currency: string;
  totalEarned: number;
  available: number;
  pending: number;
  earnings: Earning[];
  payouts: Payout[];
}

const STATUS_BADGE: Record<string, string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function PayoutsView({
  mentorId,
  currency,
  totalEarned,
  available,
  pending,
  earnings,
  payouts: initialPayouts,
}: PayoutsViewProps) {
  const [payouts, setPayouts] = useState(initialPayouts);
  const [requesting, setRequesting] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState("bank_transfer");
  const [payoutError, setPayoutError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [tab, setTab] = useState<"earnings" | "payouts">("earnings");

  const handleRequestPayout = async () => {
    if (available <= 0) return;
    setRequesting(true);
    setPayoutError(null);

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from("payouts") as any)
      .insert({
        mentor_id: mentorId,
        amount: available,
        currency,
        status: "pending",
        payout_method: payoutMethod,
      })
      .select("id, amount, currency, status, payout_method, reference_id, requested_at, processed_at")
      .single();

    if (error) {
      setPayoutError(error.message);
    } else if (data) {
      setPayouts((prev) => [data, ...prev]);
      setPayoutSuccess(true);
      setTimeout(() => setPayoutSuccess(false), 3000);
    }
    setRequesting(false);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-2">Earnings & Payouts</h1>
      <p className="text-[var(--muted-foreground)] mb-8">Track your earnings and request withdrawals.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Earned", value: totalEarned, icon: TrendingUp, color: "text-blue-600" },
          { label: "Available", value: available, icon: DollarSign, color: "text-green-600" },
          { label: "Pending Clearance", value: pending, icon: Clock, color: "text-yellow-600" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(stat.value, currency)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Request Payout */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
        </CardHeader>
        <CardContent>
          {payoutError && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-sm">{payoutError}</p>
            </div>
          )}
          {payoutSuccess && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-700 mb-4">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-sm">Payout request submitted successfully!</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Payout Method</p>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="wise">Wise</option>
              </select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Available Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(available, currency)}</p>
            </div>
            <Button
              variant="premium"
              onClick={handleRequestPayout}
              loading={requesting}
              disabled={available <= 0}
            >
              Request Withdrawal
            </Button>
          </div>
          {available <= 0 && (
            <p className="text-xs text-[var(--muted-foreground)] mt-3">
              No available balance. Earnings are available 7 days after session completion.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-[var(--border)]">
        {(["earnings", "payouts"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize -mb-px border-b-2 transition-colors ${
              tab === t
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "earnings" && (
        <div className="space-y-3">
          {earnings.length === 0 ? (
            <p className="text-center py-10 text-[var(--muted-foreground)]">No earnings yet.</p>
          ) : (
            earnings.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(e.net_amount, e.currency)}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Gross: {formatCurrency(e.gross_amount, e.currency)} · Fee: {formatCurrency(e.platform_fee, e.currency)}
                      · {formatDate(e.created_at)}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[e.status] || STATUS_BADGE.pending}`}
                  >
                    {e.status}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "payouts" && (
        <div className="space-y-3">
          {payouts.length === 0 ? (
            <p className="text-center py-10 text-[var(--muted-foreground)]">No payout requests yet.</p>
          ) : (
            payouts.map((p) => (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(p.amount, p.currency)}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {p.payout_method} · Requested {formatDate(p.requested_at)}
                      {p.processed_at ? ` · Processed ${formatDate(p.processed_at)}` : ""}
                    </p>
                    {p.reference_id && (
                      <p className="text-xs text-[var(--muted-foreground)]">Ref: {p.reference_id}</p>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] || STATUS_BADGE.pending}`}
                  >
                    {p.status}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
