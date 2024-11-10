import admin from 'firebase-admin';
import {DocumentData, DocumentReference, Query, QuerySnapshot} from 'firebase-admin/firestore';

import {asyncTry} from '@shared/lib/errors';

import type {} from 'firebase-admin/firestore';

import {AsyncResult, makeSuccessResult} from '@shared/types/result.types';

const BATCH_DELETE_SIZE = 500;

admin.initializeApp();

export const firestore = admin.firestore();

export const storageBucket = admin.storage().bucket();

export const FieldValue = admin.firestore.FieldValue;

export function getFirestoreQuerySnapshot(query: Query): AsyncResult<QuerySnapshot> {
  return asyncTry(async () => {
    return await query.get();
  });
}
export function updateFirestoreDoc<T>(
  docRef: DocumentReference,
  updates: Partial<T>
): AsyncResult<void> {
  return asyncTry(async () => {
    await docRef.update(updates);
  });
}

export function deleteFirestoreDoc(docPath: string): AsyncResult<void> {
  return asyncTry(async () => {
    await firestore.doc(docPath).delete();
  });
}

/**
 * Deletes a list of Firestore documents in batches.
 */
export async function batchDeleteFirestoreDocuments<T extends DocumentData>(
  refs: DocumentReference<T>[]
): AsyncResult<void> {
  const totalBatches = Math.ceil(refs.length / BATCH_DELETE_SIZE);

  const refsPerBatch: DocumentReference<T>[][] = Array.from({length: totalBatches}).map((_, i) => {
    return refs.slice(i * BATCH_DELETE_SIZE, (i + 1) * BATCH_DELETE_SIZE);
  });

  // Run one batch at a time.
  for (const currentRefs of refsPerBatch) {
    const deleteBatchResult = await asyncTry(async () => {
      const batch = firestore.batch();
      currentRefs.forEach((ref) => batch.delete(ref));
      await batch.commit();
    });
    if (!deleteBatchResult.success) {
      return deleteBatchResult;
    }
  }

  return makeSuccessResult(undefined);
}
