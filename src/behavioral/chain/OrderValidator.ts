import { PendingOrder, ValidationResult } from '../../types';

export abstract class OrderValidator {
  protected next: OrderValidator | null = null;

  setNext(validator: OrderValidator): OrderValidator {
    this.next = validator;
    return validator;
  }

  async validate(order: PendingOrder): Promise<ValidationResult> {
    if (this.next) {
      return this.next.validate(order);
    }
    return { valid: true };
  }
}

export class StockValidator extends OrderValidator {
  constructor(private readonly inventory: Map<string, number>) {
    super();
  }

  async validate(order: PendingOrder): Promise<ValidationResult> {
    for (const item of order.items) {
      const available = this.inventory.get(item.productId) ?? 0;
      if (available < item.quantity) {
        return {
          valid: false,
          reason: `Insufficient stock for product ${item.productId}: available ${available}, requested ${item.quantity}`,
        };
      }
    }
    return super.validate(order);
  }
}

export class AddressValidator extends OrderValidator {
  private readonly blacklistedCountries: Set<string>;

  constructor(blacklistedCountries: string[] = []) {
    super();
    this.blacklistedCountries = new Set(blacklistedCountries.map((c) => c.toUpperCase()));
  }

  async validate(order: PendingOrder): Promise<ValidationResult> {
    const country = (order.shippingAddress.country ?? 'BR').toUpperCase();
    if (this.blacklistedCountries.has(country)) {
      return {
        valid: false,
        reason: `Shipping to ${country} is not available`,
      };
    }
    if (!order.shippingAddress.zip || order.shippingAddress.zip.length < 5) {
      return {
        valid: false,
        reason: 'Invalid shipping address: zip code is required',
      };
    }
    return super.validate(order);
  }
}

export class CreditValidator extends OrderValidator {
  constructor(private readonly customersWithDebt: Set<string>) {
    super();
  }

  async validate(order: PendingOrder): Promise<ValidationResult> {
    if (this.customersWithDebt.has(order.customerId)) {
      return {
        valid: false,
        reason: `Customer ${order.customerId} has pending debt`,
      };
    }
    return super.validate(order);
  }
}

export class ComplianceValidator extends OrderValidator {
  private readonly maxOrderTotal: number;

  constructor(maxOrderTotal: number = 500_000) {
    super();
    this.maxOrderTotal = maxOrderTotal;
  }

  async validate(order: PendingOrder): Promise<ValidationResult> {
    if (order.total > this.maxOrderTotal) {
      return {
        valid: false,
        reason: `Order total R$ ${order.total} exceeds maximum allowed R$ ${this.maxOrderTotal}`,
      };
    }
    return super.validate(order);
  }
}
