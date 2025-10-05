import type { EventMap, EventHandler } from "@scenoghetto/types";

export class EventBus {
  private readonly listeners = new Map<keyof EventMap, Set<unknown>>();
  private boundHandler?: (event: MessageEvent) => void;

  constructor(
    readonly windowProxy: WindowProxy,
    private readonly targetOrigin: string,
  ) {}

  listen() {
    if (!this.boundHandler) {
      this.boundHandler = this.handleEvent.bind(this);
      window.addEventListener("message", this.boundHandler);
    }

    return () => {
      this.clearListeners();
      this.unlisten();
    };
  }

  clearListeners() {
    this.listeners.clear();
  }

  unlisten() {
    if (this.boundHandler) {
      window.removeEventListener("message", this.boundHandler);
      this.boundHandler = undefined;
    }
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

  once<T extends keyof EventMap>(event: T, callback: EventHandler<T>) {
    const wrappedCallback = (data: EventMap[T]) => {
      callback(data);
      this.off(event, wrappedCallback);
    };

    return this.on(event, wrappedCallback);
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
