import { Product } from '../../types';
import { Logger } from '../../creational/singleton/Logger';
import { ProductService } from './ProductService';

export class LoggingProductService implements ProductService {
  private logger = Logger.getInstance();

  constructor(private readonly inner: ProductService) {}

  async getProduct(id: string): Promise<Product> {
    this.logger.info('ProductService.getProduct called', { id });
    try {
      const product = await this.inner.getProduct(id);
      this.logger.info('ProductService.getProduct success', { id });
      return product;
    } catch (err) {
      this.logger.error('ProductService.getProduct error', { id, err });
      throw err;
    }
  }

  async getProducts(filters: Record<string, unknown>): Promise<Product[]> {
    this.logger.info('ProductService.getProducts called', { filters });
    const products = await this.inner.getProducts(filters);
    this.logger.info('ProductService.getProducts success', { count: products.length });
    return products;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    this.logger.info('ProductService.updateProduct called', { id, data });
    const product = await this.inner.updateProduct(id, data);
    this.logger.info('ProductService.updateProduct success', { id });
    return product;
  }
}
