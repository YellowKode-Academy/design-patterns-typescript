import { Product } from '../../types';

export type ProductFilter = {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

export class ProductCatalogIterator implements Iterable<Product> {
  constructor(
    private readonly products: Product[],
    private readonly filter: ProductFilter = {}
  ) {}

  private matches(product: Product): boolean {
    if (this.filter.categoryId && product.categoryId !== this.filter.categoryId) {
      return false;
    }
    if (this.filter.minPrice !== undefined && product.price < this.filter.minPrice) {
      return false;
    }
    if (this.filter.maxPrice !== undefined && product.price > this.filter.maxPrice) {
      return false;
    }
    if (this.filter.inStock && product.stock <= 0) {
      return false;
    }
    return true;
  }

  [Symbol.iterator](): Iterator<Product> {
    let index = 0;
    const products = this.products;
    const matches = this.matches.bind(this);

    return {
      next(): IteratorResult<Product> {
        while (index < products.length) {
          const product = products[index++];
          if (matches(product)) {
            return { value: product, done: false };
          }
        }
        return { value: undefined as unknown as Product, done: true };
      },
    };
  }

  toArray(): Product[] {
    return Array.from(this);
  }
}
