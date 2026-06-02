import { Product } from '../../types';
import { Command } from './Command';

export class ChangePriceCommand implements Command {
  private previousPrice: number | null = null;

  constructor(
    private readonly productStore: Map<string, Product>,
    private readonly productId: string,
    private readonly newPrice: number
  ) {}

  async execute(): Promise<void> {
    const product = this.productStore.get(this.productId);
    if (!product) {
      throw new Error(`Product ${this.productId} not found`);
    }
    this.previousPrice = product.price;
    this.productStore.set(this.productId, { ...product, price: this.newPrice });
  }

  async undo(): Promise<void> {
    if (this.previousPrice === null) {
      throw new Error('Cannot undo: command was not executed');
    }
    const product = this.productStore.get(this.productId);
    if (!product) {
      throw new Error(`Product ${this.productId} not found`);
    }
    this.productStore.set(this.productId, { ...product, price: this.previousPrice });
  }

  describe(): {
    action: string;
    targetId: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  } {
    return {
      action: 'change_price',
      targetId: this.productId,
      before: { price: this.previousPrice },
      after: { price: this.newPrice },
    };
  }
}
