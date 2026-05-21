import { AnimatePresence, motion } from "framer-motion";
import { type GmailThread } from "../../types/runtime";

type Props = {
  isOpen: boolean;
  contextLabel: string;
  connectedLabel: string;
  threads: GmailThread[];
  error: string;
  onConnectGoogle: () => Promise<void>;
  onDisconnectGoogle: () => Promise<void>;
  onLoadThreads: () => Promise<void>;
};

export function AssistantWindow({
  isOpen,
  contextLabel,
  connectedLabel,
  threads,
  error,
  onConnectGoogle,
  onDisconnectGoogle,
  onLoadThreads
}: Props): JSX.Element {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.section
          key="chat-window"
          className="ic-window"
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          aria-label="Inbox Copilot assistant"
        >
          <header className="ic-header">Inbox Copilot - {contextLabel}</header>
          <div className="ic-body">
            <p>Google OAuth: {connectedLabel}</p>
            <p>
              <button className="ic-send" type="button" onClick={() => void onConnectGoogle()}>Connect Google</button>{" "}
              <button className="ic-send" type="button" onClick={() => void onDisconnectGoogle()}>Logout</button>{" "}
              <button className="ic-send" type="button" onClick={() => void onLoadThreads()}>Load Inbox Threads</button>
            </p>
            {error ? <p>Error: {error}</p> : null}
            {threads.length > 0 ? <p>Recent threads:</p> : null}
            {threads.map((thread) => (
              <p key={thread.id}>- {thread.id} {thread.snippet ? `| ${thread.snippet}` : ""}</p>
            ))}
          </div>
          <div className="ic-input-row">
            <input className="ic-input" placeholder="Ask Inbox Copilot..." />
            <button className="ic-send" type="button">Send</button>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
