import {
  CheckoutFacade,
  CartService,
  InventoryService,
  OrderService,
  GatewayService,
  NotificationDispatcher,
} from '../../src/structural/facade/CheckoutFacade';
import { Cart, OrderItem, PendingOrder } from '../../src/types';

function makeCart(): Cart {
  return {
    id: 'cart_001',
    userId: 'user_001',
    items: [{ productId: 'p1', quantity: 1, unitPrice: 299.9 }],
    subtotal: 299.9,
    itemCount: 1,
  };
}

function makeFakeServices() {
  const notifications: Array<{ userId: string; message: string }> = [];
  const reservedItems: OrderItem[][] = [];
  const createdOrders: PendingOrder[] = [];
  const flags = { confirmedOrderId: null as string | null, cartCleared: false };

  const cartService: CartService = {
    getCart: async (_id: string) => makeCart(),
    clearCart: async (_id: string) => { flags.cartCleared = true; },
  };

  const inventoryService: InventoryService = {
    reserveItems: async (items: OrderItem[]) => { reservedItems.push(items); },
    releaseItems: async (_items: OrderItem[]) => {},
  };

  const orderService: OrderService = {
    createOrder: async (order: PendingOrder) => {
      createdOrders.push(order);
      return { id: 'order_generated_001' };
    },
    confirmOrder: async (orderId: string) => { flags.confirmedOrderId = orderId; },
  };

  const gatewayService: GatewayService = {
    createCheckout: async (orderId: string, amount: number) => ({
      sessionId: `session_${orderId}`,
      paymentUrl: `https://pay.example.com/${orderId}?amount=${amount}`,
    }),
  };

  const notificationDispatcher: NotificationDispatcher = {
    send: async (userId: string, message: string) => { notifications.push({ userId, message }); },
  };

  return {
    cartService,
    inventoryService,
    orderService,
    gatewayService,
    notificationDispatcher,
    state: { notifications, reservedItems, createdOrders, flags },
  };
}

describe('Facade - CheckoutFacade', () => {
  it('executa checkout completo com sucesso', async () => {
    const { cartService, inventoryService, orderService, gatewayService, notificationDispatcher, state } =
      makeFakeServices();

    const facade = new CheckoutFacade(
      cartService,
      inventoryService,
      orderService,
      gatewayService,
      notificationDispatcher
    );

    const result = await facade.checkout('user_001', 'cart_001');

    expect(result.orderId).toBe('order_generated_001');
    expect(result.paymentUrl).toContain('order_generated_001');
    expect(result.sessionId).toContain('session_');
  });

  it('reserva itens do inventario durante checkout', async () => {
    const { cartService, inventoryService, orderService, gatewayService, notificationDispatcher, state } =
      makeFakeServices();

    const facade = new CheckoutFacade(
      cartService, inventoryService, orderService, gatewayService, notificationDispatcher
    );

    await facade.checkout('user_001', 'cart_001');
    expect(state.reservedItems).toHaveLength(1);
  });

  it('envia notificacao apos checkout bem sucedido', async () => {
    const { cartService, inventoryService, orderService, gatewayService, notificationDispatcher, state } =
      makeFakeServices();

    const facade = new CheckoutFacade(
      cartService, inventoryService, orderService, gatewayService, notificationDispatcher
    );

    await facade.checkout('user_001', 'cart_001');
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].userId).toBe('user_001');
  });

  it('limpa o carrinho apos checkout', async () => {
    const { cartService, inventoryService, orderService, gatewayService, notificationDispatcher, state } =
      makeFakeServices();

    const facade = new CheckoutFacade(
      cartService, inventoryService, orderService, gatewayService, notificationDispatcher
    );

    await facade.checkout('user_001', 'cart_001');
    expect(state.flags.cartCleared).toBe(true);
  });

  it('libera itens se gateway falhar', async () => {
    const { cartService, inventoryService, orderService, notificationDispatcher } = makeFakeServices();
    let releasedItems: OrderItem[] | null = null;

    const inventoryWithRelease: InventoryService = {
      reserveItems: inventoryService.reserveItems,
      releaseItems: async (items: OrderItem[]) => { releasedItems = items; },
    };

    const failingGateway: GatewayService = {
      createCheckout: async () => { throw new Error('Gateway indisponivel'); },
    };

    const facade = new CheckoutFacade(
      cartService, inventoryWithRelease, orderService, failingGateway, notificationDispatcher
    );

    await expect(facade.checkout('user_001', 'cart_001')).rejects.toThrow('Gateway indisponivel');
    expect(releasedItems).not.toBeNull();
  });
});
