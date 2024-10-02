import {FirebaseConfig} from '@shared/types';
import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore/lite';

function getFirebaseConfig(): FirebaseConfig {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    throw new Error('VITE_FIREBASE_API_KEY is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
    throw new Error('VITE_FIREBASE_AUTH_DOMAIN is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    throw new Error('VITE_FIREBASE_PROJECT_ID is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
    throw new Error('VITE_FIREBASE_STORAGE_BUCKET is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) {
    throw new Error('VITE_FIREBASE_MESSAGING_SENDER_ID is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_APP_ID) {
    throw new Error('VITE_FIREBASE_APP_ID is not set');
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

const firebaseConfig = getFirebaseConfig();

export const firebaseApp = initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp);
