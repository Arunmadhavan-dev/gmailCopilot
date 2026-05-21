import type { AIAction } from "../types";

interface ConfidenceFactors {
  vagueTerms: string[];
  gmailOperators: string[];
  minLength: number;
  baseConfidence: number;
}

const DEFAULT_FACTORS: ConfidenceFactors = {
  vagueTerms: ["something", "some", "maybe", "probably", "whatever"],
  gmailOperators: ["from:", "to:", "subject:", "label:", "has:", "is:", "older_than:", "newer_than:"],
  minLength: 10,
  baseConfidence: 0.8
};

export function calculateConfidence(
  input: string,
  action: AIAction,
  factors: ConfidenceFactors = DEFAULT_FACTORS
): number {
  let confidence = factors.baseConfidence;

  // Reduce confidence for vague inputs
  if (factors.vagueTerms.some(term => input.toLowerCase().includes(term))) {
    confidence -= 0.2;
  }

  // Boost confidence for clear Gmail operators
  if (factors.gmailOperators.some(op => input.toLowerCase().includes(op))) {
    confidence += 0.1;
  }

  // Reduce confidence for very short inputs
  if (input.length < factors.minLength) {
    confidence -= 0.2;
  }

  // Cap at 1.0
  return Math.min(confidence, 1.0);
}
