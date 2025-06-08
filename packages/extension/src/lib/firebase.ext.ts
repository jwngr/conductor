import {getIsFirebaseEmulatorEnabled} from '@shared/lib/firebase.shared';

import type {FirebaseConfig} from '@shared/types/firebase.types';

import {ClientFirebaseService} from '@sharedClient/services/firebase.client';

import {env, IS_DEVELOPMENT} from '@src/lib/environment.ext';

function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: env.firebaseApiKey,
    authDomain: env.firebaseAuthDomain,
    projectId: env.firebaseProjectId,
    storageBucket: env.firebaseStorageBucket,
    messagingSenderId: env.firebaseMessagingSenderId,
    appId: env.firebaseAppId,
    measurementId: env.firebaseMeasurementId ?? undefined,
  };
}

// Initialize the Firebase service.
const firebaseConfig = getFirebaseConfig();
const isEmulatorEnabled = getIsFirebaseEmulatorEnabled({
  isDevelopment: IS_DEVELOPMENT,
  isEmulatorEnabledEnvVar: env.firebaseUseEmulator,
});
export const firebaseService = new ClientFirebaseService({
  config: firebaseConfig,
  isEmulatorEnabled,
});
