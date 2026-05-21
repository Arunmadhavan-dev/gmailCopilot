/**
 * Groq API Client Module
 * 
 * Provides secure communication with Groq API via:
 * - Direct API calls (development)
 * - Cloudflare Worker proxy (production)
 */

export { GroqClient } from "./client";
export { createGroqClient } from "./factory";
export type {
  GroqMessage,
  GroqCompletionRequest,
  GroqCompletionResponse,
  GroqClientConfig
} from "./types";
export { GROQ_API_URL, DEFAULT_MODEL } from "./constants";
