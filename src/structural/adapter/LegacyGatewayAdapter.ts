import {
  CheckoutResult,
  PaymentGateway,
  RefundResult,
} from '../../creational/abstract-factory/PaymentGateway';
import { LegacyPaymentGateway } from './LegacyPaymentGateway';

export class LegacyGatewayAdapter implements PaymentGateway {
  constructor(private readonly legacy: LegacyPaymentGateway) {}

  async createCheckout(orderId: string, amount: number): Promise<CheckoutResult> {
    const result = this.legacy.makePayment(amount, 'BRL', orderId);
    if (!result.success) {
      throw new Error('Legacy gateway payment failed');
    }
    return {
      sessionId: result.transId,
      paymentUrl: `https://legacy-gateway.example.com/pay/${result.transId}`,
    };
  }

  async refund(chargeId: string): Promise<RefundResult> {
    const result = this.legacy.cancelTransaction(chargeId);
    return {
      refundId: `refund_${chargeId}`,
      status: result.cancelled ? 'succeeded' : 'failed',
    };
  }

  getName(): string {
    return 'legacy';
  }
}
