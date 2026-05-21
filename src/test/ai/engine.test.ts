import { describe, it, expect, vi, afterEach } from "vitest";
import { HandlerRegistry, getRegistry, resetRegistry } from "../../ai/engine/registry";
import { ActionExecutor } from "../../ai/engine/executor";
import { getActionEngine } from "../../ai/engine/factory";
import type { AIAction, ActionExecutionResult } from "../../ai/types";

describe("Action Engine", () => {
  afterEach(() => {
    resetRegistry();
  });

  describe("HandlerRegistry", () => {
    it("should create empty registry", () => {
      const registry = new HandlerRegistry();

      expect(registry.get("search_emails")).toBeUndefined();
    });

    it("should register and retrieve handlers", () => {
      const registry = new HandlerRegistry();
      const mockHandler = async (): Promise<ActionExecutionResult> => ({
        success: true,
        action: { action: "search_emails", query: "" }
      });

      registry.register("search_emails", mockHandler);

      expect(registry.get("search_emails")).toBe(mockHandler);
    });
  });

  describe("ActionExecutor", () => {
    it("should execute registered handler", async () => {
      const registry = new HandlerRegistry();
      const mockResult: ActionExecutionResult = {
        success: true,
        action: { action: "search_emails", query: "test" }
      };

      registry.register("search_emails", async () => mockResult);

      const executor = new ActionExecutor(registry);
      const action: AIAction = {
        action: "search_emails",
        query: "test",
        requiresConfirmation: false
      };

      const result = await executor.execute(action, "token");

      expect(result.success).toBe(true);
    });

    it("should return error for unregistered action", async () => {
      const registry = new HandlerRegistry();
      const executor = new ActionExecutor(registry);
      const action: AIAction = {
        action: "search_emails",
        query: "test",
        requiresConfirmation: false
      };

      const result = await executor.execute(action, "token");
      expect(result.success).toBe(false);
      expect(result.error).toContain("No handler registered");
    });
  });

  describe("getActionEngine", () => {
    it("should have default handlers registered", () => {
      const engine = getActionEngine();
      const action: AIAction = {
        action: "search_emails",
        query: "test",
        requiresConfirmation: false
      };

      expect(engine.canExecute(action)).toBe(true);
    });

    it("should execute search action", async () => {
      const engine = getActionEngine();
      const action: AIAction = {
        action: "search_emails",
        query: "test",
        requiresConfirmation: false
      };

      // Mock fetch for Gmail API
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ threads: [] })
      });

      const result = await engine.execute(action, "token");

      expect(result.success).toBe(true);
    });
  });
});
