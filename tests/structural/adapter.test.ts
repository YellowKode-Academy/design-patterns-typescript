import { LegacyPaymentGateway } from '../../src/structural/adapter/LegacyPaymentGateway';
import { LegacyGatewayAdapter } from '../../src/structural/adapter/LegacyGatewayAdapter';

describe('Adapter - LegacyGatewayAdapter', () => {
  it('getName retorna legacy', () => {
    const adapter = new LegacyGatewayAdapter(new LegacyPaymentGateway());
    expect(adapter.getName()).toBe('legacy');
  });

  it('createCheckout converte chamada do legado corretamente', async () => {
    const adapter = new LegacyGatewayAdapter(new LegacyPaymentGateway());
    const result = await adapter.createCheckout('order_100', 500);
    expect(result.sessionId).toContain('legacy_order_100');
    expect(result.paymentUrl).toContain('legacy-gateway');
  });

  it('refund com transId valido retorna status succeeded', async () => {
    const adapter = new LegacyGatewayAdapter(new LegacyPaymentGateway());
    const result = await adapter.refund('legacy_order_100_BRL_500');
    expect(result.status).toBe('succeeded');
  });

  it('refund com transId invalido retorna status failed', async () => {
    const adapter = new LegacyGatewayAdapter(new LegacyPaymentGateway());
    const result = await adapter.refund('invalid_id');
    expect(result.status).toBe('failed');
  });

  it('adapter implementa a mesma interface que gateways modernos', async () => {
    const adapter = new LegacyGatewayAdapter(new LegacyPaymentGateway());
    // Verifica que o adapter tem os metodos corretos da interface PaymentGateway
    expect(typeof adapter.createCheckout).toBe('function');
    expect(typeof adapter.refund).toBe('function');
    expect(typeof adapter.getName).toBe('function');
  });
});
