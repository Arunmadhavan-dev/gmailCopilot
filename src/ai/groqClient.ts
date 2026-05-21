const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * GroqClient supports two modes:
 * 1. Direct API (development): Provide apiKey, calls Groq directly
 * 2. Worker Proxy (production): Provide workerUrl, calls your Cloudflare Worker
 *    which securely holds the API key
 */
export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqCompletionRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

export interface GroqCompletionResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  error?: {
    message: string;
  };
}

export class GroqClient {
  private apiKey?: string;
  private workerUrl?: string;
  private model: string;

  /**
   * @param apiKey - Groq API key (for direct API calls in development)
   * @param model - Model to use (default: qwen/qwen3-32b)
   * @param workerUrl - Cloudflare Worker URL (for secure production deployment)
   */
  constructor(apiKey?: string, model = "qwen/qwen3-32b", workerUrl?: string) {
    this.apiKey = apiKey;
    this.workerUrl = workerUrl;
    this.model = model;
  }

  async complete(request: Omit<GroqCompletionRequest, "model">): Promise<string> {
    // Use worker proxy if configured (production), otherwise direct API (development)
    const url = this.workerUrl || GROQ_API_URL;
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    // Only add Authorization header for direct API calls
    if (!this.workerUrl && this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...request,
        model: this.model
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json() as GroqCompletionResponse;

    if (data.error) {
      throw new Error(`Groq API error: ${data.error.message}`);
    }

    if (!data.choices?.length) {
      throw new Error("No completion choices returned");
    }

    return data.choices[0].message.content;
  }

  async completeJSON<T>(request: Omit<GroqCompletionRequest, "model" | "response_format">): Promise<T> {
    const content = await this.complete({
      ...request,
      response_format: { type: "json_object" }
    });

    try {
      return JSON.parse(content) as T;
    } catch {
      throw new Error("Failed to parse LLM response as JSON");
    }
  }
}

export function createGroqClient(): GroqClient {
  // Import generated config (created at build time by scripts/generate-ai-config.mjs)
  // @ts-ignore - Module generated at build time
  const { AI_CONFIG } = require("./config");

  // Prefer worker proxy (secure, no API key in bundle)
  if (AI_CONFIG.GROQ_WORKER_URL) {
    return new GroqClient(undefined, AI_CONFIG.GROQ_MODEL, AI_CONFIG.GROQ_WORKER_URL);
  }

  // Fall back to direct API (development only)
  if (!AI_CONFIG.ENABLED || !AI_CONFIG.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY or GROQ_WORKER_URL not configured. Set one in .env file.");
  }
  return new GroqClient(AI_CONFIG.GROQ_API_KEY, AI_CONFIG.GROQ_MODEL);
}
