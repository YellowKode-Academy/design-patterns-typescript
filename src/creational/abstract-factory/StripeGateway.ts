import { CheckoutResult, PaymentGateway, RefundResult } from './PaymentGateway';

export class StripeGateway implements PaymentGateway {
  async createCheckout(orderId: string, amount: number): Promise<CheckoutResult> {
    return {
      sessionId: `stripe_session_${orderId}`,
      paymentUrl: `https://checkout.stripe.com/pay/${orderId}?amount=${amount}`,
    };
  }

  async refund(chargeId: string): Promise<RefundResult> {
    return {
      refundId: `stripe_refund_${chargeId}`,
      status: 'succeeded',
    };
  }

  getName(): string {
    return 'stripe';
  }
}
