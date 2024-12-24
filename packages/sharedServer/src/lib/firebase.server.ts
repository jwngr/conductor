import admin from 'firebase-admin';
import type {DocumentData, DocumentReference, Query, QuerySnapshot} from 'firebase-admin/firestore';

import {asyncTry} from '@shared/lib/errors';

import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

const BATCH_DELETE_SIZE = 500;

admin.initializeApp();

export const firestore = admin.firestore();

export const storageBucket = admin.storage().bucket();

export const FieldValue = admin.firestore.FieldValue;

export function getFirestoreQuerySnapshot(query: Query): AsyncResult<QuerySnapshot> {
  return asyncTry<QuerySnapshot>(async () => {
    return await query.get();
  });
}

export function updateFirestoreDoc<T>(
  docRef: DocumentReference,
  updates: Partial<T>
): AsyncResult<void> {
  return asyncTry<undefined>(async () => {
    await docRef.update(updates);
  });
}

export function deleteFirestoreDocPath(docPath: string): AsyncResult<void> {
  return asyncTry<undefined>(async () => {
    await firestore.doc(docPath).delete();
  });
}

export function deleteFirestoreDoc(doc: DocumentReference): AsyncResult<void> {
  return asyncTry<undefined>(async () => {
    await doc.delete();
  });
}

/**
 * Deletes a list of Firestore documents in batches.
 */
export async function batchDeleteFirestoreDocuments<T extends DocumentData>(
  refs: DocumentReference<T>[]
): AsyncResult<void> {
  const errors: Error[] = [];

  const totalBatches = Math.ceil(refs.length / BATCH_DELETE_SIZE);

  const refsPerBatch: DocumentReference<T>[][] = Array.from({length: totalBatches}).map((_, i) => {
    return refs.slice(i * BATCH_DELETE_SIZE, (i + 1) * BATCH_DELETE_SIZE);
  });

  // Run one batch at a time.
  for (const currentRefs of refsPerBatch) {
    const deleteBatchResult = await asyncTry<undefined>(async () => {
      const batch = firestore.batch();
      currentRefs.forEach((ref) => batch.delete(ref));
      await batch.commit();
    });
    if (!deleteBatchResult.success) {
      errors.push(deleteBatchResult.error);
    }
  }

  return errors.length > 0 ? makeErrorResult(errors[0]) : makeSuccessResult(undefined);
}
