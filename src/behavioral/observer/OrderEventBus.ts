import { TypedEventEmitter } from './TypedEventEmitter';

type OrderEvents = {
  'order:confirmed': { orderId: string; customerId: string; total: number };
  'order:shipped': { orderId: string; trackingCode: string };
  'order:cancelled': { orderId: string; reason: string };
};

export class OrderEventBus extends TypedEventEmitter<OrderEvents> {
  private static instance: OrderEventBus | null = null;

  private constructor() {
    super();
  }

  static getInstance(): OrderEventBus {
    if (OrderEventBus.instance === null) {
      OrderEventBus.instance = new OrderEventBus();
    }
    return OrderEventBus.instance;
  }

  static resetForTesting(): void {
    OrderEventBus.instance = null;
  }
}
