import { AI_CONFIG } from "../../ai/config";
import { getActionEngine } from "../../ai/engine/factory";
import { IntentParser } from "../../ai/parsers/intentParser";
import { createGroqClient } from "../../ai/groqClient";
import type { AIAction } from "../../ai/types";
import type { RuntimeMessage } from "../../types/runtime";
import { withFreshToken } from "../services/tokenService";

type AIMessage =
  | { type: "AI_PARSE_INTENT"; input: string; context?: string }
  | { type: "AI_EXECUTE_ACTION"; action: unknown; confirmed?: boolean };

// Rate limiting: 10 requests per minute per tab
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;
const requestTimestamps: number[] = [];

function checkRateLimit(): boolean {
  const now = Date.now();
  // Remove timestamps outside the window
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  while (requestTimestamps.length > 0 && requestTimestamps[0] < cutoff) {
    requestTimestamps.shift();
  }
  // Check if under limit
  if (requestTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  requestTimestamps.push(now);
  return true;
}

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

  if (!checkRateLimit()) {
    return { ok: false, error: "Rate limit exceeded. Please wait a minute before trying again." };
  }

  try {
    const client = createGroqClient();
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
