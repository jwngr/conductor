# Conductor | Contributing

## Packages

The repo is organized into TypeScript packages which share code and are managed via
[Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/).

The packages are:

- `/shared` - Common types, schemas, and libraries shared across all packages, client and server
- `/sharedClient` - Common code shared across client-side packages
- `/sharedServer` - Common code shared across server-side packages
- `/pwa` - Progressive Web App, for web, desktop, and mobile
- `/extension` - Browser extension, for Chromium-based browsers
- `/functions` - Firebase Cloud Functions, for "serverless" server-side actions
- `/scripts` - Helpful scripts for maintaining the repo
- `/rssServer` - Mock RSS server implementation for local development

## Initial setup

1.  Clone the repo:

    ```bash
    $ git clone git@github.com:jwngr/conductor.git
    $ cd conductor
    ```

1.  Install [Yarn v4](https://yarnpkg.com/getting-started/install). Yarn workspaces are used to
    share code across several packages (e.g `pwa`, `extension`, and `functions`):

    ```bash
    $ corepack enable
    # If above fails: run `npm install -g corepack` then try again
    $ corepack prepare yarn@4 --activate
    $ yarn --version
    # Confirm above outputted 4.x.x
    ```

1.  Install the [Firebase CLI] as a global dependency, which will be used for running the local
    emulator and for deploying to your local Firebase project:

    ```bash
    # Note this is `firebase-tools`, not `firebase`!
    $ yarn global add firebase-tools
    ```

1.  Install all dependencies:

    ```bash
    $ yarn install
    ```

1.  Create a new [Firebase project](https://firebase.google.com/) for local development. Enable the
    following:

    1.  Firestore
    1.  Functions
    1.  Cloud Storage
    1.  Auth (passwordless link via email)

    **Note:** Enabling Analytics is not required for local development.

1.  Populate a `.env` file at the root of the repo:

    ```bash
    $ cp dot-env.example .env
    # Open `.env` and add config.
    ```

1.  Create a [Firecrawl account](https://www.firecrawl.dev/) and generate an API key for
    local development.

1.  Create a [Superfeedr account](https://superfeedr.com/) and generate an API key with
    full permissions for local development.

1.  Populate a `.env.<FIREBASE_PROJECT_ID>` file inside of `/packages/functions`:

    ```bash
    $ cp /packages/functions/dot-env.example /packages/functions/.env.<FIREBASE_PROJECT_ID>
    # Open `.env.<FIREBASE_PROJECT_ID>` and add config.
    ```

## Run PWA locally

To start the PWA (Progressive Web App) at http://localhost:5173/, run:

```bash
$ yarn run dev:pwa
```

## Run Firebase emulator suite locally

This repo is configured to work with the
[Firebase emulator suite](https://firebase.google.com/docs/emulator-suite), as defined in
[`firebase.json`](/firebase.json). To run the emulator suite yourself:

1. _(first time only)_ Install Java, if you don't already have some version installed (does not need
   to be OpenJDK):

   ```bash
   $ brew install openjdk
   ```

1. Set `VITE_FIREBASE_USE_EMULATOR=true` in `.env` file at the root of the repo.

1. Build the `functions` package:

   ```bash
   $ yarn run build:functions
   ```

1. Start the local Firebase emulator suite:

   ```bash
   $ yarn run dev:functions
   ```

1. Restart other packages (e.g. PWA, extension) which rely on Firebase.

1. Visit the Firebase emulator admin UI at http://localhost:4000.

1. Enter any valid email address and click the login button. No email will actually be sent.

1. Copy the fully authenticated sign-in URL from the same shell which ran the `yarn` command above.

1. Visit the URL to sign into the account associated to the email address you entered. The account
   will be created if it does not already exist.

## Run RSS server locally

The `/rssServer` package implements an in-memory RSS server for local development. To run it:

```bash
$ yarn run dev:rss
```

It will be accessible at http://localhost:6556.

## Open browser extension locally

1. Build the extension:

   ```bash
   $ yarn run build:extension
   ```

1. Go to [`chrome://extensions`](chrome://extensions).

1. Enable "Developer mode".

1. Click "Load unpacked".

1. Select the `packages/extension/dist` folder.

The extension will now be available from your browser toolbar, although it may be hidden in a
dropdown.

The extension works in Chromium-based browsers.

## CORS

CORS headers are managed in [`cors.json`](/cors.json). To update them, run:

```bash
$ gsutil cors set cors.json gs://<FIREBASE_PROJECT_ID>.appspot.com
```

Changes should take effect within a few seconds.
