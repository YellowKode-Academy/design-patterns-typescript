import { Product } from '../../types';

export interface ProductService {
  getProduct(id: string): Promise<Product>;
  getProducts(filters: Record<string, unknown>): Promise<Product[]>;
  updateProduct(id: string, data: Partial<Product>): Promise<Product>;
}

export class InMemoryProductService implements ProductService {
  private store: Map<string, Product> = new Map();

  seed(products: Product[]): void {
    for (const p of products) {
      this.store.set(p.id, { ...p });
    }
  }

  async getProduct(id: string): Promise<Product> {
    const product = this.store.get(id);
    if (!product) {
      throw new Error(`Product ${id} not found`);
    }
    return { ...product };
  }

  async getProducts(filters: Record<string, unknown>): Promise<Product[]> {
    let products = Array.from(this.store.values());
    if (filters['categoryId']) {
      products = products.filter((p) => p.categoryId === filters['categoryId']);
    }
    return products.map((p) => ({ ...p }));
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const product = this.store.get(id);
    if (!product) {
      throw new Error(`Product ${id} not found`);
    }
    const updated = { ...product, ...data };
    this.store.set(id, updated);
    return { ...updated };
  }
}
