const OVERLAY_ROOT_ID = "inbox-copilot-overlay-root";

export function ensureOverlayHost(): HTMLElement {
  const existing = document.getElementById(OVERLAY_ROOT_ID);

  if (existing) {
    return existing;
  }

  const host = document.createElement("div");
  host.id = OVERLAY_ROOT_ID;
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.pointerEvents = "none";
  host.style.zIndex = "2147483647";

  document.body.appendChild(host);
  return host;
}
