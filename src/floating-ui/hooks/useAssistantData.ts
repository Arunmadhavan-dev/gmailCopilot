import { useEffect, useState } from "react";
import { sendRuntimeMessage } from "../services/runtimeClient";
import { type AuthStatus, type GmailThread } from "../../types/runtime";

type AssistantDataConfig = {
  query?: string;
  maxResults?: number;
};

export function useAssistantData(config: AssistantDataConfig = {}) {
  const query = config.query ?? "in:inbox";
  const maxResults = config.maxResults ?? 5;
  const [auth, setAuth] = useState<AuthStatus>({ connected: false });
  const [threads, setThreads] = useState<GmailThread[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    sendRuntimeMessage<{ status: AuthStatus }>({ type: "AUTH_STATUS" })
      .then((res) => setAuth(res.status))
      .catch((err: Error) => setError(err.message));
  }, []);

  const connectGoogle = async (): Promise<void> => {
    setError("");
    const res = await sendRuntimeMessage<{ status: AuthStatus }>({ type: "AUTH_LOGIN" });
    setAuth(res.status);
  };

  const disconnectGoogle = async (): Promise<void> => {
    setError("");
    setThreads([]);
    const res = await sendRuntimeMessage<{ status: AuthStatus }>({ type: "AUTH_LOGOUT" });
    setAuth(res.status);
  };

  const loadThreads = async (): Promise<void> => {
    setError("");
    const res = await sendRuntimeMessage<{ threads: GmailThread[] }>({
      type: "GMAIL_LIST_THREADS",
      query,
      maxResults
    });
    setThreads(res.threads);
  };

  return {
    auth,
    threads,
    error,
    setError,
    connectGoogle,
    disconnectGoogle,
    loadThreads
  };
}
