import {
  PercentageDiscountStrategy,
  ProgressiveDiscountStrategy,
  PremiumUserDiscountStrategy,
  CouponDiscountStrategy,
} from '../../src/behavioral/strategy/DiscountStrategy';
import { Cart } from '../../src/types';

function makeCart(subtotal: number, itemCount: number): Cart {
  return {
    id: 'cart_test',
    userId: 'user_test',
    items: [],
    subtotal,
    itemCount,
  };
}

describe('Strategy - DiscountStrategy', () => {
  describe('PercentageDiscountStrategy', () => {
    it('calcula 10% de desconto corretamente', async () => {
      const strategy = new PercentageDiscountStrategy(10);
      const discount = await strategy.calculate(makeCart(200, 2));
      expect(discount).toBe(20);
    });

    it('calcula 15% de desconto', async () => {
      const strategy = new PercentageDiscountStrategy(15);
      const discount = await strategy.calculate(makeCart(100, 1));
      expect(discount).toBe(15);
    });

    it('lanca erro para porcentagem negativa', () => {
      expect(() => new PercentageDiscountStrategy(-5)).toThrow('between 0 and 100');
    });

    it('lanca erro para porcentagem acima de 100', () => {
      expect(() => new PercentageDiscountStrategy(101)).toThrow('between 0 and 100');
    });

    it('0% retorna desconto zero', async () => {
      const strategy = new PercentageDiscountStrategy(0);
      const discount = await strategy.calculate(makeCart(500, 3));
      expect(discount).toBe(0);
    });
  });

  describe('ProgressiveDiscountStrategy', () => {
    it('0% para menos de 3 itens', async () => {
      const strategy = new ProgressiveDiscountStrategy();
      expect(await strategy.calculate(makeCart(100, 2))).toBe(0);
    });

    it('5% para exatamente 3 itens', async () => {
      const strategy = new ProgressiveDiscountStrategy();
      expect(await strategy.calculate(makeCart(200, 3))).toBe(10);
    });

    it('5% para 4 itens', async () => {
      const strategy = new ProgressiveDiscountStrategy();
      expect(await strategy.calculate(makeCart(200, 4))).toBe(10);
    });

    it('10% para exatamente 5 itens', async () => {
      const strategy = new ProgressiveDiscountStrategy();
      expect(await strategy.calculate(makeCart(200, 5))).toBe(20);
    });

    it('10% para 9 itens', async () => {
      const strategy = new ProgressiveDiscountStrategy();
      expect(await strategy.calculate(makeCart(200, 9))).toBe(20);
    });

    it('20% para 10 ou mais itens', async () => {
      const strategy = new ProgressiveDiscountStrategy();
      expect(await strategy.calculate(makeCart(200, 10))).toBe(40);
      expect(await strategy.calculate(makeCart(200, 15))).toBe(40);
    });
  });

  describe('PremiumUserDiscountStrategy', () => {
    it('0% para usuarios standard', async () => {
      const strategy = new PremiumUserDiscountStrategy('standard');
      expect(await strategy.calculate(makeCart(100, 1))).toBe(0);
    });

    it('15% para usuarios premium', async () => {
      const strategy = new PremiumUserDiscountStrategy('premium');
      expect(await strategy.calculate(makeCart(200, 1))).toBe(30);
    });

    it('20% para usuarios gold', async () => {
      const strategy = new PremiumUserDiscountStrategy('gold');
      expect(await strategy.calculate(makeCart(200, 1))).toBe(40);
    });
  });

  describe('CouponDiscountStrategy', () => {
    it('SAVE10 aplica 10% de desconto', async () => {
      const strategy = new CouponDiscountStrategy('SAVE10');
      expect(await strategy.calculate(makeCart(100, 1))).toBe(10);
    });

    it('SAVE20 aplica 20% de desconto', async () => {
      const strategy = new CouponDiscountStrategy('SAVE20');
      expect(await strategy.calculate(makeCart(100, 1))).toBe(20);
    });

    it('cupom invalido retorna 0', async () => {
      const strategy = new CouponDiscountStrategy('INVALIDO');
      expect(await strategy.calculate(makeCart(100, 1))).toBe(0);
    });
  });
});
