export type AuthStatus = {
  connected: boolean;
  emailHint?: string;
};

export type GmailThread = {
  id: string;
  snippet?: string;
};

export type RuntimeMessage =
  | { type: "AUTH_STATUS" }
  | { type: "AUTH_LOGIN" }
  | { type: "AUTH_LOGOUT" }
  | { type: "GMAIL_LIST_THREADS"; query?: string; maxResults?: number }
  | { type: "AI_PARSE_INTENT"; input: string; context?: string }
  | { type: "AI_EXECUTE_ACTION"; action: unknown; confirmed?: boolean };

export type RuntimeSuccessResponse =
  | { ok: true; status: AuthStatus }
  | { ok: true; threads: GmailThread[] };

export type RuntimeErrorResponse = {
  ok: false;
  error: string;
};

export type RuntimeResponse = RuntimeSuccessResponse | RuntimeErrorResponse;
