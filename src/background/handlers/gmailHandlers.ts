import { fetchGmailThreads } from "../../gmail";
import type { RuntimeMessage } from "../../types/runtime";
import { withFreshToken } from "../services/tokenService";

type GmailMessage = {
  type: "GMAIL_LIST_THREADS";
  query?: string;
  maxResults?: number;
};

export async function handleGmailMessage(message: GmailMessage): Promise<unknown> {
  if (message.type === "GMAIL_LIST_THREADS") {
    const threads = await withFreshToken((token) =>
      fetchGmailThreads(token, message.query ?? "", message.maxResults ?? 10)
    );

    return { ok: true, threads };
  }

  return null;
}
