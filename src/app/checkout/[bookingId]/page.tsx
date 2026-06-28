"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params.bookingId as string;
  const status = searchParams.get("status");
  const checkoutId = searchParams.get("checkoutId") || searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<{
    id: string;
    amount: number;
    currency: string;
    session_date: string;
    duration_minutes: number;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  // Handle payment return
  useEffect(() => {
    if (checkoutId && (status === "success" || status === undefined)) {
      handleConfirmPayment();
    }
  }, [checkoutId]);

  const fetchBooking = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("id, amount, currency, session_date, duration_minutes, payment_status")
      .eq("id", bookingId)
      .single();
    setBooking(data);
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Payment initiation failed");
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!checkoutId) return;
    setConfirming(true);

    try {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, checkoutId }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/checkout/${bookingId}/success`);
      } else {
        setError(data.error || "Payment confirmation failed");
      }
    } catch {
      setError("Error confirming payment");
    } finally {
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Complete Payment</h1>
              {booking && (
                <p className="text-[var(--muted-foreground)] mt-1">
                  {formatCurrency(booking.amount, booking.currency)} for {booking.duration_minutes} min session
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 mb-6">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {status === "cancelled" && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 mb-6">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-sm">Payment was cancelled. You can try again.</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                variant="premium"
                className="w-full"
                size="lg"
                loading={loading}
                onClick={handleInitiatePayment}
              >
                Pay with HyperPay
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-center text-[var(--muted-foreground)] mt-6">
              Secured by HyperPay · PCI-DSS Compliant
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
