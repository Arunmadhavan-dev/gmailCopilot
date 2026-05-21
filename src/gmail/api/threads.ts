import type { GmailThread } from "../../types/runtime";
import { GmailApiError } from "../errors/GmailApiError";

/**
 * Fetch Gmail threads matching a search query
 */
export async function fetchGmailThreads(
  token: string,
  query: string,
  maxResults: number
): Promise<GmailThread[]> {
  const url = new URL("https://www.googleapis.com/gmail/v1/users/me/threads");
  
  if (query.trim()) {
    url.searchParams.set("q", query.trim());
  }
  
  const clampedMax = Math.max(1, Math.min(maxResults, 25));
  url.searchParams.set("maxResults", String(clampedMax));

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new GmailApiError(response.status, "Gmail API request failed");
  }

  const data = (await response.json()) as { threads?: GmailThread[] };
  return data.threads ?? [];
}
