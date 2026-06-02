import { TypedEventEmitter } from '../../src/behavioral/observer/TypedEventEmitter';
import { OrderEventBus } from '../../src/behavioral/observer/OrderEventBus';

beforeEach(() => {
  OrderEventBus.resetForTesting();
});

type TestEvents = {
  'user:login': { userId: string; ip: string };
  'user:logout': { userId: string };
};

describe('TypedEventEmitter', () => {
  it('listener e chamado quando evento e emitido', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const received: Array<{ userId: string; ip: string }> = [];

    emitter.on('user:login', (data) => received.push(data));
    emitter.emit('user:login', { userId: 'u1', ip: '127.0.0.1' });

    expect(received).toHaveLength(1);
    expect(received[0].userId).toBe('u1');
  });

  it('off remove o listener corretamente', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const received: string[] = [];

    const listener = (data: { userId: string }) => received.push(data.userId);
    emitter.on('user:logout', listener);
    emitter.emit('user:logout', { userId: 'u2' });
    emitter.off('user:logout', listener);
    emitter.emit('user:logout', { userId: 'u3' });

    expect(received).toHaveLength(1);
    expect(received[0]).toBe('u2');
  });

  it('multiplos listeners no mesmo evento', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const calls: string[] = [];

    emitter.on('user:login', () => calls.push('listener1'));
    emitter.on('user:login', () => calls.push('listener2'));
    emitter.on('user:login', () => calls.push('listener3'));

    emitter.emit('user:login', { userId: 'u1', ip: '10.0.0.1' });
    expect(calls).toHaveLength(3);
    expect(calls).toContain('listener1');
    expect(calls).toContain('listener2');
    expect(calls).toContain('listener3');
  });

  it('listener nao recebe eventos de outros tipos', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    const loginCalls: string[] = [];
    const logoutCalls: string[] = [];

    emitter.on('user:login', (data) => loginCalls.push(data.userId));
    emitter.on('user:logout', (data) => logoutCalls.push(data.userId));

    emitter.emit('user:login', { userId: 'u1', ip: '' });
    expect(loginCalls).toHaveLength(1);
    expect(logoutCalls).toHaveLength(0);
  });

  it('listenerCount retorna numero correto de listeners', () => {
    const emitter = new TypedEventEmitter<TestEvents>();
    expect(emitter.listenerCount('user:login')).toBe(0);
    emitter.on('user:login', () => {});
    emitter.on('user:login', () => {});
    expect(emitter.listenerCount('user:login')).toBe(2);
  });
});

describe('OrderEventBus', () => {
  it('e um singleton', () => {
    const a = OrderEventBus.getInstance();
    const b = OrderEventBus.getInstance();
    expect(a).toBe(b);
  });

  it('emite e recebe order:confirmed corretamente', () => {
    const bus = OrderEventBus.getInstance();
    const events: Array<{ orderId: string; total: number }> = [];

    bus.on('order:confirmed', (data) => events.push(data));
    bus.emit('order:confirmed', { orderId: 'ord_001', customerId: 'c1', total: 299.9 });

    expect(events).toHaveLength(1);
    expect(events[0].orderId).toBe('ord_001');
  });

  it('emite e recebe order:shipped com trackingCode', () => {
    const bus = OrderEventBus.getInstance();
    let trackingCode = '';

    bus.on('order:shipped', (data) => { trackingCode = data.trackingCode; });
    bus.emit('order:shipped', { orderId: 'ord_002', trackingCode: 'BR123456789' });

    expect(trackingCode).toBe('BR123456789');
  });
});
