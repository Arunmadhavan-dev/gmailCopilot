import type { AIAction } from "../../ai/types";
import { handleParseIntent, handleExecuteAction } from "./ai";

type AIMessage =
  | { type: "AI_PARSE_INTENT"; input: string; context?: string }
  | { type: "AI_EXECUTE_ACTION"; action: unknown; confirmed?: boolean };

/**
 * Handle AI-related messages from content script
 */
export async function handleAIMessage(message: AIMessage): Promise<unknown> {
  switch (message.type) {
    case "AI_PARSE_INTENT":
      return handleParseIntent(message.input, message.context);

    case "AI_EXECUTE_ACTION":
      return handleExecuteAction(message.action as AIAction);

    default:
      return null;
  }
}
