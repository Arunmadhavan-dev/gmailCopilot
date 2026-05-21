import { GroqClient } from "./client";
import type { GroqClientConfig } from "./types";
import { DEFAULT_MODEL } from "./constants";

/**
 * Creates a GroqClient instance from AI configuration
 * Prefers worker proxy (secure) over direct API key (development)
 */
export function createGroqClient(): GroqClient {
  // Import generated config (created at build time)
  // @ts-ignore - Module generated at build time
  const { AI_CONFIG } = require("../config");

  const config: GroqClientConfig = {
    model: AI_CONFIG.GROQ_MODEL || DEFAULT_MODEL,
    apiKey: AI_CONFIG.GROQ_API_KEY || undefined,
    workerUrl: AI_CONFIG.GROQ_WORKER_URL || undefined
  };

  // Validate that at least one auth method is provided
  if (!config.apiKey && !config.workerUrl) {
    throw new Error(
      "GROQ_API_KEY or GROQ_WORKER_URL not configured. Set one in .env file."
    );
  }

  return new GroqClient(config);
}
