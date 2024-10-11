import {FirebaseConfig} from '@shared/types/core';
import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';

function validateEnvVar(name: string) {
  if (!import.meta.env[name]) {
    throw new Error(`${name} is not set`);
  }
}

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
export const firestore = getFirestore(firebaseApp);
