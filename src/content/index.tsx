import { createRoot, type Root } from "react-dom/client";
import { FloatingAssistant } from "../floating-ui/FloatingAssistant";
import { ensureOverlayHost } from "../overlay/ensureOverlayHost";
import { injectOverlayStyles } from "../overlay/injectOverlayStyles";

const SHADOW_MOUNT_ID = "inbox-copilot-shadow-mount";
let root: Root | null = null;

function mount(): void {
  if (!document.body) {
    return;
  }

  const host = ensureOverlayHost();
  let shadowRoot = host.shadowRoot;

  if (!shadowRoot) {
    shadowRoot = host.attachShadow({ mode: "open" });
    injectOverlayStyles(shadowRoot);
  }

  let mountNode = shadowRoot.getElementById(SHADOW_MOUNT_ID);

  if (!mountNode) {
    mountNode = document.createElement("div");
    mountNode.id = SHADOW_MOUNT_ID;
    shadowRoot.appendChild(mountNode);
  }

  if (!root) {
    root = createRoot(mountNode);
  }

  root.render(<FloatingAssistant />);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
