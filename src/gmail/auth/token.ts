/**
 * Gmail OAuth Token Management
 */

/**
 * Get OAuth token from Chrome identity API
 */
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

/**
 * Clear cached auth token and revoke from Google
 */
export async function clearAuthToken(token: string): Promise<void> {
  await new Promise<void>((resolve) => {
    chrome.identity.removeCachedAuthToken({ token }, () => resolve());
  });

  // Revoke token on Google's servers
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  }).catch((err) => {
    // Revocation network failures are non-fatal for local logout
    console.warn("Token revocation failed:", err);
  });
}
