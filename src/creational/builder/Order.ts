import { Address, OrderItem, OrderStatus, PaymentMethod } from '../../types';

export type Order = {
  id: string;
  customerId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  couponCode: string | null;
  discountAmount: number;
  shippingCost: number;
  shippingMethod: 'standard' | 'express' | 'pickup';
  subtotal: number;
  tax: number;
  total: number;
  customerNotes: string | null;
  isGift: boolean;
  giftMessage: string | null;
  status: OrderStatus;
  createdAt: Date;
};
