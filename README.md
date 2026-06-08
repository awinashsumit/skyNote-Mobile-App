# skyNote — Mobile Prototype

A walkable, static HTML/CSS prototype of the skyNote mobile experience, built on the
Skypoint Design System (Fluent 2 base, amber `#FFB31C`, Segoe UI ramp).

## View it live

Open the GitHub Pages link for this repo, or jump straight to the home screen:
**`/mobile/home.html`**

> Best viewed on a phone, or in your browser's device/responsive mode (e.g. iPhone width).

## Run it locally

It's plain HTML — no build step. Either:

- **Quickest:** open `index.html` in a browser (it redirects to the mobile home), **or**
- **Recommended (so relative paths resolve cleanly):** serve the folder:
  ```bash
  python3 -m http.server 5520
  ```
  then open <http://localhost:5520/>.

## What's inside

- `mobile/` — the 12 mobile screens (`home`, `conversations`, `conversation-detail`,
  `action-items`, `skyagent`, `channels`, `channel-detail`, `insights`, `library`,
  `live`, `settings`) plus `mobile.css` and `mobile-app.js` (the phone shell injector).
- `tokens.css` — design tokens (light + dark).
- `app.css`, `skynote.css` — shared component styles.
- `assets/` — icon set, Chart.js + theme, and the skyNote logo.

## Notes

- Toggle light/dark from the account sheet (tap the avatar, top right) or Settings → Appearance.
- This is a design prototype: buttons navigate between screens but there's no backend.
