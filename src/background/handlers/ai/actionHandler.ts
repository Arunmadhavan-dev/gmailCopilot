import { getActionEngine } from "../../../ai/engine/factory";
import type { AIAction } from "../../../ai/types";
import { withFreshToken } from "../../services/tokenService";

/**
 * Execute AI action with Gmail API
 */
export async function handleExecuteAction(action: AIAction) {
  try {
    const engine = getActionEngine();
    const result = await withFreshToken((token) =>
      engine.execute(action, token)
    );

    return { ok: true, result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to execute action"
    };
  }
}
