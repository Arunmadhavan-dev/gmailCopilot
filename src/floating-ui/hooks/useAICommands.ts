import { useState } from "react";
import { sendRuntimeMessage } from "../services/runtimeClient";
import type { IntentParseResult, ActionExecutionResult } from "../../ai/types";

export type AICommandState =
  | { status: "idle" }
  | { status: "parsing"; input: string }
  | { status: "needs_confirmation"; intent: IntentParseResult }
  | { status: "executing"; intent: IntentParseResult }
  | { status: "completed"; intent: IntentParseResult; result: ActionExecutionResult }
  | { status: "error"; error: string };

export function useAICommands() {
  const [state, setState] = useState<AICommandState>({ status: "idle" });
  const [input, setInput] = useState("");

  const submitCommand = async (command: string, context?: string) => {
    if (!command.trim()) return;

    setState({ status: "parsing", input: command });
    setInput("");

    try {
      // Parse intent
      const parseResponse = await sendRuntimeMessage<{ intent: IntentParseResult }>({
        type: "AI_PARSE_INTENT",
        input: command,
        context
      });

      const intent = parseResponse.intent;

      // If clarification needed, show it
      if (intent.action.action === "clarify") {
        setState({
          status: "error",
          error: intent.action.reason || "I need more information to understand your request."
        });
        return;
      }

      // If confirmation required, wait for user
      if (intent.action.requiresConfirmation) {
        setState({ status: "needs_confirmation", intent });
        return;
      }

      // Otherwise, execute immediately
      await executeAction(intent);
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to process command"
      });
    }
  };

  const executeAction = async (intent: IntentParseResult, confirmed = false) => {
    setState({ status: "executing", intent });

    try {
      const result = await sendRuntimeMessage<{ result: ActionExecutionResult }>({
        type: "AI_EXECUTE_ACTION",
        action: intent.action,
        confirmed
      });

      setState({ status: "completed", intent, result: result.result });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to execute action"
      });
    }
  };

  const confirmAction = async () => {
    if (state.status === "needs_confirmation" && state.intent) {
      await executeAction(state.intent, true);
    }
  };

  const cancelAction = () => {
    setState({ status: "idle" });
  };

  const reset = () => {
    setState({ status: "idle" });
    setInput("");
  };

  return {
    state,
    input,
    setInput,
    submitCommand,
    confirmAction,
    cancelAction,
    reset
  };
}
