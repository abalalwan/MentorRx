import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2026-06-24.dahlia",
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret || !sig) {
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Stripe Webhook] Signature verification failed:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const service = await createServiceClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.booking_id;
      if (bookingId) {
        await service.from("bookings").update({ payment_status: "completed", status: "confirmed" }).eq("id", bookingId);
        await service.from("payments").update({ status: "completed", provider_payment_id: intent.id }).eq("booking_id", bookingId);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const bookingId = intent.metadata?.booking_id;
      if (bookingId) {
        await service.from("bookings").update({ payment_status: "failed" }).eq("id", bookingId);
        await service.from("payments").update({ status: "failed" }).eq("booking_id", bookingId);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const bookingId = charge.metadata?.booking_id;
      if (bookingId) {
        await service.from("bookings").update({ payment_status: "refunded" }).eq("id", bookingId);
        await service.from("payments").update({ status: "refunded" }).eq("booking_id", bookingId);
      }
      break;
    }

    default:
      // Ignore unhandled event types
      break;
  }

  return NextResponse.json({ received: true });
}
