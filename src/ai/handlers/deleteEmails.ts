import { fetchGmailThreads } from "../../gmail/authAndApi";
import type { AIAction, ActionExecutionResult } from "../types";

export const DELETE_MAX_PREVIEW = 25;

export async function handleDeleteEmails(
  action: AIAction,
  token: string
): Promise<ActionExecutionResult> {
  // Preview what would be deleted (actual delete requires confirmation)
  const threads = await fetchGmailThreads(token, action.query, DELETE_MAX_PREVIEW);

  return {
    success: true,
    action,
    data: threads,
    affectedCount: threads.length,
    error: threads.length > 0
      ? `Ready to delete ${threads.length} threads. Confirm to proceed.`
      : "No threads found to delete."
  };
}
