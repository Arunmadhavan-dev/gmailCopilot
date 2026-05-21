import { fetchGmailThreads } from "../gmail/authAndApi";
import type { AIAction, ActionExecutionResult } from "./types";

export type ActionHandler = (action: AIAction, token: string) => Promise<ActionExecutionResult>;

export interface ActionRegistry {
  [actionType: string]: ActionHandler;
}

export class ActionEngine {
  private registry: ActionRegistry = {};

  constructor() {
    this.registerDefaultHandlers();
  }

  register(actionType: string, handler: ActionHandler): void {
    this.registry[actionType] = handler;
  }

  async execute(action: AIAction, token: string): Promise<ActionExecutionResult> {
    const handler = this.registry[action.action];

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
    return !!this.registry[action.action];
  }

  private registerDefaultHandlers(): void {
    // Search emails handler
    this.register("search_emails", async (action, token) => {
      const threads = await fetchGmailThreads(token, action.query, 25);
      return {
        success: true,
        action,
        data: threads,
        affectedCount: threads.length
      };
    });

    // Archive emails handler (preview only - requires confirmation)
    this.register("archive_emails", async (action, token) => {
      // First, search to find what would be archived
      const threads = await fetchGmailThreads(token, action.query, 25);

      return {
        success: true,
        action,
        data: threads,
        affectedCount: threads.length,
        error: threads.length > 0
          ? `Ready to archive ${threads.length} threads. Confirm to proceed.`
          : "No threads found to archive."
      };
    });

    // Delete emails handler (preview only - requires confirmation)
    this.register("delete_emails", async (action, token) => {
      // First, search to find what would be deleted
      const threads = await fetchGmailThreads(token, action.query, 25);

      return {
        success: true,
        action,
        data: threads,
        affectedCount: threads.length,
        error: threads.length > 0
          ? `Ready to delete ${threads.length} threads. Confirm to proceed.`
          : "No threads found to delete."
      };
    });

    // Clarify handler (no-op, returns the clarification request)
    this.register("clarify", async (action) => {
      return {
        success: false,
        action,
        error: action.reason || "Clarification needed"
      };
    });
  }
}

// Singleton instance
let actionEngine: ActionEngine | null = null;

export function getActionEngine(): ActionEngine {
  if (!actionEngine) {
    actionEngine = new ActionEngine();
  }
  return actionEngine;
}
