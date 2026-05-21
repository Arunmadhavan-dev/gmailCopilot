import { AI_CONFIG } from "../../ai/config";
import { getActionEngine } from "../../ai/actionEngine";
import { IntentParser } from "../../ai/intentParser";
import { GroqClient } from "../../ai/groqClient";
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

  // AI Intent Parsing
  if (message.type === "AI_PARSE_INTENT") {
    if (!AI_CONFIG.ENABLED) {
      return { ok: false, error: "AI features not configured. Set GROQ_API_KEY in .env" };
    }

    try {
      const client = new GroqClient(AI_CONFIG.GROQ_API_KEY, AI_CONFIG.GROQ_MODEL);
      const parser = new IntentParser(client);
      const result = await parser.parseIntent(message.input, message.context);

      return { ok: true, intent: result };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to parse intent"
      };
    }
  }

  // AI Action Execution
  if (message.type === "AI_EXECUTE_ACTION") {
    try {
      const engine = getActionEngine();
      const result = await withFreshToken((token) =>
        engine.execute(message.action as import("../../ai/types").AIAction, token)
      );

      return { ok: true, result };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to execute action"
      };
    }
  }

  return { ok: false, error: "Unknown message type." };
}
