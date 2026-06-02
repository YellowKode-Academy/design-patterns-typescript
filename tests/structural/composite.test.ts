import { Category, CategoryGroup } from '../../src/structural/composite/CategoryComponent';

describe('Composite - CategoryTree', () => {
  it('Category eh uma folha com total 1', () => {
    const cat = new Category('Notebooks');
    expect(cat.isLeaf()).toBe(true);
    expect(cat.getTotal()).toBe(1);
    expect(cat.getName()).toBe('Notebooks');
  });

  it('CategoryGroup eh um composto com isLeaf false', () => {
    const group = new CategoryGroup('Eletronicos');
    expect(group.isLeaf()).toBe(false);
  });

  it('getTotal retorna soma das subcategorias', () => {
    const group = new CategoryGroup('Eletronicos');
    group.add(new Category('Notebooks'));
    group.add(new Category('Tablets'));
    group.add(new Category('Smartphones'));
    expect(group.getTotal()).toBe(3);
  });

  it('suporta arvore de multiplos niveis', () => {
    const root = new CategoryGroup('Tudo');
    const eletronicos = new CategoryGroup('Eletronicos');
    const vestuario = new CategoryGroup('Vestuario');

    eletronicos.add(new Category('Notebooks'));
    eletronicos.add(new Category('Tablets'));

    vestuario.add(new Category('Camisetas'));
    vestuario.add(new Category('Calcas'));
    vestuario.add(new Category('Sapatos'));

    root.add(eletronicos);
    root.add(vestuario);

    expect(root.getTotal()).toBe(5);
    expect(eletronicos.getTotal()).toBe(2);
    expect(vestuario.getTotal()).toBe(3);
  });

  it('remove subcategoria corretamente', () => {
    const group = new CategoryGroup('Grupo');
    const cat = new Category('Remover');
    group.add(cat);
    group.add(new Category('Manter'));
    expect(group.getTotal()).toBe(2);
    group.remove(cat);
    expect(group.getTotal()).toBe(1);
  });

  it('grupo vazio tem total 0', () => {
    const group = new CategoryGroup('Vazio');
    expect(group.getTotal()).toBe(0);
  });
});
