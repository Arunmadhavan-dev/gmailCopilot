import type { AIAction, ActionExecutionResult } from "../types";
import type { HandlerRegistry } from "./registry";

export class ActionExecutor {
  private registry: HandlerRegistry;

  constructor(registry: HandlerRegistry) {
    this.registry = registry;
  }

  async execute(action: AIAction, token: string): Promise<ActionExecutionResult> {
    const handler = this.registry.get(action.action);

    if (!handler) {
      return {
        success: false,
        action,
        error: `No handler registered for action: ${action.action}`
      };
    }

    try {
      return await handler(action, token);
    } catch (error) {
      return {
        success: false,
        action,
        error: error instanceof Error ? error.message : "Unknown error during execution"
      };
    }
  }

  canExecute(action: AIAction): boolean {
    return this.registry.has(action.action);
  }
}
