"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  provider_payment_id: string | null;
  created_at: string;
};

type PayoutEntry = {
  id: string;
  mentor_id: string;
  amount: number;
  currency: string;
  status: string;
  payout_method: string;
  requested_at: string;
  processed_at: string | null;
  mentor_name: string | null;
};

const PAYMENT_STATUS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

const PAYOUT_STATUS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function AdminPaymentsView({
  payments,
  payouts,
}: {
  payments: Payment[];
  payouts: PayoutEntry[];
}) {
  const [tab, setTab] = useState<"payments" | "payouts">("payments");
  const [search, setSearch] = useState("");

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const platformFee = totalRevenue * 0.1; // approximate 10% fee

  const pendingPayouts = payouts
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter(
    (p) =>
      !search ||
      (p.provider_payment_id || "").toLowerCase().includes(search.toLowerCase()) ||
      p.booking_id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPayouts = payouts.filter(
    (p) =>
      !search ||
      (p.mentor_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Payment Tracking</h1>
        <p className="text-[var(--muted-foreground)]">Monitor all transactions and payout requests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: totalRevenue, icon: TrendingUp, color: "text-blue-600", currency: "SAR" },
          { label: "Platform Fees (~10%)", value: platformFee, icon: DollarSign, color: "text-green-600", currency: "SAR" },
          { label: "Pending Payouts", value: pendingPayouts, icon: Clock, color: "text-yellow-600", currency: "SAR" },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[var(--muted-foreground)]">{stat.label}</p>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{formatCurrency(stat.value, stat.currency)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2 border-b border-[var(--border)]">
          {(["payments", "payouts"] as const).map((t) => (
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
              {t} ({t === "payments" ? payments.length : payouts.length})
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>
      </div>

      {tab === "payments" && (
        <div className="space-y-2">
          {filteredPayments.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}>
              <Card>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{formatCurrency(p.amount, p.currency)}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {p.provider} · {p.provider_payment_id || p.id.slice(0, 8)} · {formatDate(p.created_at)}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${PAYMENT_STATUS[p.status] || ""}`}>
                    {p.status}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredPayments.length === 0 && (
            <p className="text-center py-10 text-[var(--muted-foreground)]">No payments found</p>
          )}
        </div>
      )}

      {tab === "payouts" && (
        <div className="space-y-2">
          {filteredPayouts.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}>
              <Card>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p.mentor_name || "Unknown Mentor"}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatCurrency(p.amount, p.currency)} via {p.payout_method} · {formatDate(p.requested_at)}
                      {p.processed_at ? ` · Processed ${formatDate(p.processed_at)}` : ""}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${PAYOUT_STATUS[p.status] || ""}`}>
                    {p.status}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredPayouts.length === 0 && (
            <p className="text-center py-10 text-[var(--muted-foreground)]">No payout requests found</p>
          )}
        </div>
      )}
    </div>
  );
}
