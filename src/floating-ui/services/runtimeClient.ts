import { type RuntimeMessage } from "../../types/runtime";

export async function sendRuntimeMessage<T>(message: RuntimeMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
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
