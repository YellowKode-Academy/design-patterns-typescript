import { PaymentGateway, PaymentGatewayFactory } from './PaymentGateway';
import { StripeGateway } from './StripeGateway';

export class StripeGatewayFactory implements PaymentGatewayFactory {
  createGateway(): PaymentGateway {
    return new StripeGateway();
  }
}
