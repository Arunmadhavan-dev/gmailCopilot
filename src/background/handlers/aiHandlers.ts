import { AI_CONFIG } from "../../ai/config";
import { getActionEngine } from "../../ai/engine/factory";
import { IntentParser } from "../../ai/parsers/intentParser";
import { GroqClient } from "../../ai/groqClient";
import type { AIAction } from "../../ai/types";
import type { RuntimeMessage } from "../../types/runtime";
import { withFreshToken } from "../services/tokenService";

type AIMessage =
  | { type: "AI_PARSE_INTENT"; input: string; context?: string }
  | { type: "AI_EXECUTE_ACTION"; action: unknown; confirmed?: boolean };

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

async function handleParseIntent(input: string, context?: string) {
  if (!AI_CONFIG.ENABLED) {
    return { ok: false, error: "AI features not configured. Set GROQ_API_KEY in .env" };
  }

  try {
    const client = new GroqClient(AI_CONFIG.GROQ_API_KEY, AI_CONFIG.GROQ_MODEL);
    const parser = new IntentParser(client);
    const result = await parser.parseIntent(input, context);

    return { ok: true, intent: result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to parse intent"
    };
  }
}

async function handleExecuteAction(action: AIAction) {
  try {
    const engine = getActionEngine();
    const result = await withFreshToken((token) =>
      engine.execute(action, token)
    );

    return { ok: true, result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to execute action"
    };
  }
}
