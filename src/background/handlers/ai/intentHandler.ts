import { AI_CONFIG } from "../../../ai/config";
import { IntentParser } from "../../../ai/parsers/intentParser";
import { createGroqClient } from "../../../ai/groqClient";
import { checkRateLimit } from "./rateLimiter";

/**
 * Parse user intent using AI
 */
export async function handleParseIntent(input: string, context?: string) {
  if (!AI_CONFIG.ENABLED) {
    return { 
      ok: false, 
      error: "AI features not configured. Set GROQ_API_KEY in .env" 
    };
  }

  if (!checkRateLimit()) {
    return { 
      ok: false, 
      error: "Rate limit exceeded. Please wait a minute before trying again." 
    };
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
