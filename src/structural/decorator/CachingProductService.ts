import { Product } from '../../types';
import { ProductService } from './ProductService';

type CacheEntry<T> = { value: T; expiresAt: number };

export class CachingProductService implements ProductService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private hits = 0;
  private misses = 0;

  constructor(
    private readonly inner: ProductService,
    private readonly ttlMs: number = 60_000
  ) {}

  private setCache<T>(key: string, value: T): void {
    this.cache.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async getProduct(id: string): Promise<Product> {
    const cached = this.getCache<Product>(`product:${id}`);
    if (cached) {
      this.hits++;
      return cached;
    }
    this.misses++;
    const product = await this.inner.getProduct(id);
    this.setCache(`product:${id}`, product);
    return product;
  }

  async getProducts(filters: Record<string, unknown>): Promise<Product[]> {
    const key = `products:${JSON.stringify(filters)}`;
    const cached = this.getCache<Product[]>(key);
    if (cached) {
      this.hits++;
      return cached;
    }
    this.misses++;
    const products = await this.inner.getProducts(filters);
    this.setCache(key, products);
    return products;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const product = await this.inner.updateProduct(id, data);
    this.cache.delete(`product:${id}`);
    return product;
  }

  getCacheStats(): { hits: number; misses: number } {
    return { hits: this.hits, misses: this.misses };
  }
}
