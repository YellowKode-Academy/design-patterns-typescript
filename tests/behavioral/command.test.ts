import { CommandHistory } from '../../src/behavioral/command/Command';
import { ChangePriceCommand } from '../../src/behavioral/command/ChangePriceCommand';
import { CancelOrderCommand, SimpleOrder } from '../../src/behavioral/command/CancelOrderCommand';
import { Product } from '../../src/types';

function makeProductStore(): Map<string, Product> {
  return new Map([
    ['p1', { id: 'p1', name: 'Notebook', price: 3500, stock: 10, categoryId: 'electronics' }],
    ['p2', { id: 'p2', name: 'Mouse', price: 120, stock: 50, categoryId: 'electronics' }],
  ]);
}

function makeOrderStore(): Map<string, SimpleOrder> {
  return new Map([
    ['ord_001', { id: 'ord_001', status: 'confirmed', customerId: 'c1', total: 500 }],
  ]);
}

describe('Command - ChangePriceCommand', () => {
  it('execute() altera o preco do produto', async () => {
    const store = makeProductStore();
    const cmd = new ChangePriceCommand(store, 'p1', 3999);
    await cmd.execute();
    expect(store.get('p1')?.price).toBe(3999);
  });

  it('undo() restaura o preco anterior', async () => {
    const store = makeProductStore();
    const cmd = new ChangePriceCommand(store, 'p1', 3999);
    await cmd.execute();
    await cmd.undo();
    expect(store.get('p1')?.price).toBe(3500);
  });

  it('describe() retorna os valores antes e depois', async () => {
    const store = makeProductStore();
    const cmd = new ChangePriceCommand(store, 'p1', 3999);
    await cmd.execute();
    const desc = cmd.describe();
    expect(desc.action).toBe('change_price');
    expect(desc.targetId).toBe('p1');
    expect(desc.before).toEqual({ price: 3500 });
    expect(desc.after).toEqual({ price: 3999 });
  });

  it('undo() lanca erro se execute nao foi chamado antes', async () => {
    const store = makeProductStore();
    const cmd = new ChangePriceCommand(store, 'p1', 3999);
    await expect(cmd.undo()).rejects.toThrow('was not executed');
  });
});

describe('Command - CancelOrderCommand', () => {
  it('execute() cancela o pedido', async () => {
    const store = makeOrderStore();
    const cmd = new CancelOrderCommand(store, 'ord_001', 'cliente solicitou');
    await cmd.execute();
    expect(store.get('ord_001')?.status).toBe('cancelled');
  });

  it('undo() restaura o status anterior', async () => {
    const store = makeOrderStore();
    const cmd = new CancelOrderCommand(store, 'ord_001', 'teste');
    await cmd.execute();
    await cmd.undo();
    expect(store.get('ord_001')?.status).toBe('confirmed');
  });

  it('nao pode cancelar pedido ja cancelado', async () => {
    const store = new Map<string, SimpleOrder>([
      ['ord_002', { id: 'ord_002', status: 'cancelled', customerId: 'c2', total: 100 }],
    ]);
    const cmd = new CancelOrderCommand(store, 'ord_002', 'duplicado');
    await expect(cmd.execute()).rejects.toThrow('already cancelled');
  });
});

describe('CommandHistory', () => {
  it('historico registra comandos executados', async () => {
    const store = makeProductStore();
    const history = new CommandHistory();

    const cmd1 = new ChangePriceCommand(store, 'p1', 4000);
    const cmd2 = new ChangePriceCommand(store, 'p2', 150);

    await history.execute(cmd1);
    await history.execute(cmd2);

    expect(history.getHistory()).toHaveLength(2);
  });

  it('undo() desfaz o ultimo comando', async () => {
    const store = makeProductStore();
    const history = new CommandHistory();

    await history.execute(new ChangePriceCommand(store, 'p1', 4000));
    await history.execute(new ChangePriceCommand(store, 'p2', 150));
    await history.undo();

    expect(store.get('p2')?.price).toBe(120);
    expect(store.get('p1')?.price).toBe(4000);
  });

  it('undo() nao faz nada se historico estiver vazio', async () => {
    const history = new CommandHistory();
    await expect(history.undo()).resolves.not.toThrow();
  });
});
