// Payment abstraction layer — swap providers without changing business logic

export interface PaymentInitParams {
  bookingId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  description: string;
  redirectUrl: string;
}

export interface PaymentInitResult {
  paymentId: string;
  checkoutUrl: string;
  checkoutId?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface IPaymentProvider {
  initializePayment(params: PaymentInitParams): Promise<PaymentInitResult>;
  verifyPayment(paymentId: string): Promise<PaymentVerifyResult>;
  refundPayment(paymentId: string, amount?: number): Promise<boolean>;
}
