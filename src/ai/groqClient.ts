const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

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
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = "qwen/qwen3-32b") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(request: Omit<GroqCompletionRequest, "model">): Promise<string> {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
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

  if (!AI_CONFIG.ENABLED || !AI_CONFIG.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured. Set it in .env file.");
  }
  return new GroqClient(AI_CONFIG.GROQ_API_KEY, AI_CONFIG.GROQ_MODEL);
}
