import type { GmailThread } from "../../../types/runtime";

interface GmailStatusProps {
  connectedLabel: string;
  threads: GmailThread[];
  error: string;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onLoadThreads: () => Promise<void>;
}

export function GmailStatus({
  connectedLabel,
  threads,
  error,
  onConnect,
  onDisconnect,
  onLoadThreads
}: GmailStatusProps) {
  return (
    <>
      <p>Google OAuth: {connectedLabel}</p>
      <p>
        <button className="ic-send" type="button" onClick={() => void onConnect()}>
          Connect Google
        </button>{" "}
        <button className="ic-send" type="button" onClick={() => void onDisconnect()}>
          Logout
        </button>{" "}
        <button className="ic-send" type="button" onClick={() => void onLoadThreads()}>
          Load Inbox Threads
        </button>
      </p>
      {error ? <p>Error: {error}</p> : null}
      {threads.length > 0 ? <p>Recent threads:</p> : null}
      {threads.map((thread) => (
        <p key={thread.id}>
          - {thread.id} {thread.snippet ? `| ${thread.snippet}` : ""}
        </p>
      ))}
    </>
  );
}
