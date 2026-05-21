import { AnimatePresence, motion } from "framer-motion";
import type { JSX } from "react";
import type { GmailThread } from "../../types/runtime";
import type { AICommandState } from "../hooks/useAICommands";
import { AIStatusPanel, AIInput, GmailStatus } from "./ai";

interface AssistantWindowProps {
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
}

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
}: AssistantWindowProps): JSX.Element {
  const isLoading = aiState.status === "parsing" || aiState.status === "executing";

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
            <GmailStatus
              connectedLabel={connectedLabel}
              threads={threads}
              error={error}
              onConnect={onConnectGoogle}
              onDisconnect={onDisconnectGoogle}
              onLoadThreads={onLoadThreads}
            />
            
            <AIStatusPanel
              state={aiState}
              onConfirm={onAiConfirm}
              onCancel={onAiCancel}
            />
          </div>

          <AIInput
            value={aiInput}
            onChange={onAiInputChange}
            onSubmit={onAiSubmit}
            isLoading={isLoading}
          />
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
