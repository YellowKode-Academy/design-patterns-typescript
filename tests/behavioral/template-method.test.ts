import {
  CsvReportGenerator,
  JsonReportGenerator,
  LowStockReportGenerator,
} from '../../src/behavioral/template-method/ReportGenerator';
import { Product } from '../../src/types';

const products: Product[] = [
  { id: 'p1', name: 'Notebook', price: 3500, stock: 10, categoryId: 'electronics' },
  { id: 'p2', name: 'Mouse', price: 120, stock: 2, categoryId: 'electronics' },
  { id: 'p3', name: 'Teclado', price: 200, stock: 0, categoryId: 'electronics' },
  { id: 'p4', name: 'Monitor', price: 1200, stock: 5, categoryId: 'electronics' },
];

describe('Template Method - ReportGenerator', () => {
  describe('CsvReportGenerator', () => {
    it('gera header CSV corretamente', () => {
      const generator = new CsvReportGenerator();
      const report = generator.generate(products);
      expect(report.startsWith('id,name,price,stock,categoryId')).toBe(true);
    });

    it('inclui todos os produtos no CSV', () => {
      const generator = new CsvReportGenerator();
      const report = generator.generate(products);
      const lines = report.split('\n');
      expect(lines).toHaveLength(5); // header + 4 produtos
    });

    it('ordena produtos por nome alfabeticamente', () => {
      const generator = new CsvReportGenerator();
      const report = generator.generate(products);
      const lines = report.split('\n').slice(1);
      const names = lines.map((l) => l.split(',')[1]);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
    });
  });

  describe('JsonReportGenerator', () => {
    it('gera JSON valido', () => {
      const generator = new JsonReportGenerator();
      const report = generator.generate(products);
      expect(() => JSON.parse(report)).not.toThrow();
    });

    it('filtra produtos sem estoque', () => {
      const generator = new JsonReportGenerator();
      const report = generator.generate(products);
      const parsed: Product[] = JSON.parse(report);
      expect(parsed.every((p) => p.stock > 0)).toBe(true);
      // Teclado com stock=0 deve ser excluido
      expect(parsed.find((p) => p.id === 'p3')).toBeUndefined();
    });

    it('inclui produtos com estoque positivo', () => {
      const generator = new JsonReportGenerator();
      const report = generator.generate(products);
      const parsed: Product[] = JSON.parse(report);
      expect(parsed.find((p) => p.id === 'p1')).toBeDefined();
    });
  });

  describe('LowStockReportGenerator', () => {
    it('identifica produtos com estoque baixo', () => {
      const generator = new LowStockReportGenerator(5);
      const report = generator.generate(products);
      expect(report).toContain('[LOW STOCK]');
      expect(report).toContain('Mouse');
      expect(report).toContain('Teclado');
    });

    it('ordena por estoque crescente', () => {
      const generator = new LowStockReportGenerator(5);
      const report = generator.generate(products);
      const lines = report.split('\n');
      // Teclado (0) deve vir antes de Mouse (2)
      const tecladoIdx = lines.findIndex((l) => l.includes('Teclado'));
      const mouseIdx = lines.findIndex((l) => l.includes('Mouse'));
      expect(tecladoIdx).toBeLessThan(mouseIdx);
    });

    it('nao inclui produtos com estoque acima do threshold', () => {
      const generator = new LowStockReportGenerator(3);
      const report = generator.generate(products);
      expect(report).not.toContain('Notebook');
    });
  });
});
