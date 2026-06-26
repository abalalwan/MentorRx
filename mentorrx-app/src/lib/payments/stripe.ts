import type { IPaymentProvider, PaymentInitParams, PaymentInitResult, PaymentVerifyResult } from "./provider";

export class StripeProvider implements IPaymentProvider {
  async initializePayment(params: PaymentInitParams): Promise<PaymentInitResult> {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: params.customerEmail,
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: { name: params.description },
            unit_amount: Math.round(params.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { bookingId: params.bookingId },
      success_url: `${params.redirectUrl}?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${params.redirectUrl}?status=cancelled`,
    });

    return {
      paymentId: session.id,
      checkoutUrl: session.url!,
    };
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerifyResult> {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return {
      success: session.payment_status === "paid",
      paymentId: sessionId,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency?.toUpperCase() || "USD",
      status: session.payment_status === "paid" ? "completed" : "failed",
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<boolean> {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const refund = await stripe.refunds.create({
      payment_intent: paymentId,
      ...(amount && { amount: Math.round(amount * 100) }),
    });

    return refund.status === "succeeded";
  }
}
