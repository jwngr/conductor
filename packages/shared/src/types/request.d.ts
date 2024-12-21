/**
 * There is an issue with the build which leads to the following error in CI (and sometimes locally):
 *
 * ```
 * error TS2724: "node_modules/tough-cookie/dist/cookie/index" has no exported member named 'CookieJar'. Did you mean 'Cookie'?
 * ```
 *
 * This API is not actually needed for this project and it is not clear how to resolve the build.
 * We patch it here by removing `CookieJar.setCookie`.
 *
 * TODO: Remove this hack at some point.
 */
declare module '@types/request' {
  namespace request {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface CookieJar extends Omit<import('request').CookieJar, 'setCookie'> {}
  }
}
