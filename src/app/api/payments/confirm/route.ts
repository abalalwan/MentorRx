import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments";
import { getVideoProvider } from "@/lib/video";
import { sendBookingConfirmedMentee, sendNewBookingMentor } from "@/lib/email";
import type { Database } from "@/types/database";

type BookingRow = Pick<
  Database["public"]["Tables"]["bookings"]["Row"],
  | "id" | "mentor_id" | "mentee_id" | "amount" | "currency"
  | "start_time" | "end_time" | "duration_minutes" | "payment_status"
>;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bookingId, checkoutId, provider = "hyperpay" } = body;

  const supabase = await createServiceClient();

  // Fetch booking (simple select to avoid nested join type inference issues)
  const bookingResult = await supabase
    .from("bookings")
    .select("id, mentor_id, mentee_id, amount, currency, start_time, end_time, duration_minutes, payment_status")
    .eq("id", bookingId)
    .single();

  if (bookingResult.error || !bookingResult.data) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const booking = bookingResult.data as BookingRow;

  if (booking.payment_status === "completed") {
    return NextResponse.json({ success: true, alreadyProcessed: true });
  }

  // Fetch mentor profile_id and email
  const mentorResult = await supabase
    .from("mentors")
    .select("profile_id")
    .eq("id", booking.mentor_id)
    .single();
  const mentorRow = mentorResult.data as { profile_id: string } | null;

  const mentorProfileResult = mentorRow
    ? await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", mentorRow.profile_id)
        .single()
    : { data: null };
  const mentorProfile = mentorProfileResult.data as { email: string; full_name: string | null } | null;

  const menteeProfileResult = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", booking.mentee_id)
    .single();
  const menteeProfile = menteeProfileResult.data as { email: string; full_name: string | null } | null;

  // Verify payment
  const paymentProvider = getPaymentProvider(provider);
  const verification = await paymentProvider.verifyPayment(checkoutId);

  if (!verification.success) {
    await supabase
      .from("bookings")
      .update({ payment_status: "failed" })
      .eq("id", bookingId);

    await supabase
      .from("payments")
      .update({ status: "failed" })
      .eq("booking_id", bookingId);

    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // Create video meeting
  let meetingId: string | null = null;
  try {
    const videoProvider = getVideoProvider();

    const meeting = await videoProvider.createMeeting({
      topic: `MentorRx Session`,
      startTime: new Date(booking.start_time),
      durationMinutes: booking.duration_minutes,
      hostEmail: mentorProfile?.email ?? "",
      participantEmail: menteeProfile?.email ?? "",
      bookingId: booking.id,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meetingInsert = await (supabase.from("meetings") as any).insert({
      booking_id: booking.id,
      provider: meeting.provider,
      provider_meeting_id: meeting.providerMeetingId,
      meeting_url: meeting.meetingUrl,
      host_url: meeting.hostUrl,
      password: meeting.password,
      status: "scheduled",
      start_time: booking.start_time,
      end_time: booking.end_time,
    }).select("id").single();

    meetingId = meetingInsert.data?.id ?? null;
  } catch (meetingErr) {
    console.error("Failed to create video meeting:", meetingErr);
  }

  // Update booking status
  await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      payment_status: "completed",
      meeting_id: meetingId,
    })
    .eq("id", bookingId);

  // Update payment status
  await supabase
    .from("payments")
    .update({
      status: "completed",
      provider_payment_id: checkoutId,
    })
    .eq("booking_id", bookingId);

  // Fetch payment id for earnings record
  const paymentResult = await supabase
    .from("payments")
    .select("id")
    .eq("booking_id", bookingId)
    .single();
  const payment = paymentResult.data as { id: string } | null;

  if (payment) {
    const grossAmount = booking.amount;
    const platformFee = grossAmount * 0.1;
    const netAmount = grossAmount - platformFee;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("earnings") as any).insert({
      mentor_id: booking.mentor_id,
      booking_id: bookingId,
      payment_id: payment.id,
      gross_amount: grossAmount,
      platform_fee: platformFee,
      net_amount: netAmount,
      currency: booking.currency,
      status: "pending",
      available_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  // Send notifications
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("notifications") as any).insert([
    {
      user_id: booking.mentee_id,
      type: "booking_confirmed",
      title: "Booking Confirmed!",
      body: `Your session has been confirmed. Meeting link is ready.`,
      data: { booking_id: bookingId },
    },
    {
      user_id: mentorRow?.profile_id ?? booking.mentor_id,
      type: "booking_confirmed",
      title: "New Session Booked",
      body: `You have a new session booked. Check your dashboard.`,
      data: { booking_id: bookingId },
    },
  ]);

  // Send confirmation emails (fire-and-forget — don't block the response)
  const sessionDateStr = new Date(booking.start_time).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const sessionTimeStr = new Date(booking.start_time).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
  const amountStr = `${booking.currency.toUpperCase()} ${(booking.amount / 100).toFixed(2)}`;

  // Fetch meeting URL if created
  let meetingUrlForEmail: string | null = null;
  if (meetingId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: meetingRow } = await (supabase.from("meetings") as any)
      .select("meeting_url")
      .eq("id", meetingId)
      .single();
    meetingUrlForEmail = meetingRow?.meeting_url ?? null;
  }

  if (menteeProfile?.email) {
    sendBookingConfirmedMentee({
      to: menteeProfile.email,
      menteeName: menteeProfile.full_name || "there",
      mentorName: mentorProfile?.full_name || "your mentor",
      sessionDate: sessionDateStr,
      startTime: sessionTimeStr,
      durationMinutes: booking.duration_minutes,
      amount: amountStr,
      meetingUrl: meetingUrlForEmail,
      bookingId: bookingId,
    }).catch((e) => console.error("[Email] Mentee confirmation failed:", e));
  }

  if (mentorProfile?.email) {
    sendNewBookingMentor({
      to: mentorProfile.email,
      mentorName: mentorProfile.full_name || "there",
      menteeName: menteeProfile?.full_name || "a mentee",
      sessionDate: sessionDateStr,
      startTime: sessionTimeStr,
      durationMinutes: booking.duration_minutes,
      amount: amountStr,
      bookingId: bookingId,
    }).catch((e) => console.error("[Email] Mentor notification failed:", e));
  }

  return NextResponse.json({ success: true, bookingId });
}
