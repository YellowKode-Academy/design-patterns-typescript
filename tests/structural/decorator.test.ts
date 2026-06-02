import { Logger } from '../../src/creational/singleton/Logger';
import {
  InMemoryProductService,
} from '../../src/structural/decorator/ProductService';
import { CachingProductService } from '../../src/structural/decorator/CachingProductService';
import { LoggingProductService } from '../../src/structural/decorator/LoggingProductService';
import { Product } from '../../src/types';

const sampleProducts: Product[] = [
  { id: 'p1', name: 'Notebook', price: 3500, stock: 10, categoryId: 'electronics' },
  { id: 'p2', name: 'Mouse', price: 120, stock: 50, categoryId: 'electronics' },
  { id: 'p3', name: 'Teclado', price: 200, stock: 30, categoryId: 'electronics' },
];

beforeEach(() => {
  Logger.resetForTesting();
});

describe('Decorator - ProductService', () => {
  describe('InMemoryProductService', () => {
    it('retorna produto pelo id', async () => {
      const service = new InMemoryProductService();
      service.seed(sampleProducts);
      const product = await service.getProduct('p1');
      expect(product.name).toBe('Notebook');
    });

    it('lanca erro para produto inexistente', async () => {
      const service = new InMemoryProductService();
      service.seed(sampleProducts);
      await expect(service.getProduct('nao_existe')).rejects.toThrow('not found');
    });

    it('filtra produtos por categoria', async () => {
      const service = new InMemoryProductService();
      service.seed(sampleProducts);
      const products = await service.getProducts({ categoryId: 'electronics' });
      expect(products).toHaveLength(3);
    });
  });

  describe('CachingProductService', () => {
    it('retorna dados do cache na segunda chamada', async () => {
      const inner = new InMemoryProductService();
      inner.seed(sampleProducts);
      const caching = new CachingProductService(inner);

      await caching.getProduct('p1');
      const stats1 = caching.getCacheStats();
      expect(stats1.misses).toBe(1);
      expect(stats1.hits).toBe(0);

      await caching.getProduct('p1');
      const stats2 = caching.getCacheStats();
      expect(stats2.hits).toBe(1);
      expect(stats2.misses).toBe(1);
    });

    it('invalida cache ao atualizar produto', async () => {
      const inner = new InMemoryProductService();
      inner.seed(sampleProducts);
      const caching = new CachingProductService(inner);

      await caching.getProduct('p1');
      await caching.updateProduct('p1', { price: 3999 });
      await caching.getProduct('p1');

      // Apos update, cache invalido, segunda chamada vai buscar novamente
      expect(caching.getCacheStats().misses).toBe(2);
    });

    it('TTL expirado retorna miss', async () => {
      const inner = new InMemoryProductService();
      inner.seed(sampleProducts);
      const caching = new CachingProductService(inner, 1); // TTL de 1ms

      await caching.getProduct('p1');
      await new Promise((r) => setTimeout(r, 5)); // espera TTL expirar
      await caching.getProduct('p1');
      expect(caching.getCacheStats().misses).toBe(2);
    });
  });

  describe('LoggingProductService', () => {
    it('registra chamada getProduct no Logger', async () => {
      const inner = new InMemoryProductService();
      inner.seed(sampleProducts);
      const logging = new LoggingProductService(inner);
      const logger = Logger.getInstance();

      await logging.getProduct('p1');

      const logs = logger.getLogs();
      expect(logs.some((l) => l.message.includes('getProduct'))).toBe(true);
    });

    it('registra erro quando produto nao existe', async () => {
      const inner = new InMemoryProductService();
      inner.seed(sampleProducts);
      const logging = new LoggingProductService(inner);
      const logger = Logger.getInstance();

      await expect(logging.getProduct('inexistente')).rejects.toThrow();
      const logs = logger.getLogs();
      expect(logs.some((l) => l.level === 'error')).toBe(true);
    });
  });

  describe('Composicao: Logging(Caching(InMemory))', () => {
    it('logging envolve caching que envolve in-memory', async () => {
      const inner = new InMemoryProductService();
      inner.seed(sampleProducts);
      const caching = new CachingProductService(inner);
      const logging = new LoggingProductService(caching);
      const logger = Logger.getInstance();

      await logging.getProduct('p2');
      await logging.getProduct('p2');

      const logs = logger.getLogs();
      expect(logs.filter((l) => l.message.includes('getProduct'))).toHaveLength(4); // 2x called + 2x success
      expect(caching.getCacheStats().hits).toBe(1);
    });
  });
});
