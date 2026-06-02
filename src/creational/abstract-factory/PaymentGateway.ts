export interface CheckoutResult {
  sessionId: string;
  paymentUrl: string;
}

export interface RefundResult {
  refundId: string;
  status: 'pending' | 'succeeded' | 'failed';
}

export interface PaymentGateway {
  createCheckout(orderId: string, amount: number): Promise<CheckoutResult>;
  refund(chargeId: string): Promise<RefundResult>;
  getName(): string;
}

export interface PaymentGatewayFactory {
  createGateway(): PaymentGateway;
}
