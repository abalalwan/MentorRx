import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendBookingCancelledEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { bookingId, reason } = await req.json();

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service client for full access
  const service = await createServiceClient();

  // Fetch booking and verify ownership
  const { data: booking, error: bookingError } = await service
    .from("bookings")
    .select("id, mentor_id, mentee_id, status, session_date, start_time, payment_status, amount, currency")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Only the mentee or mentor on the booking can cancel
  const mentorResult = await service
    .from("mentors")
    .select("profile_id")
    .eq("id", booking.mentor_id)
    .single();
  const mentorProfileId = (mentorResult.data as { profile_id: string } | null)?.profile_id;

  if (booking.mentee_id !== user.id && mentorProfileId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ success: true, alreadyCancelled: true });
  }

  if (booking.status === "completed") {
    return NextResponse.json({ error: "Cannot cancel a completed booking" }, { status: 400 });
  }

  // Cancel the booking
  await service
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);

  // If payment was completed, mark as refund_pending
  if (booking.payment_status === "completed") {
    await service
      .from("payments")
      .update({ status: "refunded" })
      .eq("booking_id", bookingId);
  }

  // Fetch mentee and mentor profile info for notifications/emails
  const menteeResult = await service
    .from("profiles")
    .select("email, full_name")
    .eq("id", booking.mentee_id)
    .single();
  const menteeProfile = menteeResult.data as { email: string; full_name: string | null } | null;

  const mentorProfileResult = mentorProfileId
    ? await service.from("profiles").select("email, full_name").eq("id", mentorProfileId).single()
    : { data: null };
  const mentorProfile = mentorProfileResult.data as { email: string; full_name: string | null } | null;

  const sessionDateStr = new Date(booking.session_date).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const sessionTimeStr = new Date(booking.start_time).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  // Send cancellation notifications in-app
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (service.from("notifications") as any).insert([
    {
      user_id: booking.mentee_id,
      type: "booking_cancelled",
      title: "Session Cancelled",
      body: `Your session on ${sessionDateStr} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
      data: { booking_id: bookingId },
    },
    ...(mentorProfileId
      ? [{
          user_id: mentorProfileId,
          type: "booking_cancelled",
          title: "Session Cancelled",
          body: `A session on ${sessionDateStr} has been cancelled.${reason ? ` Reason: ${reason}` : ""}`,
          data: { booking_id: bookingId },
        }]
      : []),
  ]);

  // Send cancellation emails (fire-and-forget)
  if (menteeProfile?.email) {
    sendBookingCancelledEmail({
      to: menteeProfile.email,
      recipientName: menteeProfile.full_name || "there",
      sessionDate: sessionDateStr,
      startTime: sessionTimeStr,
      reason,
    }).catch((e) => console.error("[Email] Cancellation email failed:", e));
  }

  if (mentorProfile?.email) {
    sendBookingCancelledEmail({
      to: mentorProfile.email,
      recipientName: mentorProfile.full_name || "there",
      sessionDate: sessionDateStr,
      startTime: sessionTimeStr,
      reason,
    }).catch((e) => console.error("[Email] Cancellation email (mentor) failed:", e));
  }

  return NextResponse.json({ success: true });
}
