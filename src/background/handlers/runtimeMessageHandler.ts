import { clearAuthToken, fetchGmailThreads, fetchProfileEmail, getAuthToken } from "../../gmail/authAndApi";
import { type RuntimeMessage } from "../../types/runtime";
import { getValidToken, withFreshToken } from "../services/tokenService";

export async function handleRuntimeMessage(message: RuntimeMessage): Promise<unknown> {
  if (message.type === "AUTH_STATUS") {
    try {
      const token = await getAuthToken(false);
      if (!token) {
        return { ok: true, status: { connected: false } };
      }

      const emailHint = await fetchProfileEmail(token);
      return { ok: true, status: { connected: true, emailHint } };
    } catch {
      return { ok: true, status: { connected: false } };
    }
  }

  if (message.type === "AUTH_LOGIN") {
    const token = await getValidToken(true);
    const emailHint = await fetchProfileEmail(token);
    return { ok: true, status: { connected: true, emailHint } };
  }

  if (message.type === "AUTH_LOGOUT") {
    const token = await getAuthToken(false);
    if (token) {
      await clearAuthToken(token);
    }
    return { ok: true, status: { connected: false } };
  }

  if (message.type === "GMAIL_LIST_THREADS") {
    const threads = await withFreshToken((token) =>
      fetchGmailThreads(token, message.query ?? "", message.maxResults ?? 10)
    );

    return { ok: true, threads };
  }

  return { ok: false, error: "Unknown message type." };
}
