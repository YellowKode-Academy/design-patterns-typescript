import { Address, OrderItem, PaymentMethod } from '../../types';
import { Order } from './Order';

let orderIdCounter = 1;

export class OrderBuilder {
  private customerId!: string;
  private items: OrderItem[] = [];
  private shippingAddress!: Address;
  private billingAddress?: Address;
  private paymentMethod!: PaymentMethod;
  private couponCode: string | null = null;
  private discountAmount = 0;
  private shippingCost = 0;
  private shippingMethod: 'standard' | 'express' | 'pickup' = 'standard';
  private taxRate = 0.12;
  private customerNotes: string | null = null;
  private isGift = false;
  private giftMessage: string | null = null;

  forCustomer(customerId: string): this {
    this.customerId = customerId;
    return this;
  }

  withItem(item: OrderItem): this {
    this.items.push(item);
    return this;
  }

  shippingTo(address: Address): this {
    this.shippingAddress = address;
    return this;
  }

  billingTo(address: Address): this {
    this.billingAddress = address;
    return this;
  }

  payWith(method: PaymentMethod): this {
    this.paymentMethod = method;
    return this;
  }

  withCoupon(code: string, discount: number): this {
    this.couponCode = code;
    this.discountAmount = discount;
    return this;
  }

  withShipping(cost: number, method: 'standard' | 'express' | 'pickup'): this {
    this.shippingCost = cost;
    this.shippingMethod = method;
    return this;
  }

  asGift(message: string): this {
    this.isGift = true;
    this.giftMessage = message;
    return this;
  }

  withNotes(notes: string): this {
    this.customerNotes = notes;
    return this;
  }

  build(): Order {
    if (!this.customerId) {
      throw new Error('Customer ID is required');
    }
    if (this.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    if (!this.shippingAddress) {
      throw new Error('Shipping address is required');
    }
    if (!this.paymentMethod) {
      throw new Error('Payment method is required');
    }

    const subtotal = this.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const taxableAmount = subtotal - this.discountAmount;
    const tax = Math.round(taxableAmount * this.taxRate * 100) / 100;
    const total = taxableAmount + tax + this.shippingCost;

    return {
      id: `order_${orderIdCounter++}`,
      customerId: this.customerId,
      items: [...this.items],
      shippingAddress: this.shippingAddress,
      billingAddress: this.billingAddress ?? this.shippingAddress,
      paymentMethod: this.paymentMethod,
      couponCode: this.couponCode,
      discountAmount: this.discountAmount,
      shippingCost: this.shippingCost,
      shippingMethod: this.shippingMethod,
      subtotal,
      tax,
      total,
      customerNotes: this.customerNotes,
      isGift: this.isGift,
      giftMessage: this.giftMessage,
      status: 'pending',
      createdAt: new Date(),
    };
  }
}
