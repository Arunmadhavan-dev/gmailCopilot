import { describe, it, expect, beforeEach } from "vitest";
import { QueryEnhancer } from "../../ai/query/enhancer";
import { ContextManager } from "../../ai/query/context";
import type { AIAction } from "../../ai/types";
import type { ClassifiedIntent, SemanticCategory } from "../../ai/classification";

describe("QueryEnhancer (Phase 3)", () => {
  const enhancer = new QueryEnhancer();
  
  const mockAction: AIAction = {
    action: "search_emails",
    query: "from:recruiter"
  };

  const mockClassification: ClassifiedIntent = {
    intent: "search_emails",
    confidence: 0.92,
    semanticCategory: "recruiting" as SemanticCategory,
    priority: 8,
    userIntent: "Find job-related emails",
    suggestedGmailQuery: "from:recruiter"
  };

  describe("detectTimeRange", () => {
    it("should detect 'today'", () => {
      const range = enhancer.detectTimeRange("find emails from today");
      expect(range).toBeDefined();
      expect(range!.end.getTime()).toBeGreaterThan(range!.start.getTime());
    });

    it("should detect 'last week'", () => {
      const range = enhancer.detectTimeRange("show last week emails");
      expect(range).toBeDefined();
      const days = (range!.end.getTime() - range!.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(days).toBeGreaterThan(6);
    });

    it("should detect 'last 5 days'", () => {
      const range = enhancer.detectTimeRange("find emails from last 5 days");
      expect(range).toBeDefined();
      const days = (range!.end.getTime() - range!.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.round(days)).toBe(5);
    });

    it("should return undefined for no time pattern", () => {
      const range = enhancer.detectTimeRange("find emails");
      expect(range).toBeUndefined();
    });
  });

  describe("extractSenders", () => {
    it("should extract email addresses", () => {
      const senders = enhancer.extractSenders("find emails from john@example.com");
      expect(senders).toContain("from:john@example.com");
    });

    it("should extract 'from' patterns", () => {
      const senders = enhancer.extractSenders("find emails from recruiter");
      expect(senders).toContain("from:recruiter");
    });
  });

  describe("enhance", () => {
    it("should enhance recruiting queries", () => {
      const result = enhancer.enhance(
        "find job emails from last week",
        mockAction,
        mockClassification
      );

      expect(result.originalQuery).toBe("from:recruiter");
      expect(result.enhancedQuery).toContain("newer_than");
      expect(result.gmailOperators.length).toBeGreaterThan(0);
      expect(result.timeRange).toBeDefined();
    });

    it("should build explanation", () => {
      const result = enhancer.enhance(
        "find recruiter emails today",
        mockAction,
        mockClassification
      );

      expect(result.explanation).toContain("Searching for");
      expect(result.explanation).toContain("within last");
    });
  });
});

describe("ContextManager (Phase 3)", () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new ContextManager();
  });

  describe("recordInteraction", () => {
    it("should record query history", () => {
      const result = {
        action: { action: "search_emails", query: "test" } as AIAction,
        confidence: 0.9,
        originalText: "find emails",
        classification: {
          intent: "search_emails",
          confidence: 0.9,
          semanticCategory: "recruiting" as SemanticCategory,
          priority: 8,
          userIntent: "Find emails"
        }
      };

      contextManager.recordInteraction(result);
      expect(contextManager.getSessionSummary()).toContain("1 actions");
    });
  });

  describe("getSuggestions", () => {
    it("should suggest follow-ups for search", () => {
      const result = {
        action: { action: "search_emails", query: "test" } as AIAction,
        confidence: 0.9,
        originalText: "find emails",
        classification: {
          intent: "search_emails",
          confidence: 0.9,
          semanticCategory: "generic" as SemanticCategory,
          priority: 5,
          userIntent: "Find emails"
        }
      };

      contextManager.recordInteraction(result);
      const suggestions = contextManager.getSuggestions();
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].type).toBe("follow_up");
    });

    it("should suggest recruiting follow-ups", () => {
      const result = {
        action: { action: "search_emails", query: "test" } as AIAction,
        confidence: 0.9,
        originalText: "find recruiter emails",
        classification: {
          intent: "search_emails",
          confidence: 0.9,
          semanticCategory: "recruiting" as SemanticCategory,
          priority: 8,
          userIntent: "Find job emails"
        }
      };

      contextManager.recordInteraction(result);
      const suggestions = contextManager.getSuggestions();
      
      const recruitingSuggestion = suggestions.find(s => 
        s.description.toLowerCase().includes("offer") || 
        s.description.toLowerCase().includes("job")
      );
      expect(recruitingSuggestion).toBeDefined();
    });
  });

  describe("isFollowUp", () => {
    it("should detect follow-up patterns", () => {
      expect(contextManager.isFollowUp("archive these")).toBe(true);
      expect(contextManager.isFollowUp("delete those")).toBe(true);
      expect(contextManager.isFollowUp("find more")).toBe(true);
      expect(contextManager.isFollowUp("show next")).toBe(true);
    });

    it("should not flag standalone queries", () => {
      expect(contextManager.isFollowUp("find emails")).toBe(false);
      expect(contextManager.isFollowUp("search for john")).toBe(false);
    });
  });

  describe("enhanceWithContext", () => {
    it("should replace pronouns with context", () => {
      const result = {
        action: { action: "search_emails", query: "test" } as AIAction,
        confidence: 0.9,
        originalText: "emails from john",
        classification: {
          intent: "search_emails",
          confidence: 0.9,
          semanticCategory: "generic" as SemanticCategory,
          priority: 5,
          userIntent: "Find emails"
        }
      };

      contextManager.recordInteraction(result);
      const enhanced = contextManager.enhanceWithContext("archive these");
      
      expect(enhanced).toContain("similar to");
      expect(enhanced).toContain("emails from john");
    });

    it("should return original if not follow-up", () => {
      const query = "find new emails";
      const enhanced = contextManager.enhanceWithContext(query);
      expect(enhanced).toBe(query);
    });
  });

  describe("preferences", () => {
    it("should learn and retrieve preferences", () => {
      contextManager.learnPreference("default_search_range", "30d");
      expect(contextManager.getPreference("default_search_range")).toBe("30d");
    });
  });
});
