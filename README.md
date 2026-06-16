# Electron 42 macOS Notification Tester

> Companion repository for the Medium article
> **[Testing macOS Notifications in Electron 42 During Local Development](https://john-tacker.medium.com/testing-macos-notifications-in-electron-42-during-local-development-269b5c9f508c)**

A tiny Electron app, built **for educational purposes**, that demonstrates the Electron 42 macOS notification breaking change — and shows how to make notifications work on your machine during local development without packaging or a paid Apple Developer account.

---

## What this is about

Starting with **Electron 42**, macOS notifications use the modern `UNNotification` API instead of the deprecated `NSUserNotification` API:

> The new API requires that an application be **code-signed** in order for notifications to be displayed. If an application is not code-signed, notifications will emit a `failed` event on the `Notification` object. — [electron/electron#47817](https://github.com/electron/electron/pull/47817)

In practice, `npm start` runs the **unsigned** `Electron.app` from `node_modules`, so every notification fails — silently, unless you listen for the `failed` event. This repo makes that behavior visible and walks through the fix.

## Features

- 🔔 **Notification tester** — send a notification with a custom title, body, and silent flag.
- 📜 **History panel** — a live log of every notification attempt and the lifecycle events it emitted (`show`, `click`, `close`, `failed`), so the `UNErrorDomain error 1` failure is right there on screen.
- 🔏 **Local code-signing workflow** — an `npm` script to sign the dev binary with a free self-signed certificate, so notifications actually appear.

## Project structure

| File | Role |
| --- | --- |
| `main.js` | Main process — creates the `Notification`, listens for `show`/`click`/`close`/`failed`, keeps the history. |
| `preload.js` | Safe `contextBridge` API exposing notifications to the renderer over IPC. |
| `index.html` | The notification form and history list. |
| `renderer.js` | Wires up the UI and renders the live history. |
| `scripts/sign-electron.js` | Re-signs the dev `Electron.app` with the local certificate (macOS only). |

## Getting started

You'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/).

```bash
# Clone and install
git clone https://github.com/JohnJunior/electron-notifications-osx
cd electron-notifications-osx
npm install

# Run the app
npm start
```

Click **Send notification**. On an unsigned build you'll see the history record a `failed` event — that's the breaking change in action.

## Making notifications work on macOS (development)

To display notifications locally, the running `Electron.app` must be code-signed with a **stable** identity. A free, self-signed certificate is enough — see the [article](https://john-tacker.medium.com/testing-macos-notifications-in-electron-42-during-local-development-269b5c9f508c) for the full step-by-step.

Once you've created a self-signed `Electron Dev` code-signing certificate in your Keychain, sign the dev binary:

```bash
npm run sign:dev
```

This is also wired into a `postinstall` hook, so the signature is re-applied automatically after every `npm install`. On non-macOS platforms it's a no-op.

> 💡 The first launch after signing will prompt for Keychain access to "Electron Safe Storage" — click **Always Allow**. Because the certificate has a stable identity, this is remembered for good.

## npm scripts

| Script | What it does |
| --- | --- |
| `npm start` | Launch the app. |
| `npm run sign:dev` | Sign the dev `Electron.app` with the `Electron Dev` certificate (macOS). |
| `postinstall` | Runs `sign:dev` automatically after `npm install` (no-op off macOS). |

## Learn more

- 📝 [Read the full article on Medium](https://john-tacker.medium.com/testing-macos-notifications-in-electron-42-during-local-development-269b5c9f508c)
- 📚 [Electron Notification docs](https://www.electronjs.org/docs/latest/api/notification)
- 🔧 [Electron 42 breaking change](https://www.electronjs.org/docs/latest/breaking-changes#planned-breaking-api-changes-420)

## License

[MIT](LICENSE)
