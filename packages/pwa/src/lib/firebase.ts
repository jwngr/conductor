import {FirebaseConfig} from '@shared/types';
import {initializeApp} from 'firebase/app';
import {
  doc,
  DocumentSnapshot,
  getFirestore,
  onSnapshot,
  Query,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import {useEffect, useState} from 'react';

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

export function useFirestoreQuery(collectionQuery: Query): {
  readonly data: QueryDocumentSnapshot[];
  readonly isLoading: boolean;
} {
  const [data, setData] = useState<QueryDocumentSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collectionQuery, (snapshot) => {
      setData(snapshot.docs);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [collectionQuery]);

  return {data, isLoading};
}

export function useFirestoreDoc(
  collectionName: string,
  documentId: string
): {
  readonly data: DocumentSnapshot | null;
  readonly isLoading: boolean;
} {
  const [data, setData] = useState<DocumentSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(firestore, collectionName, documentId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      setData(snapshot);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return {data, isLoading};
}
