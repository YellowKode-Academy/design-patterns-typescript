import {
  ProductCatalogIterator,
} from '../../src/behavioral/iterator/ProductCatalogIterator';
import { Product } from '../../src/types';

const products: Product[] = [
  { id: 'p1', name: 'Notebook', price: 3500, stock: 10, categoryId: 'electronics' },
  { id: 'p2', name: 'Mouse', price: 120, stock: 50, categoryId: 'electronics' },
  { id: 'p3', name: 'Camiseta', price: 80, stock: 0, categoryId: 'clothing' },
  { id: 'p4', name: 'Teclado', price: 250, stock: 15, categoryId: 'electronics' },
  { id: 'p5', name: 'Monitor', price: 1200, stock: 5, categoryId: 'electronics' },
];

describe('Iterator - ProductCatalogIterator', () => {
  it('itera sobre todos os produtos sem filtro', () => {
    const iterator = new ProductCatalogIterator(products);
    const result = Array.from(iterator);
    expect(result).toHaveLength(5);
  });

  it('filtra por categoria corretamente', () => {
    const iterator = new ProductCatalogIterator(products, { categoryId: 'electronics' });
    const result = iterator.toArray();
    expect(result).toHaveLength(4);
    expect(result.every((p) => p.categoryId === 'electronics')).toBe(true);
  });

  it('filtra produtos em estoque', () => {
    const iterator = new ProductCatalogIterator(products, { inStock: true });
    const result = iterator.toArray();
    expect(result.every((p) => p.stock > 0)).toBe(true);
    expect(result).toHaveLength(4);
  });

  it('filtra por faixa de preco', () => {
    const iterator = new ProductCatalogIterator(products, { minPrice: 100, maxPrice: 500 });
    const result = iterator.toArray();
    expect(result.every((p) => p.price >= 100 && p.price <= 500)).toBe(true);
  });

  it('combina multiplos filtros', () => {
    const iterator = new ProductCatalogIterator(products, {
      categoryId: 'electronics',
      inStock: true,
      maxPrice: 300,
    });
    const result = iterator.toArray();
    expect(result.every((p) => p.categoryId === 'electronics' && p.stock > 0 && p.price <= 300)).toBe(true);
  });

  it('funciona com for...of loop nativo', () => {
    const iterator = new ProductCatalogIterator(products, { categoryId: 'clothing' });
    const names: string[] = [];
    for (const product of iterator) {
      names.push(product.name);
    }
    expect(names).toContain('Camiseta');
  });

  it('retorna array vazio se nenhum produto corresponde ao filtro', () => {
    const iterator = new ProductCatalogIterator(products, { categoryId: 'nao_existe' });
    expect(iterator.toArray()).toHaveLength(0);
  });
});
