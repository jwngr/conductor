import {doc, DocumentSnapshot, onSnapshot, Query, QueryDocumentSnapshot} from 'firebase/firestore';
import {useEffect, useState} from 'react';

import {firestore} from '@shared/lib/firebase';

interface UseFirestoreQueryResult {
  readonly data: QueryDocumentSnapshot[];
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function useFirestoreQuery(collectionQuery: Query): UseFirestoreQueryResult {
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
