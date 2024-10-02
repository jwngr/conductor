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

```bash
$ npm install --global yarn
$ git clone git@github.com:jwngr/conductor.git
$ cd conductor
$ yarn install
$ yarn build
```

## Start PWA

```bash
# Make sure you've run `yarn install` at root
$ yarn start:pwa
```

Opens at http://localhost:5173/.
