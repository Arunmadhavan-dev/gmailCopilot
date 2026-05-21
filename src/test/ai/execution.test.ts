import { describe, it, expect, vi } from "vitest";
import { ExecutionPipeline } from "../../ai/execution/pipeline";
import { FeedbackSystem, generateFeedbackPrompt } from "../../ai/execution/feedback";
import { BatchExecutor, calculateOptimalBatchSize } from "../../ai/execution/batch";
import type { AIAction } from "../../ai/types";
import type { SemanticCategory } from "../../ai/classification";

describe("ExecutionPipeline (Phase 4)", () => {
  const pipeline = new ExecutionPipeline();

  describe("createContext", () => {
    it("should create context for search action", () => {
      const action: AIAction = {
        action: "search_emails",
        query: "from:john"
      };

      const context = pipeline.createContext(action);
      
      expect(context.action).toBe(action);
      expect(context.steps.length).toBeGreaterThan(0);
      expect(context.steps.some(s => s.name === "query_gmail")).toBe(true);
      expect(context.estimatedDuration).toBeGreaterThan(0);
    });

    it("should create context for archive action", () => {
      const action: AIAction = {
        action: "archive_emails",
        query: "old emails",
        requiresConfirmation: true
      };

      const context = pipeline.createContext(action);
      
      expect(context.steps.some(s => s.name === "batch_archive")).toBe(true);
      expect(context.steps.some(s => s.name === "verify_archive")).toBe(true);
    });

    it("should create context for delete action with safety check", () => {
      const action: AIAction = {
        action: "delete_emails",
        query: "spam",
        requiresConfirmation: true
      };

      const context = pipeline.createContext(action);
      
      expect(context.steps.some(s => s.name === "safety_check")).toBe(true);
      expect(context.steps.length).toBeGreaterThan(4);
    });
  });

  describe("updateStep", () => {
    it("should update step status and progress", () => {
      const action: AIAction = { action: "search_emails", query: "test" };
      const context = pipeline.createContext(action);

      pipeline.updateStep(context, "validate", "completed", "Validated");
      
      const step = context.steps.find(s => s.name === "validate");
      expect(step?.status).toBe("completed");
      expect(step?.progress).toBe(100);
      expect(step?.message).toBe("Validated");
    });
  });

  describe("getProgress", () => {
    it("should calculate overall progress", () => {
      const action: AIAction = { action: "search_emails", query: "test" };
      const context = pipeline.createContext(action);

      // Complete first 2 steps
      pipeline.updateStep(context, "validate", "completed");
      pipeline.updateStep(context, "prepare", "completed");

      const progress = pipeline.getProgress(context);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });
  });
});

describe("FeedbackSystem (Phase 4)", () => {
  let feedback: FeedbackSystem;

  beforeEach(() => {
    feedback = new FeedbackSystem();
  });

  describe("recordFeedback", () => {
    it("should record positive feedback", () => {
      feedback.recordFeedback({
        executionId: "exec-1",
        satisfied: true,
        rating: 5
      });

      const stats = feedback.getStats();
      expect(stats.totalExecutions).toBe(1);
      expect(stats.satisfactionRate).toBe(1);
    });

    it("should record corrections", () => {
      feedback.recordFeedback({
        executionId: "exec-1",
        satisfied: false,
        correctedQuery: "from john subject interview"
      });

      const stats = feedback.getStats();
      expect(stats.commonCorrections.has("from john subject interview")).toBe(true);
    });
  });

  describe("suggestImprovement", () => {
    beforeEach(() => {
      feedback.clear(); // Reset for clean test
    });

    it("should suggest based on similar corrections", () => {
      feedback.recordFeedback({
        executionId: "exec-1",
        satisfied: false,
        correctedQuery: "from john interview last week"
      });

      // Query with >60% word overlap should get suggestion
      // "from john interview week" shares 4/5 words with corrected query
      const suggestion = feedback.suggestImprovement("from john interview week");
      expect(suggestion).toBe("from john interview last week");
    });
  });

  describe("hasRecentIssues", () => {
    it("should detect low satisfaction rate", () => {
      // Add multiple negative feedbacks
      for (let i = 0; i < 4; i++) {
        feedback.recordFeedback({
          executionId: `exec-${i}`,
          satisfied: false
        });
      }

      expect(feedback.hasRecentIssues(0.7, 5)).toBe(true);
    });

    it("should not flag with sufficient satisfaction", () => {
      feedback.recordFeedback({ executionId: "1", satisfied: true });
      feedback.recordFeedback({ executionId: "2", satisfied: true });
      feedback.recordFeedback({ executionId: "3", satisfied: true });
      feedback.recordFeedback({ executionId: "4", satisfied: false });

      expect(feedback.hasRecentIssues(0.7, 5)).toBe(false); // 3/4 = 75% > 70%
    });
  });

  describe("generateFeedbackPrompt", () => {
    it("should prompt for successful result", () => {
      const result = {
        success: true,
        action: { action: "search_emails", query: "test" } as AIAction,
        executionTime: 100,
        stepsCompleted: 5,
        canRetry: false,
        retryCount: 0,
        affectedCount: 10
      };

      const prompt = generateFeedbackPrompt(result);
      expect(prompt).toContain("Did this help");
    });

    it("should suggest narrowing for many results", () => {
      const result = {
        success: true,
        action: { action: "search_emails", query: "test" } as AIAction,
        executionTime: 100,
        stepsCompleted: 5,
        canRetry: false,
        retryCount: 0,
        affectedCount: 100
      };

      const prompt = generateFeedbackPrompt(result);
      expect(prompt).toContain("narrowing");
    });

    it("should offer retry for failed result", () => {
      const result = {
        success: false,
        action: { action: "search_emails", query: "test" } as AIAction,
        executionTime: 100,
        stepsCompleted: 2,
        canRetry: true,
        retryCount: 0,
        error: "Failed"
      };

      const prompt = generateFeedbackPrompt(result);
      expect(prompt).toContain("try again");
    });
  });
});

