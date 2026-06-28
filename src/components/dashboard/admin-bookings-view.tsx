"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

type AdminBooking = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  status: string;
  amount: number;
  currency: string;
  payment_status: string;
  created_at: string;
  mentor_name: string | null;
  mentee_name: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  failed: "bg-red-50 text-red-700",
  refunded: "bg-purple-50 text-purple-700",
};

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

export function AdminBookingsView({ bookings }: { bookings: AdminBooking[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter;
    const matchesSearch =
      !search ||
      (b.mentor_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.mentee_name || "").toLowerCase().includes(search.toLowerCase()) ||
      formatDate(b.session_date).toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = bookings
    .filter((b) => b.payment_status === "completed")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">All Bookings</h1>
        <p className="text-[var(--muted-foreground)]">
          {bookings.length} bookings · Total revenue: {formatCurrency(totalRevenue, "SAR")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by mentor, mentee, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--border)] hover:border-[var(--primary)]/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_100px_100px_100px] gap-4 px-4 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">
            <span>Mentor</span>
            <span>Mentee</span>
            <span>Date & Time</span>
            <span>Status</span>
            <span>Payment</span>
            <span>Amount</span>
          </div>
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="md:grid md:grid-cols-[1fr_1fr_1fr_100px_100px_100px] md:gap-4 md:items-center space-y-1 md:space-y-0">
                    <p className="text-sm font-medium truncate">{b.mentor_name || "—"}</p>
                    <p className="text-sm text-[var(--muted-foreground)] truncate">{b.mentee_name || "—"}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {formatDate(b.session_date)} · {formatTime(b.start_time)} · {b.duration_minutes}min
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${STATUS_COLORS[b.status] || ""}`}
                    >
                      {b.status}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${PAYMENT_COLORS[b.payment_status] || ""}`}
                    >
                      {b.payment_status}
                    </span>
                    <p className="text-sm font-semibold">{formatCurrency(b.amount, b.currency)}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
