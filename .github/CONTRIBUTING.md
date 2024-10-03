# Conductor

## Packages

The repo is organized into TypeScript packages which share code and are managed via
[Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/).

The packages are:

- `/shared` - Common models and libraries shared across all packages
- `/pwa` - Progressive Web App
- `/extension` - Browser extension
- `/scripts` - Helpful scripts for maintaining this repo

## Initial setup

1. Clone the repo:

```bash
$ git clone git@github.com:jwngr/conductor.git
$ cd conductor
```

1. Create a Firebase project for loca and enable the following:
1. Firestore
1. Email authentication + passwordless auth
1. No need to enable Auth for these non-prod projects.

1. Add a Firebase config to a `.env` file at the root of the repo:

```bash
$ cp .env.example .env
# Open .env and add your Firebase config.
```

1. Install Yarn (this repo uses Yarn workspaces to share code across all client and server code):

```bash
$ npm install --global yarn
```

1. Install all dependencies:

```bash
$ yarn install
```

## Start PWA

```bash
$ yarn run start:pwa
```

Opens at http://localhost:5173/.

## Open browser extension locally

1. Build the extension:

```bash
$ yarn run build:extension
```

1. Go to [`chrome://extensions`](chrome://extensions).

1. Enable "Developer mode"

1. Click "Load unpacked"

1. Select the `packages/extension/dist` folder.

The extension will now be available from your browser toolbar, although it may be hidden in a dropdown.

The extension works in Chromium-based browsers.

Opens at http://localhost:5173/.
