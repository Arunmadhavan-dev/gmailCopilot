import { fetchGmailThreads } from "../../gmail/authAndApi";
import type { AIAction, ActionExecutionResult } from "../types";

export const ARCHIVE_MAX_PREVIEW = 25;

export async function handleArchiveEmails(
  action: AIAction,
  token: string
): Promise<ActionExecutionResult> {
  // Preview what would be archived (actual archive requires confirmation)
  const threads = await fetchGmailThreads(token, action.query, ARCHIVE_MAX_PREVIEW);

  return {
    success: true,
    action,
    data: threads,
    affectedCount: threads.length,
    error: threads.length > 0
      ? `Ready to archive ${threads.length} threads. Confirm to proceed.`
      : "No threads found to archive."
  };
}
