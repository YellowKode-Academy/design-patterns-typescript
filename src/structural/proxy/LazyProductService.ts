import { Product } from '../../types';
import { ProductService, InMemoryProductService } from '../decorator/ProductService';

export class LazyProductService implements ProductService {
  private service: InMemoryProductService | null = null;
  private initCount = 0;

  private getService(): InMemoryProductService {
    if (this.service === null) {
      this.initCount++;
      this.service = new InMemoryProductService();
      this.service.seed([
        { id: 'p1', name: 'Notebook', price: 3500, stock: 10, categoryId: 'electronics' },
        { id: 'p2', name: 'Mouse', price: 120, stock: 50, categoryId: 'electronics' },
      ]);
    }
    return this.service;
  }

  async getProduct(id: string): Promise<Product> {
    return this.getService().getProduct(id);
  }

  async getProducts(filters: Record<string, unknown>): Promise<Product[]> {
    return this.getService().getProducts(filters);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.getService().updateProduct(id, data);
  }

  getInitCount(): number {
    return this.initCount;
  }

  wasInitialized(): boolean {
    return this.service !== null;
  }
}
