const STYLE_ID = "inbox-copilot-inline-styles";

export function injectOverlayStyles(shadowRoot: ShadowRoot): void {
  if (shadowRoot.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
      font-family: "Segoe UI", "Inter", sans-serif;
    }

    .ic-shell {
      position: fixed;
      right: 24px;
      bottom: 24px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      pointer-events: none;
    }

    .ic-button {
      width: 56px;
      height: 56px;
      border: none;
      border-radius: 9999px;
      background: linear-gradient(135deg, #0f766e 0%, #0f172a 100%);
      color: #ffffff;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 16px 30px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      pointer-events: auto;
    }

    .ic-window {
      width: min(420px, calc(100vw - 32px));
      height: min(640px, calc(100vh - 110px));
      border-radius: 18px;
      background: #ffffff;
      border: 1px solid #d0d7de;
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.3);
      overflow: hidden;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
    }

    .ic-header {
      padding: 14px 16px;
      background: #0f172a;
      color: #e2e8f0;
      font-size: 14px;
      font-weight: 600;
    }

    .ic-body {
      flex: 1;
      padding: 14px 16px;
      color: #1f2937;
      font-size: 14px;
      line-height: 1.45;
      overflow: auto;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .ic-input-row {
      border-top: 1px solid #e2e8f0;
      padding: 10px;
      background: #ffffff;
      display: flex;
      gap: 8px;
    }

    .ic-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 14px;
      outline: none;
    }

    .ic-send {
      border: none;
      border-radius: 10px;
      background: #0f766e;
      color: white;
      padding: 0 14px;
      font-weight: 600;
      cursor: pointer;
    }
  `;

  shadowRoot.appendChild(style);
}
