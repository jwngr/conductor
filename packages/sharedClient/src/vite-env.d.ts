/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

/**
 * Even though Vite is not used to build `sharedClient`, other packages which consume `sharedClient`
 * are built with Vite. This file is used to ensure that TypeScript can find the types for Vite
 * within `sharedClient`.
 */
