type Listener<T> = (data: T) => void;

export class TypedEventEmitter<TEvents extends Record<string, unknown>> {
  private listeners: Map<keyof TEvents, Array<Listener<unknown>>> = new Map();

  on<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener as Listener<unknown>);
  }

  off<K extends keyof TEvents>(event: K, listener: Listener<TEvents[K]>): void {
    const list = this.listeners.get(event);
    if (!list) return;
    const index = list.indexOf(listener as Listener<unknown>);
    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const list = this.listeners.get(event);
    if (!list) return;
    for (const listener of [...list]) {
      listener(data);
    }
  }

  listenerCount(event: keyof TEvents): number {
    return this.listeners.get(event)?.length ?? 0;
  }
}
