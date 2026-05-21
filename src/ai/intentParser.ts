import { GroqClient } from "./groqClient";
import { validateAIAction, validateIntentParseResult } from "./schemas";
import type { AIAction, IntentParseResult } from "./types";

const SYSTEM_PROMPT = `You are an AI assistant for Gmail automation. Parse user intent into structured actions.

Available actions:
1. search_emails - Search for emails matching criteria (safe, no confirmation needed)
2. archive_emails - Archive matching emails (requires confirmation)
3. delete_emails - Delete matching emails (requires confirmation)
4. clarify - Ask for clarification when intent is unclear

Rules:
- Always convert Gmail search syntax properly (e.g., "from:alice" becomes "from:alice")
- For destructive actions (archive, delete), requiresConfirmation must be true
- If confidence is low (< 0.8), use "clarify" action and explain what you need to know
- Never hallucinate actions - only return valid actions
- Query should be valid Gmail search syntax

Response format (JSON):
{
  "action": "search_emails" | "archive_emails" | "delete_emails" | "clarify",
  "query": "Gmail search query",
  "requiresConfirmation": boolean,
  "reason": "explanation for clarify actions"
}

Examples:
User: "find emails from john"
Response: {"action": "search_emails", "query": "from:john", "requiresConfirmation": false}

User: "archive old newsletters"
Response: {"action": "archive_emails", "query": "older_than:30d subject:newsletter OR label:newsletters", "requiresConfirmation": true}

User: "do something with my emails"
Response: {"action": "clarify", "query": "", "reason": "Please specify what action you want: search, archive, or delete, and which emails to target."}`;

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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      // Validate the parsed action
      const validation = validateAIAction(response);
      if (!validation.success || !validation.data) {
        throw new Error(`Invalid action structure: ${validation.error}`);
      }

      // Calculate confidence based on action type and clarity
      const confidence = this.calculateConfidence(userInput, validation.data);

      const result: IntentParseResult = {
        action: validation.data,
        confidence,
        originalText: userInput
      };

      // If confidence is low, convert to clarify action
      if (confidence < 0.7 && result.action.action !== "clarify") {
        result.action = {
          action: "clarify",
          query: "",
          reason: `I'm not confident (${(confidence * 100).toFixed(0)}%) about executing "${result.action.action}". Could you clarify?`,
          requiresConfirmation: false
        };
        result.confidence = 0;
      }

      return result;
    } catch (error) {
      // If parsing fails, return a clarify action
      return {
        action: {
          action: "clarify",
          query: "",
          reason: `I couldn't understand your request. Please try rephrasing. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          requiresConfirmation: false
        },
        confidence: 0,
        originalText: userInput
      };
    }
  }

  private calculateConfidence(input: string, action: AIAction): number {
    let confidence = 0.8; // Base confidence

    // Reduce confidence for vague inputs
    const vagueTerms = ["something", "some", "maybe", "probably", "whatever"];
    if (vagueTerms.some(term => input.toLowerCase().includes(term))) {
      confidence -= 0.2;
    }

    // Boost confidence for clear Gmail operators
    const gmailOperators = ["from:", "to:", "subject:", "label:", "has:", "is:", "older_than:", "newer_than:"];
    if (gmailOperators.some(op => input.toLowerCase().includes(op))) {
      confidence += 0.1;
    }

    // Reduce confidence for very short inputs
    if (input.length < 10) {
      confidence -= 0.2;
    }

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }
}
