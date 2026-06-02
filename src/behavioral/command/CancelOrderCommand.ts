import { OrderStatus } from '../../types';
import { Command } from './Command';

export type SimpleOrder = {
  id: string;
  status: OrderStatus;
  customerId: string;
  total: number;
};

export class CancelOrderCommand implements Command {
  private previousStatus: OrderStatus | null = null;

  constructor(
    private readonly orderStore: Map<string, SimpleOrder>,
    private readonly orderId: string,
    private readonly reason: string
  ) {}

  async execute(): Promise<void> {
    const order = this.orderStore.get(this.orderId);
    if (!order) {
      throw new Error(`Order ${this.orderId} not found`);
    }
    if (order.status === 'cancelled') {
      throw new Error('Order is already cancelled');
    }
    this.previousStatus = order.status;
    this.orderStore.set(this.orderId, { ...order, status: 'cancelled' });
  }

  async undo(): Promise<void> {
    if (this.previousStatus === null) {
      throw new Error('Cannot undo: command was not executed');
    }
    const order = this.orderStore.get(this.orderId);
    if (!order) {
      throw new Error(`Order ${this.orderId} not found`);
    }
    this.orderStore.set(this.orderId, { ...order, status: this.previousStatus });
  }

  describe(): {
    action: string;
    targetId: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  } {
    return {
      action: 'cancel_order',
      targetId: this.orderId,
      before: { status: this.previousStatus },
      after: { status: 'cancelled', reason: this.reason },
    };
  }
}
