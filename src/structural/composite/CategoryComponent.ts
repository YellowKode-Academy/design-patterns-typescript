export interface CategoryComponent {
  getName(): string;
  getTotal(): number;
  isLeaf(): boolean;
}

export class Category implements CategoryComponent {
  constructor(private readonly name: string) {}

  getName(): string {
    return this.name;
  }

  getTotal(): number {
    return 1;
  }

  isLeaf(): boolean {
    return true;
  }
}

export class CategoryGroup implements CategoryComponent {
  private children: CategoryComponent[] = [];

  constructor(private readonly name: string) {}

  add(component: CategoryComponent): this {
    this.children.push(component);
    return this;
  }

  remove(component: CategoryComponent): void {
    const index = this.children.indexOf(component);
    if (index >= 0) {
      this.children.splice(index, 1);
    }
  }

  getChildren(): CategoryComponent[] {
    return [...this.children];
  }

  getName(): string {
    return this.name;
  }

  getTotal(): number {
    return this.children.reduce((sum, child) => sum + child.getTotal(), 0);
  }

  isLeaf(): boolean {
    return false;
  }
}
