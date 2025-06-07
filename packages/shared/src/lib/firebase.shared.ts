// Indicates a Firestore document failed to parse. Instead of re-throwing parsing errors, they are
// logged and this sentinel value is returned. This value must be filtered out when fetching data
// from Firestore. This happens automatically if using the client or server Firestore services.
export const FIRESTORE_PARSING_FAILURE_SENTINEL = 'FIRESTORE_PARSING_FAILURE';

export function isParsingFailureSentinel<T>(data: T): boolean {
  return data === FIRESTORE_PARSING_FAILURE_SENTINEL;
}

export function getIsFirebaseEmulatorEnabled(args: {
  readonly isDevelopment: boolean;
  readonly isEmulatorEnabledEnvVar: boolean;
}): boolean {
  const {isDevelopment, isEmulatorEnabledEnvVar} = args;
  // Only enable emulator in dev mode.
  return isEmulatorEnabledEnvVar && !isDevelopment;
}
