import {initializeApp} from 'firebase/app';
import {connectAuthEmulator, getAuth} from 'firebase/auth';
import {connectFirestoreEmulator, getFirestore} from 'firebase/firestore';
import {connectFunctionsEmulator, getFunctions} from 'firebase/functions';
import {connectStorageEmulator, getStorage} from 'firebase/storage';

import {FirebaseConfig} from '@shared/types/firebase.types';

function validateEnvVar(name: string) {
  if (!import.meta.env[name]) {
    throw new Error(`${name} is not set`);
  }
}

// Firebase config is stored in `.env` at the root of the repo.
function getFirebaseConfig(): FirebaseConfig {
  validateEnvVar('VITE_FIREBASE_API_KEY');
  validateEnvVar('VITE_FIREBASE_AUTH_DOMAIN');
  validateEnvVar('VITE_FIREBASE_PROJECT_ID');
  validateEnvVar('VITE_FIREBASE_STORAGE_BUCKET');
  validateEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID');
  validateEnvVar('VITE_FIREBASE_APP_ID');

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Optional.
  };
}

const firebaseConfig = getFirebaseConfig();
const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);
export const firestore = getFirestore(firebaseApp);

// Firebase emulator for local development is configured via an environment variable.
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
  const FIREBASE_EMULATOR_HOST = '127.0.0.1';
  const FUNCTIONS_EMULATOR_PORT = 5001;
  const FIRESTORE_EMULATOR_PORT = 8080;
  const STORAGE_EMULATOR_PORT = 9199;
  const AUTH_EMULATOR_PORT = 9099;
  const functions = getFunctions(firebaseApp);
  connectAuthEmulator(auth, `http://${FIREBASE_EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`);
  connectStorageEmulator(storage, FIREBASE_EMULATOR_HOST, STORAGE_EMULATOR_PORT);
  connectFunctionsEmulator(functions, FIREBASE_EMULATOR_HOST, FUNCTIONS_EMULATOR_PORT);
  connectFirestoreEmulator(firestore, FIREBASE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
}
