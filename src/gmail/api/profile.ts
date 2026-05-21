/**
 * Fetch user's Gmail profile email address
 */
export async function fetchProfileEmail(token: string): Promise<string | undefined> {
  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/profile",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    return undefined;
  }

  const data = (await response.json()) as { emailAddress?: string };
  return data.emailAddress;
}
