import { CheckoutResult, PaymentGateway, RefundResult } from './PaymentGateway';

export class PagSeguroGateway implements PaymentGateway {
  async createCheckout(orderId: string, amount: number): Promise<CheckoutResult> {
    return {
      sessionId: `pagseguro_session_${orderId}`,
      paymentUrl: `https://pagseguro.uol.com.br/checkout/${orderId}?total=${amount}`,
    };
  }

  async refund(chargeId: string): Promise<RefundResult> {
    return {
      refundId: `pagseguro_refund_${chargeId}`,
      status: 'pending',
    };
  }

  getName(): string {
    return 'pagseguro';
  }
}
