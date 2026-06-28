import type { IPaymentProvider, PaymentInitParams, PaymentInitResult, PaymentVerifyResult } from "./provider";

export class HyperPayProvider implements IPaymentProvider {
  private readonly accessToken: string;
  private readonly entityId: string;
  private readonly baseUrl: string;

  constructor() {
    this.accessToken = process.env.HYPERPAY_ACCESS_TOKEN!;
    this.entityId = process.env.HYPERPAY_ENTITY_ID_CREDIT!;
    this.baseUrl = process.env.HYPERPAY_BASE_URL || "https://eu-test.oppwa.com";
  }

  async initializePayment(params: PaymentInitParams): Promise<PaymentInitResult> {
    const body = new URLSearchParams({
      entityId: this.entityId,
      amount: params.amount.toFixed(2),
      currency: params.currency,
      paymentType: "DB",
      "customer.email": params.customerEmail,
      "customer.givenName": params.customerName.split(" ")[0] || params.customerName,
      "customer.surname": params.customerName.split(" ").slice(1).join(" ") || ".",
      "billing.street1": ".",
      "billing.city": ".",
      "billing.state": ".",
      "billing.country": "SA",
      "billing.postcode": "00000",
      "merchant.transactionId": params.bookingId,
      "customParameters[SHOPPER_bookingId]": params.bookingId,
      redirectUrl: params.redirectUrl,
    });

    const res = await fetch(`${this.baseUrl}/v1/checkouts`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HyperPay checkout creation failed: ${err}`);
    }

    const data = await res.json();

    if (!data.id) {
      throw new Error(`HyperPay returned no checkout ID: ${JSON.stringify(data)}`);
    }

    return {
      paymentId: data.id,
      checkoutId: data.id,
      checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${params.bookingId}/pay?checkoutId=${data.id}`,
    };
  }

  async verifyPayment(checkoutId: string): Promise<PaymentVerifyResult> {
    const res = await fetch(
      `${this.baseUrl}/v1/checkouts/${checkoutId}/payment?entityId=${this.entityId}`,
      {
        headers: {
          "Authorization": `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`HyperPay verification failed: ${res.statusText}`);
    }

    const data = await res.json();
    const resultCode: string = data.result?.code || "";

    // Success codes per HyperPay docs
    const isSuccess = /^(000\.000\.|000\.100\.1|000\.[36])/.test(resultCode);

    return {
      success: isSuccess,
      paymentId: checkoutId,
      amount: parseFloat(data.amount || "0"),
      currency: data.currency || "SAR",
      status: isSuccess ? "completed" : "failed",
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<boolean> {
    const body = new URLSearchParams({
      entityId: this.entityId,
      paymentType: "RF",
      ...(amount && { amount: amount.toFixed(2) }),
    });

    const res = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) return false;

    const data = await res.json();
    return /^(000\.000\.|000\.100\.1|000\.[36])/.test(data.result?.code || "");
  }
}
