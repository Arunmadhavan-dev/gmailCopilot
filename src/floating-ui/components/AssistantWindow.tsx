import { AnimatePresence, motion } from "framer-motion";
import { JSX } from "react";
import { type GmailThread } from "../../types/runtime";
import type { AICommandState } from "../hooks/useAICommands";

type Props = {
  isOpen: boolean;
  contextLabel: string;
  connectedLabel: string;
  threads: GmailThread[];
  error: string;
  aiState: AICommandState;
  aiInput: string;
  onAiInputChange: (value: string) => void;
  onAiSubmit: () => void;
  onAiConfirm: () => void;
  onAiCancel: () => void;
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
  aiState,
  aiInput,
  onAiInputChange,
  onAiSubmit,
  onAiConfirm,
  onAiCancel,
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

            {/* AI Command Status */}
            {aiState.status === "parsing" && <p>🤔 Understanding: "{aiState.input}"...</p>}
            {aiState.status === "executing" && <p>⚡ Executing {aiState.intent.action.action}...</p>}
            {aiState.status === "needs_confirmation" && (
              <div>
                <p>⚠️ Confirm: {aiState.intent.action.action} with query "{aiState.intent.action.query}"?</p>
                <p>
                  <button className="ic-send" type="button" onClick={onAiConfirm}>Confirm</button>{" "}
                  <button className="ic-send" type="button" onClick={onAiCancel}>Cancel</button>
                </p>
              </div>
            )}
            {aiState.status === "completed" && (
              <div>
                <p>✅ {aiState.intent.action.action} completed. {aiState.result.affectedCount ?? 0} items found.</p>
                {/* Show search results */}
                {aiState.intent.action.action === "search_emails" && 
                  aiState.result.data && 
                  Array.isArray(aiState.result.data) && (
                  <div style={{ marginTop: "8px" }}>
                    {(aiState.result.data as Array<{ id: string; snippet?: string }>).map((thread) => (
                      <p key={thread.id} style={{ fontSize: "12px", margin: "4px 0" }}>
                        • {thread.snippet ? thread.snippet.substring(0, 100) : thread.id}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {aiState.status === "error" && <p>❌ {aiState.error}</p>}
          </div>

          {/* AI Input */}
          <div className="ic-input-row">
            <input
              className="ic-input"
              placeholder="Ask Inbox Copilot... (e.g., 'find emails from john')"
              value={aiInput}
              onChange={(e) => onAiInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAiSubmit()}
              disabled={aiState.status === "parsing" || aiState.status === "executing"}
            />
            <button
              className="ic-send"
              type="button"
              onClick={onAiSubmit}
              disabled={aiState.status === "parsing" || aiState.status === "executing"}
            >
              {aiState.status === "parsing" || aiState.status === "executing" ? "..." : "Send"}
            </button>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
