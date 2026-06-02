import { StripeGatewayFactory } from '../../src/creational/abstract-factory/StripeGatewayFactory';
import { PagSeguroGatewayFactory } from '../../src/creational/abstract-factory/PagSeguroGatewayFactory';
import { PaymentGatewayFactory } from '../../src/creational/abstract-factory/PaymentGateway';

describe('Abstract Factory - Gateways de Pagamento', () => {
  it('StripeGatewayFactory cria gateway com nome stripe', () => {
    const factory = new StripeGatewayFactory();
    const gateway = factory.createGateway();
    expect(gateway.getName()).toBe('stripe');
  });

  it('PagSeguroGatewayFactory cria gateway com nome pagseguro', () => {
    const factory = new PagSeguroGatewayFactory();
    const gateway = factory.createGateway();
    expect(gateway.getName()).toBe('pagseguro');
  });

  it('Stripe cria checkout com URL correta', async () => {
    const gateway = new StripeGatewayFactory().createGateway();
    const result = await gateway.createCheckout('order_001', 299.9);
    expect(result.sessionId).toContain('stripe_session_order_001');
    expect(result.paymentUrl).toContain('checkout.stripe.com');
  });

  it('PagSeguro cria checkout com URL correta', async () => {
    const gateway = new PagSeguroGatewayFactory().createGateway();
    const result = await gateway.createCheckout('order_002', 150.0);
    expect(result.sessionId).toContain('pagseguro_session_order_002');
    expect(result.paymentUrl).toContain('pagseguro');
  });

  it('Stripe refund retorna status succeeded', async () => {
    const gateway = new StripeGatewayFactory().createGateway();
    const result = await gateway.refund('charge_abc');
    expect(result.status).toBe('succeeded');
    expect(result.refundId).toContain('stripe_refund');
  });

  it('PagSeguro refund retorna status pending', async () => {
    const gateway = new PagSeguroGatewayFactory().createGateway();
    const result = await gateway.refund('trans_xyz');
    expect(result.status).toBe('pending');
  });

  it('polimorfismo: ambas factories implementam a mesma interface', async () => {
    const factories: PaymentGatewayFactory[] = [
      new StripeGatewayFactory(),
      new PagSeguroGatewayFactory(),
    ];

    for (const factory of factories) {
      const gateway = factory.createGateway();
      const checkout = await gateway.createCheckout('test_order', 100);
      expect(checkout).toHaveProperty('sessionId');
      expect(checkout).toHaveProperty('paymentUrl');
    }
  });
});
