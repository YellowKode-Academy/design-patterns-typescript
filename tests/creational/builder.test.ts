import { OrderBuilder } from '../../src/creational/builder/OrderBuilder';
import { Address, OrderItem, PaymentMethod } from '../../src/types';

const address: Address = {
  street: 'Av. Paulista, 1000',
  city: 'Sao Paulo',
  state: 'SP',
  zip: '01310-100',
  country: 'BR',
};

const item: OrderItem = {
  productId: 'p1',
  quantity: 2,
  unitPrice: 100,
};

const payment: PaymentMethod = {
  type: 'credit_card',
  last4: '4242',
  brand: 'visa',
};

describe('Builder - OrderBuilder', () => {
  it('cria pedido simples com campos obrigatorios', () => {
    const order = new OrderBuilder()
      .forCustomer('cust_001')
      .withItem(item)
      .shippingTo(address)
      .payWith(payment)
      .build();

    expect(order.customerId).toBe('cust_001');
    expect(order.items).toHaveLength(1);
    expect(order.status).toBe('pending');
    expect(order.createdAt).toBeInstanceOf(Date);
  });

  it('calcula subtotal, taxa e total corretamente', () => {
    const order = new OrderBuilder()
      .forCustomer('cust_002')
      .withItem({ productId: 'p1', quantity: 3, unitPrice: 200 })
      .shippingTo(address)
      .payWith(payment)
      .withShipping(20, 'express')
      .build();

    expect(order.subtotal).toBe(600);
    expect(order.shippingCost).toBe(20);
    expect(order.shippingMethod).toBe('express');
    expect(order.total).toBeGreaterThan(600);
  });

  it('cria pedido com todos os campos opcionais', () => {
    const billingAddr: Address = { ...address, city: 'Campinas' };
    const order = new OrderBuilder()
      .forCustomer('cust_003')
      .withItem(item)
      .shippingTo(address)
      .billingTo(billingAddr)
      .payWith(payment)
      .withCoupon('SAVE10', 20)
      .withShipping(15, 'standard')
      .asGift('Feliz Aniversario!')
      .withNotes('Deixar na portaria')
      .build();

    expect(order.couponCode).toBe('SAVE10');
    expect(order.discountAmount).toBe(20);
    expect(order.isGift).toBe(true);
    expect(order.giftMessage).toBe('Feliz Aniversario!');
    expect(order.customerNotes).toBe('Deixar na portaria');
    expect(order.billingAddress.city).toBe('Campinas');
  });

  it('lanca erro se customerId nao for fornecido', () => {
    expect(() =>
      new OrderBuilder()
        .withItem(item)
        .shippingTo(address)
        .payWith(payment)
        .build()
    ).toThrow('Customer ID is required');
  });

  it('lanca erro se nao houver itens', () => {
    expect(() =>
      new OrderBuilder()
        .forCustomer('cust_004')
        .shippingTo(address)
        .payWith(payment)
        .build()
    ).toThrow('Order must have at least one item');
  });

  it('lanca erro se endereco de entrega estiver ausente', () => {
    expect(() =>
      new OrderBuilder()
        .forCustomer('cust_005')
        .withItem(item)
        .payWith(payment)
        .build()
    ).toThrow('Shipping address is required');
  });

  it('lanca erro se metodo de pagamento estiver ausente', () => {
    expect(() =>
      new OrderBuilder()
        .forCustomer('cust_006')
        .withItem(item)
        .shippingTo(address)
        .build()
    ).toThrow('Payment method is required');
  });

  it('encadeamento fluente retorna this em cada passo', () => {
    const builder = new OrderBuilder();
    const result = builder
      .forCustomer('c')
      .withItem(item)
      .shippingTo(address)
      .payWith(payment);
    expect(result).toBe(builder);
  });
});