describe("BatchExecutor (Phase 4)", () => {
  describe("execute", () => {
    it("should process all items successfully", async () => {
      const executor = new BatchExecutor<string>({
        batchSize: 3,
        concurrency: 2
      });

      const items = ["a", "b", "c", "d", "e"];
      const processed: string[] = [];

      const result = await executor.execute(
        items,
        (item) => item,
        async (item) => {
          processed.push(item);
        }
      );

      expect(result.completed).toBe(5);
      expect(result.failed).toBe(0);
      expect(processed).toEqual(items);
    });

    it("should handle failures and retry", async () => {
      const executor = new BatchExecutor<string>({
        batchSize: 2,
        retryAttempts: 2,
        retryDelay: 10
      });

      const items = ["a", "b", "c"];
      let failCount = 0;

      const result = await executor.execute(
        items,
        (item) => item,
        async (item) => {
          if (item === "b" && failCount < 1) {
            failCount++;
            throw new Error("Temporary error");
          }
        }
      );

      expect(result.completed).toBe(3); // Should succeed after retry
      expect(result.failed).toBe(0);
    });

    it("should track progress", async () => {
      const onProgress = vi.fn();
      
      const executor = new BatchExecutor<string>({
        batchSize: 2,
        onProgress
      });

      await executor.execute(
        ["a", "b", "c", "d"],
        (item) => item,
        async () => {}
      );

      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe("generateReport", () => {
    it("should generate success report", () => {
      const executor = new BatchExecutor<string>();
      const result = {
        total: 10,
        completed: 10,
        failed: 0,
        items: [],
        errors: []
      };

      const report = executor.generateReport(result);
      expect(report).toContain("10 items processed successfully");
      expect(report).toContain("100.0%");
    });

    it("should generate partial success report", () => {
      const executor = new BatchExecutor<string>();
      const result = {
        total: 10,
        completed: 7,
        failed: 3,
        items: [],
        errors: [
          { id: "1", error: "Error 1" },
          { id: "2", error: "Error 2" },
          { id: "3", error: "Error 3" }
        ]
      };

      const report = executor.generateReport(result);
      expect(report).toContain("7 completed, 3 failed");
      expect(report).toContain("70.0%");
    });
  });
});

describe("calculateOptimalBatchSize", () => {
  it("should return larger batches for search", () => {
    expect(calculateOptimalBatchSize("search", 100)).toBe(50);
  });

  it("should return moderate batches for archive", () => {
    expect(calculateOptimalBatchSize("archive", 100)).toBe(20);
  });

  it("should return smaller batches for delete", () => {
    expect(calculateOptimalBatchSize("delete", 100)).toBe(10);
  });

  it("should not exceed total items", () => {
    expect(calculateOptimalBatchSize("search", 5)).toBe(5);
  });
});
