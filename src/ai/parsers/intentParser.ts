import { GroqClient } from "../groqClient";
import { validateAIAction } from "../schemas";
import { INTENT_SYSTEM_PROMPT } from "../prompts/intentSystemPrompt";
import { calculateConfidence } from "../confidence/calculator";
import { handleParseError, handleLowConfidence } from "./errorHandler";
import type { AIAction, IntentParseResult } from "../types";

const CONFIDENCE_THRESHOLD = 0.7;

export class IntentParser {
  private client: GroqClient;

  constructor(client: GroqClient) {
    this.client = client;
  }

  async parseIntent(userInput: string, context?: string): Promise<IntentParseResult> {
    const userPrompt = context
      ? `Context: ${context}\n\nUser request: ${userInput}`
      : `User request: ${userInput}`;

    try {
      const response = await this.client.completeJSON<AIAction>({
        messages: [
          { role: "system", content: INTENT_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const validation = validateAIAction(response);
      if (!validation.success || !validation.data) {
        throw new Error(`Invalid action structure: ${validation.error}`);
      }

      const confidence = calculateConfidence(userInput, validation.data);

      // Convert to clarify if confidence is low
      if (confidence < CONFIDENCE_THRESHOLD && validation.data.action !== "clarify") {
        return handleLowConfidence(validation.data.action, confidence, userInput);
      }

      return {
        action: validation.data,
        confidence,
        originalText: userInput
      };
    } catch (error) {
      return handleParseError(error, userInput);
    }
  }
}
