import {
  StockValidator,
  AddressValidator,
  CreditValidator,
  ComplianceValidator,
} from '../../src/behavioral/chain/OrderValidator';
import { PendingOrder } from '../../src/types';

function makeOrder(overrides: Partial<PendingOrder> = {}): PendingOrder {
  return {
    id: 'ord_001',
    customerId: 'cust_valid',
    items: [{ productId: 'p1', quantity: 2, unitPrice: 100 }],
    total: 200,
    shippingAddress: {
      street: 'Rua das Flores, 100',
      city: 'Sao Paulo',
      state: 'SP',
      zip: '01310-100',
      country: 'BR',
    },
    ...overrides,
  };
}

describe('Chain of Responsibility - OrderValidator', () => {
  describe('StockValidator', () => {
    it('valida pedido quando ha estoque suficiente', async () => {
      const inventory = new Map([['p1', 10]]);
      const validator = new StockValidator(inventory);
      const result = await validator.validate(makeOrder());
      expect(result.valid).toBe(true);
    });

    it('invalida pedido quando estoque e insuficiente', async () => {
      const inventory = new Map([['p1', 1]]);
      const validator = new StockValidator(inventory);
      const result = await validator.validate(makeOrder());
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('p1');
    });

    it('invalida quando produto nao existe no inventario', async () => {
      const inventory = new Map<string, number>();
      const validator = new StockValidator(inventory);
      const result = await validator.validate(makeOrder());
      expect(result.valid).toBe(false);
    });
  });

  describe('AddressValidator', () => {
    it('valida endereco sem pais na lista negra', async () => {
      const validator = new AddressValidator(['DPRK', 'CU']);
      const result = await validator.validate(makeOrder());
      expect(result.valid).toBe(true);
    });

    it('invalida pedido para pais na lista negra', async () => {
      const validator = new AddressValidator(['DPRK', 'CU']);
      const order = makeOrder({ shippingAddress: { street: '', city: '', state: '', zip: '12345', country: 'DPRK' } });
      const result = await validator.validate(order);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('DPRK');
    });

    it('invalida endereco sem zip code', async () => {
      const validator = new AddressValidator();
      const order = makeOrder({ shippingAddress: { street: '', city: '', state: '', zip: '' } });
      const result = await validator.validate(order);
      expect(result.valid).toBe(false);
    });
  });

  describe('CreditValidator', () => {
    it('valida cliente sem debito', async () => {
      const debtors = new Set(['cust_bad']);
      const validator = new CreditValidator(debtors);
      const result = await validator.validate(makeOrder());
      expect(result.valid).toBe(true);
    });

    it('invalida cliente com debito pendente', async () => {
      const debtors = new Set(['cust_valid']);
      const validator = new CreditValidator(debtors);
      const result = await validator.validate(makeOrder());
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('cust_valid');
    });
  });

  describe('ComplianceValidator', () => {
    it('valida pedido dentro do limite', async () => {
      const validator = new ComplianceValidator(500_000);
      const result = await validator.validate(makeOrder({ total: 200 }));
      expect(result.valid).toBe(true);
    });

    it('invalida pedido acima do limite', async () => {
      const validator = new ComplianceValidator(100);
      const result = await validator.validate(makeOrder({ total: 200 }));
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('200');
    });
  });

  describe('Chain completa com 4 validators', () => {
    function buildChain() {
      const inventory = new Map([['p1', 10]]);
      const debtors = new Set<string>();
      const blacklist: string[] = ['DPRK'];

      const stock = new StockValidator(inventory);
      const address = new AddressValidator(blacklist);
      const credit = new CreditValidator(debtors);
      const compliance = new ComplianceValidator(500_000);

      stock.setNext(address).setNext(credit).setNext(compliance);
      return stock;
    }

    it('pedido valido passa por toda a chain', async () => {
      const chain = buildChain();
      const result = await chain.validate(makeOrder());
      expect(result.valid).toBe(true);
    });

    it('chain para no StockValidator quando estoque insuficiente', async () => {
      const inventory = new Map([['p1', 0]]);
      const stock = new StockValidator(inventory);
      const address = new AddressValidator();
      stock.setNext(address);
      const result = await stock.validate(makeOrder());
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Insufficient stock');
    });

    it('chain para no CreditValidator quando cliente tem debito', async () => {
      const inventory = new Map([['p1', 10]]);
      const debtors = new Set(['cust_valid']);
      const stock = new StockValidator(inventory);
      const credit = new CreditValidator(debtors);
      stock.setNext(credit);
      const result = await stock.validate(makeOrder());
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('debt');
    });

    it('setNext retorna o proximo validator para encadeamento', () => {
      const stock = new StockValidator(new Map());
      const address = new AddressValidator();
      const returned = stock.setNext(address);
      expect(returned).toBe(address);
    });
  });
});
