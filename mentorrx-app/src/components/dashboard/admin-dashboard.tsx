"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Users, UserCheck, BookOpen, DollarSign, TrendingUp,
  AlertCircle, ChevronRight, Settings, BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { Profile } from "@/types/database";

export interface AdminDashboardProps {
  profile: Profile;
  stats: {
    totalUsers: number;
    totalMentors: number;
    totalBookings: number;
    pendingMentors: number;
    totalRevenue: number;
    platformRevenue: number;
  };
  recentBookings: Array<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    created_at: string;
    session_date: string;
    mentors: { profiles: { full_name: string | null } | null } | null;
    profiles: { full_name: string | null } | null;
  }>;
  recentPayments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
  }>;
}

const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive" | "info"> = {
  confirmed: "success",
  pending: "warning",
  completed: "secondary",
  cancelled: "destructive",
  processing: "info",
  failed: "destructive",
};

export function AdminDashboard({ profile, stats, recentBookings, recentPayments }: AdminDashboardProps) {
  const statCards = [
    { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, color: "text-[var(--primary)]", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Active Mentors", value: stats.totalMentors.toLocaleString(), icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Total Bookings", value: stats.totalBookings.toLocaleString(), icon: BookOpen, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue, "SAR"), icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Platform Revenue", value: formatCurrency(stats.platformRevenue, "SAR"), icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Pending Verification", value: String(stats.pendingMentors), icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  const adminLinks = [
    { href: "/dashboard/admin/users", label: "Manage Users", icon: Users },
    { href: "/dashboard/admin/mentors", label: "Verify Mentors", icon: UserCheck },
    { href: "/dashboard/admin/bookings", label: "All Bookings", icon: BookOpen },
    { href: "/dashboard/admin/payments", label: "Payments", icon: DollarSign },
    { href: "/dashboard/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">
          Platform overview — {format(new Date(), "MMMM d, yyyy")}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert for pending verifications */}
      {stats.pendingMentors > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 mb-8">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{stats.pendingMentors} mentor{stats.pendingMentors !== 1 ? "s" : ""} awaiting verification</p>
            <p className="text-sm opacity-80">Review and approve pending mentor applications.</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/admin/mentors?filter=pending">Review</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/admin/bookings">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[var(--muted-foreground)] text-xs">
                      <th className="text-left pb-3">Mentee</th>
                      <th className="text-left pb-3">Mentor</th>
                      <th className="text-left pb-3">Date</th>
                      <th className="text-left pb-3">Amount</th>
                      <th className="text-left pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-t border-[var(--border)]">
                        <td className="py-3 font-medium">
                          {booking.profiles?.full_name || "—"}
                        </td>
                        <td className="py-3 text-[var(--muted-foreground)]">
                          {booking.mentors?.profiles?.full_name || "—"}
                        </td>
                        <td className="py-3 text-[var(--muted-foreground)]">
                          {format(new Date(booking.session_date), "MMM d")}
                        </td>
                        <td className="py-3 font-medium">
                          {formatCurrency(booking.amount, booking.currency)}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusColors[booking.status] || "secondary"}>
                            {booking.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Links */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--muted)]/50 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                        <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                      </div>
                      <span className="text-sm font-medium">{link.label}</span>
                      <ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] ml-auto" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount, payment.currency)}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {format(new Date(payment.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <Badge variant={statusColors[payment.status] || "secondary"}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
