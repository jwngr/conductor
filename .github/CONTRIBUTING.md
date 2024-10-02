# Conductor

## Packages

The repo is organized into TypeScript packages which share code and are managed via
[Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/).

The packages are:

- `/shared` - Common models and libraries shared across all packages
- `/pwa` - Progressive Web App
- `/extension` - Browser extension [TODO]
- `/scripts` - Helpful scripts for maintaining this repo

## Initial setup

1. Clone the repo:

```bash
$ git clone git@github.com:jwngr/conductor.git
$ cd conductor
```

1. Add `.env` file in `src/packages/pwa` and populate it with info from a Firebase project that you'll use for local development:

```bash
$ cp packages/pwa/.env.example packages/pwa/.env
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
