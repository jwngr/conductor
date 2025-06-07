import {getIsFirebaseEmulatorEnabled} from '@shared/lib/firebase.shared';

import type {FirebaseConfig} from '@shared/types/firebase.types';

import {ClientFirebaseService} from '@sharedClient/services/firebase.client';

import {env, IS_DEVELOPMENT} from '@src/lib/environment.pwa';

function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: env.API_KEY,
    authDomain: env.AUTH_DOMAIN,
    projectId: env.PROJECT_ID,
    storageBucket: env.STORAGE_BUCKET,
    messagingSenderId: env.MESSAGING_SENDER_ID,
    appId: env.APP_ID,
    measurementId: env.MEASUREMENT_ID,
  };
}

// Initialize the Firebase service.
const firebaseConfig = getFirebaseConfig();
const isEmulatorEnabled = getIsFirebaseEmulatorEnabled({
  isDevelopment: IS_DEVELOPMENT,
  isEmulatorEnabledEnvVar: env.FIREBASE_USE_EMULATOR,
});
export const firebaseService = new ClientFirebaseService({
  config: firebaseConfig,
  isEmulatorEnabled,
});
