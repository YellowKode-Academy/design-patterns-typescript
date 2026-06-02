export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
};

export type PaymentMethod = {
  type: 'credit_card' | 'pix' | 'boleto';
  last4?: string;
  brand?: string;
};

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type Cart = {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  itemCount: number;
};

export type PendingOrder = {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: Address;
};

export type ValidationResult = {
  valid: boolean;
  reason?: string;
};
