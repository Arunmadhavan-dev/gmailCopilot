/**
 * Groq API Client Types
 * Extracted for modularity and reusability
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

export interface GroqClientConfig {
  apiKey?: string;
  workerUrl?: string;
  model: string;
}
