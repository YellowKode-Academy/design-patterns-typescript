import { LazyProductService } from '../../src/structural/proxy/LazyProductService';

describe('Proxy - LazyProductService', () => {
  it('nao inicializa o servico antes do primeiro acesso', () => {
    const proxy = new LazyProductService();
    expect(proxy.wasInitialized()).toBe(false);
  });

  it('inicializa o servico apenas na primeira chamada', async () => {
    const proxy = new LazyProductService();
    expect(proxy.getInitCount()).toBe(0);
    await proxy.getProduct('p1');
    expect(proxy.getInitCount()).toBe(1);
  });

  it('nao reinicializa o servico em chamadas subsequentes', async () => {
    const proxy = new LazyProductService();
    await proxy.getProduct('p1');
    await proxy.getProduct('p2');
    await proxy.getProducts({});
    expect(proxy.getInitCount()).toBe(1);
  });

  it('retorna dados corretos apos inicializacao lazy', async () => {
    const proxy = new LazyProductService();
    const product = await proxy.getProduct('p1');
    expect(product.name).toBe('Notebook');
  });

  it('getProducts retorna todos os produtos apos inicializacao', async () => {
    const proxy = new LazyProductService();
    const products = await proxy.getProducts({});
    expect(products.length).toBeGreaterThan(0);
  });
});
