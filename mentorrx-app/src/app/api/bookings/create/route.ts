import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments";
import type { Database } from "@/types/database";

type BookingSelect = Pick<
  Database["public"]["Tables"]["bookings"]["Row"],
  "id" | "mentor_id" | "mentee_id" | "amount" | "currency" | "payment_status"
>;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bookingId } = body;

  // Fetch booking
  const bookingResult = await supabase
    .from("bookings")
    .select("id, mentor_id, mentee_id, amount, currency, payment_status")
    .eq("id", bookingId)
    .eq("mentee_id", user.id)
    .single();

  const bookingError = bookingResult.error;
  const booking = bookingResult.data as BookingSelect | null;

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.payment_status !== "pending") {
    return NextResponse.json({ error: "Booking already processed" }, { status: 400 });
  }

  // Fetch mentor profile_id
  const mentorResult = await supabase
    .from("mentors")
    .select("profile_id")
    .eq("id", booking.mentor_id)
    .single();
  const mentorRow = mentorResult.data as { profile_id: string } | null;

  // Get mentee profile
  const menteeResult = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .single();
  const menteeProfile = menteeResult.data as { email: string; full_name: string | null } | null;

  const paymentProvider = getPaymentProvider();

  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${bookingId}/confirm`;

  const result = await paymentProvider.initializePayment({
    bookingId: booking.id,
    amount: booking.amount,
    currency: booking.currency,
    customerEmail: menteeProfile?.email || user.email || "",
    customerName: menteeProfile?.full_name || "Customer",
    description: `MentorRx Session - Booking ${booking.id.slice(0, 8)}`,
    redirectUrl,
  });

  // Store pending payment record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: paymentError } = await (supabase.from("payments") as any).insert({
    booking_id: booking.id,
    payer_id: user.id,
    payee_id: mentorRow?.profile_id ?? booking.mentor_id,
    amount: booking.amount,
    currency: booking.currency,
    platform_fee: booking.amount * 0.1,
    net_amount: booking.amount * 0.9,
    status: "pending",
    provider: "hyperpay",
    provider_payment_id: result.paymentId,
  });

  if (paymentError) {
    return NextResponse.json({ error: "Failed to create payment record" }, { status: 500 });
  }

  return NextResponse.json({ checkoutUrl: result.checkoutUrl, checkoutId: result.checkoutId });
}
