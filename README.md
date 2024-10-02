# Conductor

Conductor is a combined RSS feed and read-it-later service. It is still a work-in-progress.

## Packages

- `/pwa` - Progressive Web App
- `/extension` - Browser extension
- `/shared` - Common models and libraries shared across all packages. These are managed via Yarn workspaces.
- `/scripts` - Helpful scripts for maintaining this repo
- `/webServer`
- `/importServer`

## Initial setup

1. Clone the repo

```bash
$ git clone git@github.com:jwngr/conductor.git
$ cd conductor
```

1. Add `.env` file in `src/packages/pwa` and populate it with info from a Firebase project that you'll use for local development:

```bash
$ cp packages/pwa/.env.example packages/pwa/.env
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
# Make sure you've run `yarn install` at root
$ yarn start:pwa
```

Opens at http://localhost:5173/.
