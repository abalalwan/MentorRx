"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Calendar, CreditCard, Star, AlertCircle, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type NotifRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  booking_confirmed: Calendar,
  booking_cancelled: Calendar,
  payment_received: CreditCard,
  payment_failed: CreditCard,
  review_received: Star,
  session_reminder: Bell,
  admin_notice: AlertCircle,
};

const TYPE_COLORS: Record<string, string> = {
  booking_confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  booking_cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  payment_received: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  payment_failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  review_received: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  session_reminder: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function getNotifLink(notif: NotifRow): string | null {
  if (!notif.data) return null;
  if (notif.data.booking_id) return `/dashboard/mentee/bookings`;
  return null;
}

export function NotificationsView({
  userId,
  notifications: initial,
}: {
  userId: string;
  notifications: NotifRow[];
}) {
  const [notifications, setNotifications] = useState(initial);
  const supabase = createClient();

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const deleteNotif = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-[var(--muted-foreground)]">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const Icon = TYPE_ICONS[notif.type] || Info;
            const colorClass = TYPE_COLORS[notif.type] || "bg-slate-100 text-slate-700";
            const link = getNotifLink(notif);

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={`transition-all ${!notif.is_read ? "border-[var(--primary)]/30 bg-blue-50/30 dark:bg-blue-900/10" : ""}`}
                  onClick={() => !notif.is_read && markRead(notif.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`text-sm font-medium ${!notif.is_read ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                              {notif.title}
                            </p>
                            <p className="text-sm text-[var(--muted-foreground)] mt-0.5 line-clamp-2">
                              {notif.body}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] mt-1">
                              {formatDate(notif.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {!notif.is_read && (
                              <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotif(notif.id);
                              }}
                              className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {link && (
                          <Link
                            href={link}
                            className="text-xs text-[var(--primary)] hover:underline mt-1 inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View details →
                          </Link>
                        )}
                      </div>
                    </div>
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
