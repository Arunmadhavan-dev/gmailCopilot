import { clearAuthToken, fetchProfileEmail, getAuthToken } from "../../gmail/authAndApi";
import type { RuntimeMessage } from "../../types/runtime";
import { getValidToken } from "../services/tokenService";

type AuthMessage =
  | { type: "AUTH_STATUS" }
  | { type: "AUTH_LOGIN" }
  | { type: "AUTH_LOGOUT" };

export async function handleAuthMessage(message: AuthMessage): Promise<unknown> {
  switch (message.type) {
    case "AUTH_STATUS":
      return handleAuthStatus();

    case "AUTH_LOGIN":
      return handleAuthLogin();

    case "AUTH_LOGOUT":
      return handleAuthLogout();

    default:
      return null;
  }
}

async function handleAuthStatus() {
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

async function handleAuthLogin() {
  const token = await getValidToken(true);
  const emailHint = await fetchProfileEmail(token);
  return { ok: true, status: { connected: true, emailHint } };
}

async function handleAuthLogout() {
  const token = await getAuthToken(false);
  if (token) {
    await clearAuthToken(token);
  }
  return { ok: true, status: { connected: false } };
}
