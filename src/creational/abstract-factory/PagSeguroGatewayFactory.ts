import { PaymentGateway, PaymentGatewayFactory } from './PaymentGateway';
import { PagSeguroGateway } from './PagSeguroGateway';

export class PagSeguroGatewayFactory implements PaymentGatewayFactory {
  createGateway(): PaymentGateway {
    return new PagSeguroGateway();
  }
}
