import { GmailApiError, clearAuthToken, getAuthToken } from "../../gmail";

export async function getValidToken(interactiveFallback: boolean): Promise<string> {
  let token: string | null = null;

  try {
    token = await getAuthToken(false);
  } catch {
    token = null;
  }

  if (!token && interactiveFallback) {
    try {
      token = await getAuthToken(true);
    } catch {
      token = null;
    }
  }

  if (!token) {
    throw new Error("Google OAuth token is not available.");
  }

  return token;
}

export async function withFreshToken<T>(operation: (token: string) => Promise<T>): Promise<T> {
  const token = await getValidToken(true);

  try {
    return await operation(token);
  } catch (error) {
    if (!(error instanceof GmailApiError) || error.status !== 401) {
      throw error;
    }

    await clearAuthToken(token);
    const refreshed = await getAuthToken(true);

    if (!refreshed) {
      throw new Error("Failed to refresh Google OAuth token.");
    }

    return operation(refreshed);
  }
}
