"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, DollarSign, Search, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, formatTime, getInitials } from "@/lib/utils";

type Booking = {
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
  mentee: { full_name: string | null; avatar_url: string | null } | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  no_show: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

const FILTER_OPTIONS = ["all", "pending", "confirmed", "completed", "cancelled"];

export function MentorBookingsView({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    const matchesStatus = filter === "all" || b.status === filter;
    const matchesSearch =
      !search ||
      (b.mentee?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      formatDate(b.session_date).toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-[var(--muted-foreground)]">{bookings.length} total booking{bookings.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search mentee or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>
        <div className="flex gap-2">
          {FILTER_OPTIONS.map((f) => (
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
        <div className="space-y-3">
          {filtered.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={booking.mentee?.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(booking.mentee?.full_name || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {booking.mentee?.full_name || "Mentee"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(booking.session_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(booking.start_time)} · {booking.duration_minutes}min
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] || STATUS_COLORS.pending}`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-sm font-semibold hidden sm:block">
                        {formatCurrency(booking.amount, booking.currency)}
                      </span>
                    </div>
                  </div>
                  {booking.notes && (
                    <p className="text-xs text-[var(--muted-foreground)] mt-2 ml-13 pl-[52px] line-clamp-2">
                      {booking.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
