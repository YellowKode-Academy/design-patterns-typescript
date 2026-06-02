import { Cart, OrderItem, PendingOrder } from '../../types';
import { CheckoutResult } from '../../creational/abstract-factory/PaymentGateway';

export interface CartService {
  getCart(cartId: string): Promise<Cart>;
  clearCart(cartId: string): Promise<void>;
}

export interface InventoryService {
  reserveItems(items: OrderItem[]): Promise<void>;
  releaseItems(items: OrderItem[]): Promise<void>;
}

export interface OrderService {
  createOrder(order: PendingOrder): Promise<{ id: string }>;
  confirmOrder(orderId: string): Promise<void>;
}

export interface GatewayService {
  createCheckout(orderId: string, amount: number): Promise<CheckoutResult>;
}

export interface NotificationDispatcher {
  send(userId: string, message: string): Promise<void>;
}

export type CheckoutFacadeResult = {
  orderId: string;
  paymentUrl: string;
  sessionId: string;
};

export class CheckoutFacade {
  constructor(
    private readonly cartService: CartService,
    private readonly inventoryService: InventoryService,
    private readonly orderService: OrderService,
    private readonly gatewayService: GatewayService,
    private readonly notificationDispatcher: NotificationDispatcher
  ) {}

  async checkout(customerId: string, cartId: string): Promise<CheckoutFacadeResult> {
    const cart = await this.cartService.getCart(cartId);

    await this.inventoryService.reserveItems(cart.items);

    const pendingOrder: PendingOrder = {
      id: `pending_${cartId}`,
      customerId,
      items: cart.items,
      total: cart.subtotal,
      shippingAddress: {
        street: 'Rua Padrao',
        city: 'Sao Paulo',
        state: 'SP',
        zip: '01001-000',
        country: 'BR',
      },
    };

    const { id: orderId } = await this.orderService.createOrder(pendingOrder);

    let checkout: CheckoutResult;
    try {
      checkout = await this.gatewayService.createCheckout(orderId, cart.subtotal);
    } catch (err) {
      await this.inventoryService.releaseItems(cart.items);
      throw err;
    }

    await this.orderService.confirmOrder(orderId);
    await this.cartService.clearCart(cartId);
    await this.notificationDispatcher.send(
      customerId,
      `Pedido ${orderId} confirmado. Acesse o link para pagar.`
    );

    return {
      orderId,
      paymentUrl: checkout.paymentUrl,
      sessionId: checkout.sessionId,
    };
  }
}
