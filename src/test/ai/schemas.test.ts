import { describe, it, expect } from "vitest";
import {
  SearchEmailsActionSchema,
  ArchiveEmailsActionSchema,
  DeleteEmailsActionSchema,
  ClarifyActionSchema,
  AIActionSchema
} from "../../ai/schemas";

describe("AI Action Schemas", () => {
  describe("SearchEmailsActionSchema", () => {
    it("should validate valid search action", () => {
      const result = SearchEmailsActionSchema.safeParse({
        action: "search_emails",
        requiresConfirmation: false,
        query: "from:test@example.com"
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid search action", () => {
      const result = SearchEmailsActionSchema.safeParse({
        action: "search_emails",
        requiresConfirmation: false
        // missing query
      });

      expect(result.success).toBe(false);
    });
  });

  describe("ArchiveEmailsActionSchema", () => {
    it("should validate valid archive action", () => {
      const result = ArchiveEmailsActionSchema.safeParse({
        action: "archive_emails",
        requiresConfirmation: true,
        query: "label:inbox"
      });

      expect(result.success).toBe(true);
    });
  });

  describe("DeleteEmailsActionSchema", () => {
    it("should validate valid delete action", () => {
      const result = DeleteEmailsActionSchema.safeParse({
        action: "delete_emails",
        requiresConfirmation: true,
        query: "in:spam"
      });

      expect(result.success).toBe(true);
    });
  });

  describe("ClarifyActionSchema", () => {
    it("should validate valid clarify action", () => {
      const result = ClarifyActionSchema.safeParse({
        action: "clarify",
        requiresConfirmation: false,
        query: "",
        reason: "What time period?"
      });

      expect(result.success).toBe(true);
    });
  });

  describe("AIActionSchema", () => {
    it("should validate any valid action type", () => {
      const actions = [
        { action: "search_emails", requiresConfirmation: false, query: "test" },
        { action: "archive_emails", requiresConfirmation: true, query: "in:inbox" },
        { action: "delete_emails", requiresConfirmation: true, query: "in:trash" },
        { action: "clarify", requiresConfirmation: false, query: "", reason: "What?" }
      ];

      actions.forEach(action => {
        const result = AIActionSchema.safeParse(action);
        expect(result.success).toBe(true);
      });
    });

    it("should reject unknown action types", () => {
      const result = AIActionSchema.safeParse({
        action: "unknown_action",
        requiresConfirmation: false,
        parameters: {}
      });

      expect(result.success).toBe(false);
    });
  });
});
