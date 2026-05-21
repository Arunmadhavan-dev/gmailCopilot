import { handleAuthMessage } from "./authHandlers";
import { handleGmailMessage } from "./gmailHandlers";
import { handleAIMessage } from "./aiHandlers";
import { type RuntimeMessage } from "../../types/runtime";

export async function handleRuntimeMessage(message: RuntimeMessage): Promise<unknown> {
  // Route by message category
  const authResult = await handleAuthMessage(message as Parameters<typeof handleAuthMessage>[0]);
  if (authResult) return authResult;

  const gmailResult = await handleGmailMessage(message as Parameters<typeof handleGmailMessage>[0]);
  if (gmailResult) return gmailResult;

  const aiResult = await handleAIMessage(message as Parameters<typeof handleAIMessage>[0]);
  if (aiResult) return aiResult;

  return { ok: false, error: "Unknown message type." };
}
