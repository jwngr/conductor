import admin from 'firebase-admin';
import type {DocumentData, DocumentReference, Query, QuerySnapshot} from 'firebase-admin/firestore';

import {asyncTry} from '@shared/lib/errorUtils.shared';

import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';

const BATCH_DELETE_SIZE = 500;

admin.initializeApp();

export const firestore = admin.firestore();

export const FIREBASE_STORAGE_BUCKET = admin.storage().bucket();

export const FIREBASE_PROJECT_ID = admin.instanceId().app.options.projectId;

export async function getFirestoreQuerySnapshot(query: Query): AsyncResult<QuerySnapshot> {
  return await asyncTry(async () => query.get());
}

export async function updateFirestoreDoc<T>(
  docRef: DocumentReference,
  updates: Partial<T>
): AsyncResult<void> {
  await asyncTry(async () => docRef.update(updates));
  return makeSuccessResult(undefined);
}

export async function deleteFirestoreDocPath(docPath: string): AsyncResult<void> {
  await asyncTry(async () => firestore.doc(docPath).delete());
  return makeSuccessResult(undefined);
}

export async function deleteFirestoreDoc(doc: DocumentReference): AsyncResult<void> {
  await asyncTry(async () => doc.delete());
  return makeSuccessResult(undefined);
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
    const deleteBatchResult = await asyncTry(async () => {
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
