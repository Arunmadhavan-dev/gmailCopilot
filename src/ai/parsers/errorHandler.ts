import type { IntentParseResult } from "../types";

export function createClarifyResult(
  userInput: string,
  reason: string
): IntentParseResult {
  return {
    action: {
      action: "clarify",
      query: "",
      reason,
      requiresConfirmation: false
    },
    confidence: 0,
    originalText: userInput
  };
}

export function handleParseError(
  error: unknown,
  userInput: string
): IntentParseResult {
  const message = error instanceof Error ? error.message : "Unknown error";
  return createClarifyResult(
    userInput,
    `I couldn't understand your request. Please try rephrasing. Error: ${message}`
  );
}

export function handleLowConfidence(
  actionType: string,
  confidence: number,
  userInput: string
): IntentParseResult {
  return createClarifyResult(
    userInput,
    `I'm not confident (${(confidence * 100).toFixed(0)}%) about executing "${actionType}". Could you clarify?`
  );
}
