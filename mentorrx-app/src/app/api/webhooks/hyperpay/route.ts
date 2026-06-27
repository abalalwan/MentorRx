import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createHmac } from "crypto";

// HyperPay sends a POST webhook with payment result data.
// We verify the signature using HMAC-SHA256 over the payload.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify webhook signature
  const signature = req.headers.get("x-hyperpay-signature");
  const secret = process.env.HYPERPAY_WEBHOOK_SECRET;

  if (secret && signature) {
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    if (expected !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const checkoutId = payload.id as string | undefined;
  const bookingId = payload.merchantTransactionId as string | undefined;
  const resultCode = (payload.result as Record<string, string> | undefined)?.code ?? "";

  if (!bookingId || !checkoutId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const service = await createServiceClient();

  // Success codes per HyperPay docs
  const isSuccess = /^(000\.000\.|000\.100\.1|000\.[36])/.test(resultCode);
  const isPending = /^(000\.200)/.test(resultCode);

  if (isSuccess) {
    await service.from("bookings").update({ payment_status: "completed", status: "confirmed" }).eq("id", bookingId);
    await service.from("payments").update({ status: "completed", provider_payment_id: checkoutId }).eq("booking_id", bookingId);
  } else if (!isPending) {
    await service.from("bookings").update({ payment_status: "failed" }).eq("id", bookingId);
    await service.from("payments").update({ status: "failed" }).eq("booking_id", bookingId);
  }

  return NextResponse.json({ received: true });
}
