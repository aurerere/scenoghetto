import type { VideoProcessingProgress } from "@scenoghetto/types";

type Handler = (value: VideoProcessingProgress) => void;

class ProgressEmitter {
  private handlersMap = new Map<string, Set<Handler>>();

  registerHandler(id: string, handler: Handler) {
    const handlers = this.handlersMap.get(id) ?? new Set();
    handlers.add(handler);
    this.handlersMap.set(id, handlers);
  }

  unregisterHandler(id: string, handler: Handler) {
    const handlers = this.handlersMap.get(id);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(id: string, progress: VideoProcessingProgress) {
    const handlers = this.handlersMap.get(id);
    if (!handlers) {
      return;
    }
    for (const handler of handlers) {
      handler(progress);
    }
  }
}

export const progressEmitter = new ProgressEmitter();
