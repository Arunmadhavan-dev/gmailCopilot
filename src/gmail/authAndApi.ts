import { type GmailThread } from "../types/runtime";

export class GmailApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GmailApiError";
    this.status = status;
  }
}

export async function getAuthToken(interactive: boolean): Promise<string | null> {
  const token = await new Promise<string | undefined>((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (typeof result === "string") {
        resolve(result);
        return;
      }

      resolve(result?.token);
    });
  });

  return token ?? null;
}

export async function clearAuthToken(token: string): Promise<void> {
  await new Promise<void>((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, () => resolve());
  });

  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  }).catch(() => {
    // Revocation network failures are non-fatal for local logout.
  });
}

export async function fetchGmailThreads(token: string, query: string, maxResults: number): Promise<GmailThread[]> {
  const url = new URL("https://www.googleapis.com/gmail/v1/users/me/threads");
  if (query.trim()) {
    url.searchParams.set("q", query.trim());
  }
  url.searchParams.set("maxResults", String(Math.max(1, Math.min(maxResults, 25))));

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

export async function fetchProfileEmail(token: string): Promise<string | undefined> {
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as { emailAddress?: string };
  return data.emailAddress;
}
