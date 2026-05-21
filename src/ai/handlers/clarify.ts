import type { AIAction, ActionExecutionResult } from "../types";

export async function handleClarify(
  action: AIAction
): Promise<ActionExecutionResult> {
  return {
    success: false,
    action,
    error: action.reason || "Clarification needed"
  };
}
