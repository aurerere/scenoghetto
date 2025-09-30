import type { EventMap, EventHandler } from "@scenoghetto/types";

export class EventBus {
  private readonly listeners = new Map<keyof EventMap, Set<unknown>>();

  constructor(
    readonly windowProxy: WindowProxy,
    private readonly targetOrigin: string,
  ) {}

  listen() {
    window.addEventListener("message", this.handleEvent.bind(this));

    return () => {
      this.clearListeners();
      this.unlisten();
    };
  }

  clearListeners() {
    this.listeners.clear();
  }

  unlisten() {
    window.removeEventListener("message", this.handleEvent.bind(this));
  }

  emit<T extends keyof EventMap>(event: EventMap[T]) {
    this.windowProxy.postMessage(event, this.targetOrigin);
  }

  on<T extends keyof EventMap>(event: T, callback: EventHandler<T>) {
    const handlers = this.listeners.get(event) ?? new Set();
    if (!handlers.has(callback)) {
      handlers.add(callback);
      this.listeners.set(event, handlers);
    }
    return this;
  }

  off<T extends keyof EventMap>(event: T, callback: EventHandler<T>) {
    const handlers = this.listeners.get(event);

    if (!handlers) {
      return;
    }

    handlers.delete(callback);

    if (handlers.size === 0) {
      this.listeners.delete(event);
    }
  }

  private handleEvent<T extends keyof EventMap>(
    event: MessageEvent<EventMap[T]>,
  ) {
    const handlers = this.listeners.get(event.data.type);

    if (!handlers) {
      return;
    }

    for (const handler of handlers) {
      (handler as EventHandler<T>)(event.data);
    }
  }
}
