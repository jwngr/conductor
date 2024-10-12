import {initializeApp} from 'firebase/app';
import {
  connectFirestoreEmulator,
  doc,
  DocumentSnapshot,
  getFirestore,
  onSnapshot,
  Query,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import {connectFunctionsEmulator, getFunctions} from 'firebase/functions';
import {connectStorageEmulator, getStorage} from 'firebase/storage';
import {useEffect, useState} from 'react';

import {FirebaseConfig} from '@shared/types/core';

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

if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_USE_EMULATOR === 'true') {
  // Configure Firebase emulator for local development.
  const FIREBASE_EMULATOR_HOST = '127.0.0.1';
  const FUNCTIONS_EMULATOR_PORT = 5001;
  const FIRESTORE_EMULATOR_PORT = 8080;
  const STORAGE_EMULATOR_PORT = 9199;
  const storage = getStorage(firebaseApp);
  const functions = getFunctions(firebaseApp);
  connectStorageEmulator(storage, FIREBASE_EMULATOR_HOST, STORAGE_EMULATOR_PORT);
  connectFunctionsEmulator(functions, FIREBASE_EMULATOR_HOST, FUNCTIONS_EMULATOR_PORT);
  connectFirestoreEmulator(firestore, FIREBASE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
}

interface UseFirstoreQueryResult {
  readonly data: QueryDocumentSnapshot[];
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function useFirestoreQuery(collectionQuery: Query): UseFirstoreQueryResult {
  const [data, setData] = useState<QueryDocumentSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        setData(snapshot.docs);
        setIsLoading(false);
      },
      (error) => {
        setError(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionQuery]);

  return {data, isLoading, error};
}

interface UseFirestoreDocResult {
  readonly data: DocumentSnapshot | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function useFirestoreDoc(collectionName: string, documentId: string): UseFirestoreDocResult {
  const [data, setData] = useState<DocumentSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(firestore, collectionName, documentId),
      (snapshot) => {
        setData(snapshot);
        setIsLoading(false);
      },
      (error) => {
        setError(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return {data, isLoading, error};
}
