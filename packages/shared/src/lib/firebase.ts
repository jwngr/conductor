import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore/lite';

interface FirebaseConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  readonly measurementId?: string;
}

function getFirebaseConfig(): FirebaseConfig {
  if (!import.meta.env.VITE_FIREBASE_API_KEY) {
    throw new Error('FIREBASE_API_KEY is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
    throw new Error('FIREBASE_AUTH_DOMAIN is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) {
    throw new Error('FIREBASE_STORAGE_BUCKET is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) {
    throw new Error('FIREBASE_MESSAGING_SENDER_ID is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_APP_ID) {
    throw new Error('FIREBASE_APP_ID is not set');
  }
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    throw new Error('FIREBASE_MEASUREMENT_ID is not set');
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
