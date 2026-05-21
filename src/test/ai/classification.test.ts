import { describe, it, expect } from "vitest";
import { IntentClassifier } from "../../ai/classification/classifier";
import type { AIAction } from "../../ai/types";

describe("IntentClassifier (Phase 2)", () => {
  const classifier = new IntentClassifier();

  describe("classifyCategory", () => {
    it("should detect recruiting category", () => {
      const category = classifier.classifyCategory("find emails from recruiters");
      expect(category).toBe("recruiting");
    });

    it("should detect finance category", () => {
      const category = classifier.classifyCategory("show my invoices");
      expect(category).toBe("finance");
    });

    it("should detect support category", () => {
      const category = classifier.classifyCategory("help with support tickets");
      expect(category).toBe("support");
    });

    it("should return generic for unknown", () => {
      const category = classifier.classifyCategory("find some emails");
      expect(category).toBe("generic");
    });
  });

  describe("classify", () => {
    const mockAction: AIAction = {
      action: "search_emails",
      query: "from:recruiter"
    };

    it("should classify recruiting intent with all fields", () => {
      const result = classifier.classify("find mails from recruiters", mockAction, 0.92);
      
      expect(result.intent).toBe("search_emails");
      expect(result.confidence).toBe(0.92);
      expect(result.semanticCategory).toBe("recruiting");
      expect(result.priority).toBeGreaterThan(0);
      expect(result.userIntent).toContain("Find job-related");
      expect(result.suggestedGmailQuery).toBeDefined();
    });

    it("should boost priority for high confidence", () => {
      const highConf = classifier.classify("urgent recruiter emails", mockAction, 0.95);
      const lowConf = classifier.classify("recruiter emails", mockAction, 0.5);
      
      expect(highConf.priority).toBeGreaterThan(lowConf.priority);
    });

    it("should suggest appropriate Gmail queries", () => {
      const result = classifier.classify("recruiting emails", mockAction, 0.9);
      
      expect(result.suggestedGmailQuery).toContain("from:recruiter");
    });
  });

  describe("semantic descriptions", () => {
    const mockAction: AIAction = {
      action: "search_emails",
      query: "test"
    };

    it("should describe recruiting intent", () => {
      const result = classifier.describeUserIntent(mockAction, "recruiting");
      expect(result).toContain("job-related");
    });

    it("should describe finance intent", () => {
      const result = classifier.describeUserIntent(mockAction, "finance");
      expect(result).toContain("financial");
    });

    it("should describe urgent intent", () => {
      const urgentAction: AIAction = {
        action: "delete_emails",
        query: "old emails",
        requiresConfirmation: true
      };
      const result = classifier.describeUserIntent(urgentAction, "urgent");
      expect(result).toContain("Careful");
    });
  });
});
