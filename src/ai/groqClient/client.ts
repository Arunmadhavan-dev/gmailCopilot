import type { GroqCompletionRequest, GroqCompletionResponse, GroqClientConfig } from "./types";
import { GROQ_API_URL } from "./constants";
import { parseJSON } from "../utils/jsonRepair";

/**
 * GroqClient handles communication with Groq API
 * Supports both direct API calls and worker proxy mode
 */
export class GroqClient {
  private config: GroqClientConfig;

  constructor(config: GroqClientConfig) {
    this.config = config;
  }

  async complete(request: Omit<GroqCompletionRequest, "model">): Promise<string> {
    const url = this.config.workerUrl || GROQ_API_URL;
    const headers = this.buildHeaders();

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...request,
        model: this.config.model
      })
    });

    return this.handleResponse(response);
  }

  async completeJSON<T>(request: Omit<GroqCompletionRequest, "model" | "response_format">): Promise<T> {
    const content = await this.complete({
      ...request,
      response_format: { type: "json_object" }
    });

    // Try to parse with repair utility
    const parsed = parseJSON<T>(content);
    
    if (parsed === null) {
      console.error("Failed to parse JSON response:", content.substring(0, 200));
      throw new Error("Failed to parse LLM response as JSON. Please adjust your prompt.");
    }

    return parsed;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    // Only add auth header for direct API calls (not worker proxy)
    if (!this.config.workerUrl && this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  private async handleResponse(response: Response): Promise<string> {
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
}
