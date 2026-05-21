import { type RuntimeMessage } from "../../types/runtime";

export async function sendRuntimeMessage<T>(message: RuntimeMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        const msg = chrome.runtime.lastError.message;
        if (msg?.includes("Extension context invalidated")) {
          reject(new Error("Extension was reloaded. Please refresh the page to continue."));
        } else {
          reject(new Error(msg));
        }
        return;
      }

      if (!response?.ok) {
        reject(new Error(response?.error ?? "Request failed"));
        return;
      }

      resolve(response as T);
    });
  });
}
