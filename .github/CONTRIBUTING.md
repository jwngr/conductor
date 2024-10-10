# Conductor

## Packages

The repo is organized into TypeScript packages which share code and are managed via
[Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/).

The packages are:

- `/shared` - Common models and libraries shared across all packages
- `/pwa` - Progressive Web App
- `/extension` - Browser extension
- `/functions` - Firebase cloud functions (import queue)
- `/scripts` - Helpful scripts for maintaining this repo

## Initial setup

1. Clone the repo:

   ```bash
   $ git clone git@github.com:jwngr/conductor.git
   $ cd conductor
   ```

1. Create a Firebase project for local development and enable the following:

   1. Firestore
   1. Functions
   1. Cloud Storage
   1. Email authentication + passwordless auth

   Note: Enabling Analytics is not required for local development.

1. Populate a `.env` file at the root of the repo:

   ```bash
   $ cp .env.example .env
   # Open .env and add all non-optional config.
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

## Running Firebase emulator suite locally

This repo is configured to work with the [Firebase emulator suite](https://firebase.google.com/docs/emulator-suite)
for the following products:

1. Firestore
2. Firebase Functions

To run the emulator suite yourself, do the following:

1. Install Firebase CLI (note it is `firebase-tools`, not `firebase`):

```bash
$ npm i -g firebase-tools
```

1. Install Java, if you don't already have some version installed (does not need to be OpenJDK):

```bash
$ brew install openjdk
```

1. Set `VITE_FIREBASE_USE_EMULATOR=true` in `.env` file at the root of the repo.

1. Start the Firebase emulator suite:

```bash
$ firebase emulators:start
```

1. Restart the corresponding service you need to run.

The Firebase emulator UI opens at http://localhost:4000.
