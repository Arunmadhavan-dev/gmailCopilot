import { useUiStore } from "../state/uiStore";
import { useGmailContextLabel } from "./hooks/useGmailContextLabel";
import { useAssistantData } from "./hooks/useAssistantData";
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
