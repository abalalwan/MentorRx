"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  DollarSign, Calendar, Star, Users, ChevronRight,
  TrendingUp, Video, Settings, CheckCircle, Clock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface MentorDashboardProps {
  profile: Profile;
  mentor: {
    id: string;
    hourly_rate: number;
    currency: string;
    is_verified: boolean;
    is_accepting_bookings: boolean;
    total_sessions: number;
    total_reviews: number;
    average_rating: number;
  };
  upcomingBookings: Array<{
    id: string;
    session_date: string;
    start_time: string;
    duration_minutes: number;
    status: string;
    amount: number;
    currency: string;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
    meetings: Array<{ meeting_url: string; host_url: string | null; status: string }> | null;
  }>;
  totalEarnings: number;
  availableEarnings: number;
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
  }>;
  totalBookings: number;
}

export function MentorDashboard({
  profile,
  mentor,
  upcomingBookings,
  totalEarnings,
  availableEarnings,
  recentReviews,
  totalBookings,
}: MentorDashboardProps) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold">
            Hello, {profile.full_name?.split(" ")[0] || "Mentor"} 👋
          </h1>
          <p className="text-[var(--muted-foreground)]">
            {mentor.is_accepting_bookings ? "Your profile is live and accepting bookings." : "Your profile is paused."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/mentor/profile">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
          <Button variant="premium" asChild>
            <Link href={`/mentors/${mentor.id}`}>
              View Profile
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Earnings",
            value: formatCurrency(totalEarnings, mentor.currency),
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
          },
          {
            label: "Available",
            value: formatCurrency(availableEarnings, mentor.currency),
            icon: TrendingUp,
            color: "text-[var(--primary)]",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            label: "Total Sessions",
            value: String(mentor.total_sessions),
            icon: Calendar,
            color: "text-violet-500",
            bg: "bg-violet-50 dark:bg-violet-900/20",
          },
          {
            label: "Avg Rating",
            value: mentor.average_rating > 0 ? `${mentor.average_rating.toFixed(1)} ★` : "New",
            icon: Star,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-900/20",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
              <Link href="/dashboard/mentor/bookings">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3" />
                  <p className="text-[var(--muted-foreground)]">No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => {
                    const meeting = booking.meetings?.[0];
                    return (
                      <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--muted)]/50">
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarImage src={booking.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(booking.profiles?.full_name || "S")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{booking.profiles?.full_name || "Student"}</p>
                          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                            <span>{format(new Date(booking.start_time), "MMM d, h:mm a")}</span>
                            <span>{booking.duration_minutes} min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={booking.status === "confirmed" ? "success" : "warning"}>
                            {booking.status}
                          </Badge>
                          {meeting?.host_url && booking.status === "confirmed" && (
                            <Button size="sm" variant="premium" asChild>
                              <a href={meeting.host_url} target="_blank" rel="noopener noreferrer">
                                <Video className="h-3.5 w-3.5" />
                                Start
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payout CTA */}
          {availableEarnings > 0 && (
            <Card className="mt-6 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {formatCurrency(availableEarnings, mentor.currency)} Available
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">Ready for withdrawal</p>
                </div>
                <Button variant="premium" asChild>
                  <Link href="/dashboard/mentor/payouts">
                    <DollarSign className="h-4 w-4" />
                    Withdraw
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Profile completion */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: "Profile Photo", done: !!profile.avatar_url },
                  { label: "Biography", done: !!profile.bio },
                  { label: "Specialties Added", done: true },
                  { label: "Availability Set", done: true },
                  { label: "Identity Verified", done: mentor.is_verified },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <CheckCircle className={`h-4 w-4 ${item.done ? "text-emerald-500" : "text-[var(--muted)]"}`} />
                    <span className={item.done ? "" : "text-[var(--muted-foreground)]"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link href="/dashboard/mentor/profile">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {recentReviews.slice(0, 3).map((review) => (
                    <div key={review.id}>
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(review.profiles?.full_name || "U")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{review.profiles?.full_name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
