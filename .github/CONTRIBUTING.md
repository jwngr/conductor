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
- `/rssServer` - In-memory RSS feed provider implementation for local development

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

1.  Install dependencies across all packages:

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

1.  [Firecrawl](https://www.firecrawl.dev/) is used to convert websites into LLM-friendly content.
    Create a Firecrawl account and generate an API key for local development.

1.  Copy all `.env` files from the `dot-env` directory:

    ```bash
    $ cp dot-env/shared.env .env
    $ cp dot-env/functions.env packages/functions/.env.<FIREBASE_PROJECT_ID>
    $ cp dot-env/rssServer.env packages/rssServer/.env
    $ cp dot-env/scripts.env packages/scripts/.env
    ```

1.  Open each `.env` file and add required config.

## Recurring setup (PWA)

To run the PWA locally, you need to run 3 things.

1. React frontend: `yarn run dev:pwa` (runs local web server)
1. Server functions: `yarn run dev:functions` (see [Server functions local development](#server-functions-local-development) for options)
1. RSS server: `yarn run dev:rss` (see [RSS feed provider local development](#rss-feed-provider-local-development) for options)

By default, the PWA runs against a local emulator (server functions) and in-memory feed provider
(RSS server). You can run against live services by following the instructions below:

- [Server functions local development](#server-functions-local-development)
- [RSS feed provider local development](#rss-feed-provider-local-development)

## Server functions local development

Firebase Functions power many server-side capabilities of Conductor. This repo is configured to work
with the [Firebase emulator suite](https://firebase.google.com/docs/emulator-suite), as defined
in [`firebase.json`](/firebase.json). It is recommended to run the emulator suite locally. However,
you can also develop against a live Firebase project.

**To run the Firebase emulator suite locally:**

1. _(first time only)_ Install Java (does not need to be OpenJDK): `brew install openjdk`
1. Set `VITE_FIREBASE_USE_EMULATOR=true` in `.env` file at the root of the repo
1. Build the `functions` package: `yarn run build:functions`
1. Start the local Firebase emulator suite: `yarn run dev:functions`
1. Visit the Firebase emulator admin UI at http://localhost:4000
1. Enter any valid email address and click the login button. No email will actually be sent.
1. Copy the fully authenticated sign-in URL from the same shell running the emulator suite
1. Visit the URL to sign into the account associated to the email address you entered. The account
   will be created if it does not already exist.

**To run against a live Firebase project:**

1. Set `VITE_FIREBASE_USE_EMULATOR=false` in `.env` file at the root of the repo
1. Build the `functions` package: `yarn run build:functions`
1. Deploy the server functions to Firebase: `yarn run deploy:functions`

## RSS feed provider local development

One of the core features of Conductor is the ability to subscribe to RSS feeds. However, Conductor
is not a full-fledged RSS feed provider. It relies on [Superfeedr](https://superfeedr.com/) in
production to subscribe to RSS feeds. However, it is not convenient to test against remote services
locally.

This repo comes with a default implementation of a in-memory RSS feed provider (`/rssServer`). It
is recommended to develop against this local implementation. However, if you are actively developing
the Superfeedr integration, you can also test against Superfeedr locally by following the
instructions below.

**To develop against a local in-memory feed provider (default):**

1. Set `RSS_FEED_PROVIDER_TYPE='local'` in `packages/functions/.env.<FIREBASE_PROJECT_ID>`
1. Run the RSS server: `yarn run dev:rss`

The RSS server will be accessible at http://localhost:6556.

**To develop against Superfeedr:**

1. Create a [Superfeedr](https://superfeedr.com/) account and generate an API key with full permissions
1. Set `RSS_FEED_PROVIDER_TYPE='superfeedr'` in `packages/functions/.env.<FIREBASE_PROJECT_ID>`
1. Set `SUPERFEEDR_USER` and `SUPERFEEDR_API_KEY` in `packages/functions/.env.<FIREBASE_PROJECT_ID>`
1. Run the RSS server: `yarn run dev:rss`

View the [Superfeedr dashboard](https://superfeedr.com/) for your feeds.

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
