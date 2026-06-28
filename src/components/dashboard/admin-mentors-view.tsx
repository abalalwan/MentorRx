"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Star, Search, Filter } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type MentorEntry = {
  id: string;
  profile_id: string;
  headline: string | null;
  current_title: string | null;
  current_company: string | null;
  years_experience: number | null;
  hourly_rate: number;
  currency: string;
  is_verified: boolean;
  is_featured: boolean;
  is_accepting_bookings: boolean;
  total_sessions: number;
  total_reviews: number;
  average_rating: number;
  created_at: string;
  profile: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null;
};

const FILTERS = ["all", "unverified", "verified", "featured"];

export function AdminMentorsView({ mentors: initial }: { mentors: MentorEntry[] }) {
  const [mentors, setMentors] = useState(initial);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const filtered = mentors.filter((m) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unverified" && !m.is_verified) ||
      (filter === "verified" && m.is_verified) ||
      (filter === "featured" && m.is_featured);
    const matchesSearch =
      !search ||
      (m.profile?.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.profile?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (m.current_title || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const setVerified = async (mentorId: string, verified: boolean) => {
    await supabase.from("mentors").update({ is_verified: verified }).eq("id", mentorId);
    setMentors((prev) =>
      prev.map((m) => (m.id === mentorId ? { ...m, is_verified: verified } : m))
    );
  };

  const setFeatured = async (mentorId: string, featured: boolean) => {
    await supabase.from("mentors").update({ is_featured: featured }).eq("id", mentorId);
    setMentors((prev) =>
      prev.map((m) => (m.id === mentorId ? { ...m, is_featured: featured } : m))
    );
  };

  const unverifiedCount = mentors.filter((m) => !m.is_verified).length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mentor Management</h1>
          <p className="text-[var(--muted-foreground)]">
            {mentors.length} mentors · {unverifiedCount} pending verification
          </p>
        </div>
        {unverifiedCount > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {unverifiedCount} pending
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search by name, email, or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-[var(--input)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </div>
        <div className="flex gap-2">
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

      <div className="space-y-3">
        {filtered.map((mentor, i) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={mentor.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(mentor.profile?.full_name || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{mentor.profile?.full_name || "Unknown"}</p>
                        {mentor.is_verified && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                        )}
                        {mentor.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {mentor.profile?.email}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {[mentor.current_title, mentor.current_company].filter(Boolean).join(" · ")}
                        {mentor.years_experience ? ` · ${mentor.years_experience}y exp` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {mentor.total_sessions} sessions · {mentor.average_rating.toFixed(1)}★
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(mentor.hourly_rate, mentor.currency)}/hr
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={mentor.is_verified ? "outline" : "premium"}
                        size="sm"
                        onClick={() => setVerified(mentor.id, !mentor.is_verified)}
                      >
                        {mentor.is_verified ? "Unverify" : "Verify"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFeatured(mentor.id, !mentor.is_featured)}
                      >
                        {mentor.is_featured ? "Unfeature" : "Feature"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            <p>No mentors found</p>
          </div>
        )}
      </div>
    </div>
  );
}
