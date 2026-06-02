import { Cart } from '../../types';

export interface DiscountStrategy {
  calculate(cart: Cart): Promise<number>;
  describe(): string;
}

export class PercentageDiscountStrategy implements DiscountStrategy {
  constructor(private readonly percentage: number) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
  }

  async calculate(cart: Cart): Promise<number> {
    return Math.round(cart.subtotal * (this.percentage / 100) * 100) / 100;
  }

  describe(): string {
    return `${this.percentage}% discount on subtotal`;
  }
}

export class ProgressiveDiscountStrategy implements DiscountStrategy {
  async calculate(cart: Cart): Promise<number> {
    const count = cart.itemCount;
    let rate = 0;
    if (count >= 10) {
      rate = 0.2;
    } else if (count >= 5) {
      rate = 0.1;
    } else if (count >= 3) {
      rate = 0.05;
    }
    return Math.round(cart.subtotal * rate * 100) / 100;
  }

  describe(): string {
    return 'Progressive discount: 5% for 3+, 10% for 5+, 20% for 10+ items';
  }
}

type UserTier = 'standard' | 'premium' | 'gold';

export class PremiumUserDiscountStrategy implements DiscountStrategy {
  constructor(private readonly tier: UserTier) {}

  async calculate(cart: Cart): Promise<number> {
    let rate = 0;
    if (this.tier === 'gold') {
      rate = 0.2;
    } else if (this.tier === 'premium') {
      rate = 0.15;
    }
    return Math.round(cart.subtotal * rate * 100) / 100;
  }

  describe(): string {
    return `Premium discount for ${this.tier} users`;
  }
}

export class CouponDiscountStrategy implements DiscountStrategy {
  private static validCoupons: Map<string, number> = new Map([
    ['SAVE10', 10],
    ['SAVE20', 20],
    ['WELCOME', 15],
  ]);

  constructor(private readonly couponCode: string) {}

  async calculate(cart: Cart): Promise<number> {
    const percentage = CouponDiscountStrategy.validCoupons.get(this.couponCode);
    if (!percentage) return 0;
    return Math.round(cart.subtotal * (percentage / 100) * 100) / 100;
  }

  describe(): string {
    return `Coupon discount: ${this.couponCode}`;
  }
}
