# Inbox Copilot - Phase 1 + Phase 2 Foundation

This repository now contains:
- Manifest V3 extension setup
- Gmail content-script injection
- Floating trigger button + expandable chat window (Shadow DOM)
- Google OAuth (Chrome Identity API)
- Gmail API access (threads list proof path)

## Required setup for OAuth

1. Create OAuth client in Google Cloud Console for a Chrome Extension.
2. Add extension OAuth client id in `manifest.json`:
   - `oauth2.client_id`
3. Ensure Gmail API is enabled in your Google Cloud project.

## Run

1. Install dependencies:
   npm install
2. Build extension:
   npm run build
3. Load unpacked extension in Chrome:
   - Open `chrome://extensions`
   - Enable Developer Mode
   - Click "Load unpacked"
   - Select `dist/`

## Verify Gmail Authentication

- Open Gmail.
- Click floating `AI` button.
- Click `Connect Google`.
- Click `Load Inbox Threads` to confirm Gmail API access.

## Notes

- Overlay is isolated with Shadow DOM to avoid Gmail CSS conflicts.
- UI state uses Zustand.
- Open/close animation uses Framer Motion.
- OAuth + Gmail calls are handled in background service worker.
