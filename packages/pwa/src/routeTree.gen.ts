/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as RedirectsImport } from './routes/Redirects'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const RedirectsRoute = RedirectsImport.update({
  id: '/Redirects',
  path: '/Redirects',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/Redirects': {
      id: '/Redirects'
      path: '/Redirects'
      fullPath: '/Redirects'
      preLoaderRoute: typeof RedirectsImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/Redirects': typeof RedirectsRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/Redirects': typeof RedirectsRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/Redirects': typeof RedirectsRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/Redirects'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/Redirects'
  id: '__root__' | '/' | '/Redirects'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  RedirectsRoute: typeof RedirectsRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  RedirectsRoute: RedirectsRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/Redirects"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/Redirects": {
      "filePath": "Redirects.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
