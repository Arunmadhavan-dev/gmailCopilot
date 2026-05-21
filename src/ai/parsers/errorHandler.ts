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
  // Log full error internally for debugging
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("Parse error:", error);
  
  // Show specific error type for debugging (but not sensitive details)
  let userMessage = "I couldn't understand your request. Please try rephrasing.";
  if (errorMessage.includes("API key") || errorMessage.includes("401")) {
    userMessage = "AI service authentication failed. Check worker configuration.";
  } else if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
    userMessage = "Network error connecting to AI service. Check connection.";
  } else if (errorMessage.includes("Rate limit")) {
    userMessage = "Too many requests. Please wait a moment and try again.";
  }
  
  return createClarifyResult(userInput, userMessage);
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
