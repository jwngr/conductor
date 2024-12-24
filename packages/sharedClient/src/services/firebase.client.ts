import {SharedFirebaseService} from '@shared/services/firebase.shared';
import {logger} from '@shared/services/logger.shared';

import type {FirebaseConfig} from '@shared/types/firebase.types';

function validateRequiredEnvVar(name: string): string {
  const value = import.meta.env[name];
  if (!value) {
    const errorMessage = `${name} environment variable is not set.`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
  return value;
}

// Firebase config is stored in `.env` at the root of the repo.
function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: validateRequiredEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: validateRequiredEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: validateRequiredEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: validateRequiredEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: validateRequiredEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: validateRequiredEnvVar('VITE_FIREBASE_APP_ID'),
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional.
  };
}

function getIsFirebaseEmulatorEnabled(): boolean {
  // Only enable emulator in dev mode.
  if (!import.meta.env.DEV) return false;
  // Only enable emulator if the env var is set to `true`.
  return import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true';
}

export const firebaseService = new SharedFirebaseService({
  config: getFirebaseConfig(),
  isEmulatorEnabled: getIsFirebaseEmulatorEnabled(),
});
