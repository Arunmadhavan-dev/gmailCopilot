import { GroqClient } from "../groqClient";
import { validateAIAction } from "../schemas";
import { INTENT_SYSTEM_PROMPT } from "../prompts/intentSystemPrompt";
import { calculateConfidence } from "../confidence/calculator";
import { handleParseError, handleLowConfidence } from "./errorHandler";
import { IntentClassifier } from "../classification";
import type { AIAction, IntentParseResult } from "../types";

const CONFIDENCE_THRESHOLD = 0.7;

export class IntentParser {
  private client: GroqClient;
  private classifier: IntentClassifier;

  constructor(client: GroqClient) {
    this.client = client;
    this.classifier = new IntentClassifier();
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

      // Phase 2: Classify intent with semantic category
      const classification = this.classifier.classify(
        userInput,
        validation.data,
        confidence
      );

      // Convert to clarify if confidence is low
      if (confidence < CONFIDENCE_THRESHOLD && validation.data.action !== "clarify") {
        return handleLowConfidence(validation.data.action, confidence, userInput);
      }

      return {
        action: validation.data,
        confidence,
        originalText: userInput,
        classification  // Phase 2: Added semantic understanding
      };
    } catch (error) {
      return handleParseError(error, userInput);
    }
  }
}
