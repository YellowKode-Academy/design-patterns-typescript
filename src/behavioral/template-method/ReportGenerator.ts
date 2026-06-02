import { Product } from '../../types';

export abstract class ReportGenerator {
  generate(data: Product[]): string {
    const filtered = this.filter(data);
    const sorted = this.sort(filtered);
    return this.format(sorted);
  }

  protected filter(data: Product[]): Product[] {
    return data;
  }

  protected sort(data: Product[]): Product[] {
    return data;
  }

  protected abstract format(data: Product[]): string;
}

export class CsvReportGenerator extends ReportGenerator {
  protected sort(data: Product[]): Product[] {
    return [...data].sort((a, b) => a.name.localeCompare(b.name));
  }

  protected format(data: Product[]): string {
    const header = 'id,name,price,stock,categoryId';
    const rows = data.map(
      (p) => `${p.id},${p.name},${p.price},${p.stock},${p.categoryId}`
    );
    return [header, ...rows].join('\n');
  }
}

export class JsonReportGenerator extends ReportGenerator {
  protected filter(data: Product[]): Product[] {
    return data.filter((p) => p.stock > 0);
  }

  protected format(data: Product[]): string {
    return JSON.stringify(data, null, 2);
  }
}

export class LowStockReportGenerator extends ReportGenerator {
  constructor(private readonly threshold: number = 5) {
    super();
  }

  protected filter(data: Product[]): Product[] {
    return data.filter((p) => p.stock <= this.threshold);
  }

  protected sort(data: Product[]): Product[] {
    return [...data].sort((a, b) => a.stock - b.stock);
  }

  protected format(data: Product[]): string {
    return data
      .map((p) => `[LOW STOCK] ${p.name}: ${p.stock} unidades (R$ ${p.price})`)
      .join('\n');
  }
}
