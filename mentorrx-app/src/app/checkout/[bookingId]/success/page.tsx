"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Clock, Video, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

interface BookingDetails {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  amount: number;
  currency: string;
  meeting_url: string | null;
}

export default function CheckoutSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooking() {
      const supabase = createClient();
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("id, session_date, start_time, end_time, duration_minutes, amount, currency, payment_status")
        .eq("id", bookingId)
        .single();

      if (!bookingData || bookingData.payment_status !== "completed") {
        router.replace(`/checkout/${bookingId}`);
        return;
      }

      // Fetch associated meeting
      const { data: meetingData } = await supabase
        .from("meetings")
        .select("meeting_url")
        .eq("booking_id", bookingId)
        .single();

      const bd = bookingData as unknown as BookingDetails;
      setBooking({
        ...bd,
        meeting_url: (meetingData as { meeting_url: string } | null)?.meeting_url ?? null,
      });
      setLoading(false);
    }

    fetchBooking();
  }, [bookingId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8">
            {/* Success icon */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </motion.div>
              <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">Payment Successful!</h1>
              <p className="text-[var(--muted-foreground)] mt-1">
                Your session has been booked and confirmed.
              </p>
            </div>

            {/* Booking details */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Calendar className="h-4 w-4 text-[var(--primary)] shrink-0" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Date</p>
                  <p className="text-sm font-medium">{formatDate(booking.session_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Clock className="h-4 w-4 text-[var(--primary)] shrink-0" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Time</p>
                  <p className="text-sm font-medium">
                    {formatTime(booking.start_time)} — {formatTime(booking.end_time)} ({booking.duration_minutes} min)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Download className="h-4 w-4 text-[var(--primary)] shrink-0" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Amount Paid</p>
                  <p className="text-sm font-medium">{formatCurrency(booking.amount, booking.currency)}</p>
                </div>
              </div>
              {booking.meeting_url && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <Video className="h-4 w-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-blue-600">Meeting Link</p>
                    <p className="text-sm font-medium text-blue-700 truncate">{booking.meeting_url}</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-center text-[var(--muted-foreground)] mb-6">
              A confirmation email has been sent to your registered email address.
            </p>

            <div className="space-y-3">
              <Button variant="premium" className="w-full" asChild>
                <Link href="/dashboard/mentee">
                  Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/mentee/bookings">View All Bookings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
