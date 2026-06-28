"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Clock, Video, Star, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, formatTime, getInitials } from "@/lib/utils";

type Booking = {
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
  mentor: { full_name: string | null; avatar_url: string | null; headline: string | null } | null;
  meeting_url: string | null;
  has_review: boolean;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

export function MenteeBookingsView({ bookings }: { bookings: Booking[] }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = bookings.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter;
    const matchesSearch =
      !search ||
      (b.mentor?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      formatDate(b.session_date).toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">My Sessions</h1>
        <p className="text-[var(--muted-foreground)]">{bookings.length} total session{bookings.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search mentor or date..."
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
          <p>No sessions found</p>
          <Button variant="premium" className="mt-4" asChild>
            <Link href="/mentors">Find a Mentor</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking, i) => {
            const isUpcoming =
              booking.status === "confirmed" || booking.status === "pending";
            const isCompleted = booking.status === "completed";

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={booking.mentor?.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(booking.mentor?.full_name || "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {booking.mentor?.full_name || "Mentor"}
                          </p>
                          {booking.mentor?.headline && (
                            <p className="text-xs text-[var(--muted-foreground)] truncate">
                              {booking.mentor.headline}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mt-0.5">
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
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[booking.status] || ""}`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(booking.amount, booking.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {(isUpcoming || isCompleted) && (
                      <div className="flex gap-2 mt-3 pl-13">
                        {isUpcoming && booking.meeting_url && (
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer">
                              <Video className="h-3 w-3" />
                              Join Session
                            </a>
                          </Button>
                        )}
                        {isCompleted && !booking.has_review && (
                          <Button variant="outline" size="sm" className="gap-2" asChild>
                            <Link href={`/reviews/new/${booking.id}`}>
                              <Star className="h-3 w-3" />
                              Leave Review
                            </Link>
                          </Button>
                        )}
                        {isCompleted && booking.has_review && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" /> Reviewed
                          </span>
                        )}
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/mentors/${booking.mentor_id}`}>View Mentor</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
