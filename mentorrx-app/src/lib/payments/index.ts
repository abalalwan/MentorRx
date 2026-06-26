import type { IPaymentProvider } from "./provider";
import { HyperPayProvider } from "./hyperpay";
import { StripeProvider } from "./stripe";

export type PaymentProviderName = "hyperpay" | "stripe";

export function getPaymentProvider(name?: PaymentProviderName): IPaymentProvider {
  const provider = name || (process.env.DEFAULT_PAYMENT_PROVIDER as PaymentProviderName) || "hyperpay";

  switch (provider) {
    case "stripe":
      return new StripeProvider();
    case "hyperpay":
    default:
      return new HyperPayProvider();
  }
}

export { type IPaymentProvider } from "./provider";
export type { PaymentInitParams, PaymentInitResult, PaymentVerifyResult } from "./provider";
