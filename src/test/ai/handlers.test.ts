import { describe, it, expect, vi } from "vitest";
import { handleSearchEmails, SEARCH_MAX_RESULTS } from "../../ai/handlers/searchEmails";
import { handleArchiveEmails, ARCHIVE_MAX_PREVIEW } from "../../ai/handlers/archiveEmails";
import { handleDeleteEmails, DELETE_MAX_PREVIEW } from "../../ai/handlers/deleteEmails";
import { handleClarify } from "../../ai/handlers/clarify";
import type { SearchEmailsAction, ArchiveEmailsAction, DeleteEmailsAction, ClarifyAction } from "../../ai/types";

describe("Action Handlers", () => {
  const mockToken = "mock_token";

  describe("handleSearchEmails", () => {
    it("should return search results", async () => {
      const action: SearchEmailsAction = {
        action: "search_emails",
        query: "from:test@example.com",
        requiresConfirmation: false
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ threads: [{ id: "1", snippet: "Test" }] })
      });

      const result = await handleSearchEmails(action, mockToken);

      expect(result.success).toBe(true);
      expect(result.affectedCount).toBeLessThanOrEqual(SEARCH_MAX_RESULTS);
      expect(result.data).toBeDefined();
    });
  });

  describe("handleArchiveEmails", () => {
    it("should return preview of threads to archive", async () => {
      const action: ArchiveEmailsAction = {
        action: "archive_emails",
        query: "label:inbox",
        requiresConfirmation: true
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ threads: [{ id: "1" }] })
      });

      const result = await handleArchiveEmails(action, mockToken);

      expect(result.success).toBe(true);
      expect(result.affectedCount).toBeGreaterThan(0);
    });
  });

  describe("handleDeleteEmails", () => {
    it("should return preview of threads to delete", async () => {
      const action: DeleteEmailsAction = {
        action: "delete_emails",
        query: "in:spam",
        requiresConfirmation: true
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ threads: [{ id: "1" }] })
      });

      const result = await handleDeleteEmails(action, mockToken);

      expect(result.success).toBe(true);
      expect(result.affectedCount).toBeGreaterThan(0);
      expect(result.error).toContain("Ready to delete");
    });

    it("should handle empty results", async () => {
      const action: DeleteEmailsAction = {
        action: "delete_emails",
        query: "in:trash older_than:1y",
        requiresConfirmation: true
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ threads: [] })
      });

      const result = await handleDeleteEmails(action, mockToken);

      expect(result.success).toBe(true);
      expect(result.affectedCount).toBe(0);
      expect(result.error).toContain("No threads found");
    });
  });

  describe("handleClarify", () => {
    it("should return clarification request", async () => {
      const action: ClarifyAction = {
        action: "clarify",
        query: "",
        requiresConfirmation: false,
        reason: "Please specify the time range"
      };

      const result = await handleClarify(action, mockToken);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Please specify the time range");
    });
  });
});
