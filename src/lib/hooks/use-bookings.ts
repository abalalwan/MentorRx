"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

interface Booking {
  id: string;
  mentor_id: string;
  mentee_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: BookingStatus;
  amount: number;
  currency: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
}

interface UseBookingsOptions {
  userId: string | null | undefined;
  role: "mentee" | "mentor";
  status?: BookingStatus[];
  limit?: number;
}

export function useBookings({ userId, role, status, limit = 50 }: UseBookingsOptions) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const query = supabase
      .from("bookings")
      .select(
        "id, mentor_id, mentee_id, session_date, start_time, end_time, duration_minutes, status, amount, currency, payment_status, notes, created_at"
      )
      .eq(role === "mentee" ? "mentee_id" : "mentor_id", userId)
      .order("session_date", { ascending: false })
      .limit(limit);

    if (status?.length) {
      query.in("status", status);
    }

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError.message);
    } else {
      setBookings((data as Booking[]) || []);
    }
    setLoading(false);
  }, [userId, role, status, limit, supabase]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Real-time subscription for booking status changes
  useEffect(() => {
    if (!userId) return;

    const filter =
      role === "mentee" ? `mentee_id=eq.${userId}` : `mentor_id=eq.${userId}`;

    const channel = supabase
      .channel(`bookings:${role}:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookings((prev) => [payload.new as Booking, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setBookings((prev) =>
              prev.map((b) =>
                b.id === (payload.new as Booking).id ? (payload.new as Booking) : b
              )
            );
          } else if (payload.eventType === "DELETE") {
            setBookings((prev) =>
              prev.filter((b) => b.id !== (payload.old as Booking).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role, supabase]);

  const cancelBooking = useCallback(
    async (bookingId: string, reason?: string) => {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: "cancelled" as BookingStatus } : b
          )
        );
      }
      return { success: res.ok, error: data.error };
    },
    []
  );

  return { bookings, loading, error, refetch: fetchBookings, cancelBooking };
}
