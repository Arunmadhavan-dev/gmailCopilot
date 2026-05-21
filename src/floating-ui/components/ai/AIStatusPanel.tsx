import type { AICommandState } from "../../hooks/useAICommands";
import { SearchResults } from "./SearchResults";

interface AIStatusPanelProps {
  state: AICommandState;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AIStatusPanel({ state, onConfirm, onCancel }: AIStatusPanelProps) {
  switch (state.status) {
    case "parsing":
      return <p>🤔 Understanding: "{state.input}"...</p>;

    case "executing":
      return <p>⚡ Executing {state.intent.action.action}...</p>;

    case "needs_confirmation":
      return (
        <div>
          <p>
            ⚠️ Confirm: {state.intent.action.action} with query "{state.intent.action.query}"?
          </p>
          <p>
            <button className="ic-send" type="button" onClick={onConfirm}>
              Confirm
            </button>{" "}
            <button className="ic-send" type="button" onClick={onCancel}>
              Cancel
            </button>
          </p>
        </div>
      );

    case "completed":
      return (
        <div>
          <p>
            ✅ {state.intent.action.action} completed. {state.result.affectedCount ?? 0} items found.
          </p>
          <SearchResults action={state.intent.action.action} data={state.result.data} />
        </div>
      );

    case "error":
      return <p>❌ {state.error}</p>;

    default:
      return null;
  }
}
