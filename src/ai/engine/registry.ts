import type { ActionHandler, ActionRegistry } from "./types";

export class HandlerRegistry {
  private registry: ActionRegistry = {};

  register(actionType: string, handler: ActionHandler): void {
    this.registry[actionType] = handler;
  }

  get(actionType: string): ActionHandler | undefined {
    return this.registry[actionType];
  }

  has(actionType: string): boolean {
    return actionType in this.registry;
  }

  getRegisteredTypes(): string[] {
    return Object.keys(this.registry);
  }
}

// Singleton instance
let registryInstance: HandlerRegistry | null = null;

export function getRegistry(): HandlerRegistry {
  if (!registryInstance) {
    registryInstance = new HandlerRegistry();
  }
  return registryInstance;
}

export function resetRegistry(): void {
  registryInstance = null;
}
