"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Calendar, Clock, Video, Star, Heart, Bell,
  BookOpen, ChevronRight, ArrowRight, Search
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, getInitials } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface MenteeDashboardProps {
  profile: Profile;
  upcomingBookings: Array<{
    id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    status: string;
    amount: number;
    currency: string;
    payment_status: string;
    mentors: {
      id: string;
      profiles: { full_name: string | null; avatar_url: string | null; country: string | null } | null;
    } | null;
    meetings: Array<{ meeting_url: string; status: string; provider: string }> | null;
  }>;
  pastBookings: Array<{
    id: string;
    session_date: string;
    start_time: string;
    duration_minutes: number;
    status: string;
    amount: number;
    currency: string;
    mentors: {
      id: string;
      profiles: { full_name: string | null; avatar_url: string | null } | null;
    } | null;
    reviews: Array<{ id: string }>;
  }>;
  favorites: Array<{
    id: string;
    mentor_id: string;
    mentors: {
      id: string;
      hourly_rate: number;
      currency: string;
      average_rating: number;
      profiles: { full_name: string | null; avatar_url: string | null; country: string | null } | null;
    } | null;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
  }>;
}

const statusColors: Record<string, string> = {
  confirmed: "success",
  pending: "warning",
  completed: "secondary",
  cancelled: "destructive",
};

export function MenteeDashboard({
  profile,
  upcomingBookings,
  pastBookings,
  favorites,
  notifications,
}: MenteeDashboardProps) {
  const totalSpent = pastBookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold">
          Welcome back, {profile.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-[var(--muted-foreground)]">
          {upcomingBookings.length > 0
            ? `You have ${upcomingBookings.length} upcoming session${upcomingBookings.length > 1 ? "s" : ""}.`
            : "No upcoming sessions. Book a mentor to get started!"}
        </p>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Upcoming", value: upcomingBookings.length, icon: Calendar, color: "text-[var(--primary)]" },
          { label: "Completed", value: pastBookings.filter((b) => b.status === "completed").length, icon: BookOpen, color: "text-emerald-500" },
          { label: "Total Spent", value: formatCurrency(totalSpent, "SAR"), icon: Clock, color: "text-violet-500" },
          { label: "Favorites", value: favorites.length, icon: Heart, color: "text-rose-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-[var(--muted-foreground)]">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming sessions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
              <Link href="/dashboard/mentee/bookings">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3" />
                  <p className="text-[var(--muted-foreground)] mb-4">No upcoming sessions</p>
                  <Button variant="premium" size="sm" asChild>
                    <Link href="/mentors">
                      <Search className="h-4 w-4" />
                      Find a Mentor
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => {
                    const meeting = booking.meetings?.[0];
                    return (
                      <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors">
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarImage src={booking.mentors?.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(booking.mentors?.profiles?.full_name || "M")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {booking.mentors?.profiles?.full_name}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(booking.start_time), "MMM d")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(booking.start_time), "h:mm a")}
                            </span>
                            <span>{booking.duration_minutes} min</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={statusColors[booking.status] as "success" | "warning" | "secondary" | "destructive"}>
                            {booking.status}
                          </Badge>
                          {meeting && booking.status === "confirmed" && (
                            <Button size="sm" variant="premium" asChild>
                              <a href={meeting.meeting_url} target="_blank" rel="noopener noreferrer">
                                <Video className="h-3.5 w-3.5" />
                                Join
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

          {/* Past sessions needing review */}
          {pastBookings.some((b) => b.status === "completed" && b.reviews.length === 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Leave a Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastBookings
                    .filter((b) => b.status === "completed" && b.reviews.length === 0)
                    .slice(0, 3)
                    .map((booking) => (
                      <div key={booking.id} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(booking.mentors?.profiles?.full_name || "M")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{booking.mentors?.profiles?.full_name}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {format(new Date(booking.start_time), "MMM d")} · {booking.duration_minutes} min
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/reviews/new/${booking.id}`}>Rate</Link>
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-[var(--primary)]" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notif) => (
                    <div key={notif.id} className={`text-sm ${!notif.is_read ? "font-medium" : ""}`}>
                      <p className="text-[var(--foreground)]">{notif.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{notif.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Favorites */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-500" />
                Saved Mentors
              </CardTitle>
              <Link href="/dashboard/mentee/favorites">
                <Button variant="ghost" size="sm" className="text-xs">
                  All <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-[var(--muted-foreground)] mb-3">No saved mentors yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/mentors">Browse Mentors</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites.slice(0, 4).map((fav) => (
                    <Link key={fav.id} href={`/mentors/${fav.mentor_id}`}>
                      <div className="flex items-center gap-3 hover:bg-[var(--muted)]/50 rounded-lg p-2 transition-colors">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={fav.mentors?.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(fav.mentors?.profiles?.full_name || "M")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{fav.mentors?.profiles?.full_name}</p>
                          <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            <span>{fav.mentors?.average_rating?.toFixed(1)}</span>
                            <span>·</span>
                            <span>{formatCurrency(fav.mentors?.hourly_rate || 0, fav.mentors?.currency || "SAR")}/hr</span>
                          </div>
                        </div>
                      </div>
                    </Link>
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
