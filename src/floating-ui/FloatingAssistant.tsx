import { useUiStore } from "../state/uiStore";
import { useGmailContextLabel } from "./hooks/useGmailContextLabel";
import { useAssistantData } from "./hooks/useAssistantData";
import { useAICommands } from "./hooks/useAICommands";
import { AssistantWindow } from "./components/AssistantWindow";
import { JSX } from "react";

export function FloatingAssistant(): JSX.Element {
  const isOpen = useUiStore((s) => s.isOpen);
  const toggle = useUiStore((s) => s.toggle);
  const contextLabel = useGmailContextLabel();
  const { auth, threads, error, setError, connectGoogle, disconnectGoogle, loadThreads } = useAssistantData({
    query: "in:inbox",
    maxResults: 5
  });

  const aiCommands = useAICommands();

  const connectedLabel = auth.connected ? `connected (${auth.emailHint ?? "account"})` : "not connected";

  const safeAction = async (action: () => Promise<void>, fallbackError: string): Promise<void> => {
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackError);
    }
  };

  return (
    <div className="ic-shell" aria-live="polite">
      <AssistantWindow
        isOpen={isOpen}
        contextLabel={contextLabel}
        connectedLabel={connectedLabel}
        threads={threads}
        error={error}
        aiState={aiCommands.state}
        aiInput={aiCommands.input}
        onAiInputChange={aiCommands.setInput}
        onAiSubmit={() => aiCommands.submitCommand(aiCommands.input, contextLabel)}
        onAiConfirm={aiCommands.confirmAction}
        onAiCancel={aiCommands.cancelAction}
        onConnectGoogle={() => safeAction(connectGoogle, "Login failed")}
        onDisconnectGoogle={() => safeAction(disconnectGoogle, "Logout failed")}
        onLoadThreads={() => safeAction(loadThreads, "Unable to load Gmail threads")}
      />

      <button className="ic-button" type="button" onClick={toggle} aria-expanded={isOpen}>
        {isOpen ? "Close" : "AI"}
      </button>
    </div>
  );
}
