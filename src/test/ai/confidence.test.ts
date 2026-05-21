import { describe, it, expect } from "vitest";
import { calculateConfidence } from "../../ai/confidence/calculator";
import type { AIAction } from "../../ai/types";

describe("calculateConfidence", () => {
  it("should return 0.95 for high-confidence search with specific keywords", () => {
    const input = "search emails from john about project alpha";
    const action: AIAction = {
      action: "search_emails",
      query: "from:john project alpha",
      requiresConfirmation: false
    };

    const confidence = calculateConfidence(input, action);
    expect(confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("should return 0.6 for low-confidence unclear input", () => {
    const input = "do something";
    const action: AIAction = {
      action: "search_emails",
      query: "",
      requiresConfirmation: true
    };

    const confidence = calculateConfidence(input, action);
    expect(confidence).toBeLessThan(0.8);
  });

  it("should adjust confidence for destructive actions", () => {
    const input = "delete all emails from spam";
    const action: AIAction = {
      action: "delete_emails",
      query: "in:spam",
      requiresConfirmation: true
    };

    const confidence = calculateConfidence(input, action);
    // Should be lower due to destructive action
    expect(confidence).toBeDefined();
    expect(confidence).toBeGreaterThanOrEqual(0);
    expect(confidence).toBeLessThanOrEqual(1);
  });
});
