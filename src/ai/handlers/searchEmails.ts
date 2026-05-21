import { fetchGmailThreads } from "../../gmail";
import type { AIAction, ActionExecutionResult } from "../types";

export const SEARCH_MAX_RESULTS = 25;

export async function handleSearchEmails(
  action: AIAction,
  token: string
): Promise<ActionExecutionResult> {
  const threads = await fetchGmailThreads(token, action.query, SEARCH_MAX_RESULTS);

  return {
    success: true,
    action,
    data: threads,
    affectedCount: threads.length
  };
}
