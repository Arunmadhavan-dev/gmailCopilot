import type { AIAction, ActionExecutionResult } from "../types";

export type ActionHandler = (action: AIAction, token: string) => Promise<ActionExecutionResult>;

export interface ActionRegistry {
  [actionType: string]: ActionHandler;
}
