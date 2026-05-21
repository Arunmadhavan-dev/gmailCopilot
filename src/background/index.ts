import { type RuntimeMessage } from "../types/runtime";
import { handleRuntimeMessage } from "./handlers/runtimeMessageHandler";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Inbox Copilot installed");
});

chrome.runtime.onMessage.addListener((message: RuntimeMessage, _sender, sendResponse) => {
  handleRuntimeMessage(message)
    .then((response) => sendResponse(response))
    .catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Unknown background error";
      sendResponse({ ok: false, error: errorMessage });
    });

  return true;
});
