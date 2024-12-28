import admin from 'firebase-admin';
import type {DocumentData, DocumentReference, Query} from 'firebase-admin/firestore';
import {CollectionReference, FieldValue} from 'firebase-admin/firestore';

import {
  asyncTry,
  prefixError,
  prefixErrorResult,
  prefixResultIfError,
} from '@shared/lib/errorUtils.shared';

import type {AsyncResult, Result} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {Func} from '@shared/types/utils.types';

const BATCH_DELETE_SIZE = 500;

admin.initializeApp();

export const firestore = admin.firestore();

export const FIREBASE_STORAGE_BUCKET = admin.storage().bucket();
export const FIREBASE_PROJECT_ID = admin.instanceId().app.options.projectId;

/**
 * Fetches the data from a single Firestore document.
 */
export async function getFirestoreDocData<T>(docRef: DocumentReference): AsyncResult<T | null> {
  const docDataResult = await asyncTry(async () => {
    const docSnap = await docRef.get();
    if (!docSnap.exists) return null;
    return docSnap.data() as T;
  });
  return prefixResultIfError(docDataResult, 'Error fetching Firestore document data');
}

/**
 * Fetches all documents matching a Firestore query.
 */
export async function getFirestoreQueryData<T>(query: Query): AsyncResult<T[]> {
  const queryDataResult = await asyncTry(async () => {
    const querySnapshot = await query.get();
    return querySnapshot.docs.map((doc) => doc.data() as T);
  });
  return prefixResultIfError(queryDataResult, 'Error fetching Firestore query data');
}

/**
 * Fetches the first document matching a Firestore query. If no documents match, returns `null`.
 */
export async function getFirstFirestoreQueryData<T>(query: Query): AsyncResult<T | null> {
  const queryDataResult = await asyncTry(async () => {
    const querySnapshot = await query.limit(1).get();
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0].data() as T;
  });
  return prefixResultIfError(queryDataResult, 'Error fetching Firestore query data');
}

/**
 * Fetches the IDs of all documents matching a Firestore query.
 */
export async function getFirestoreQueryIds<ItemId>(
  query: Query,
  makeId: Func<string, Result<ItemId>>
): AsyncResult<ItemId[]> {
  const queryIdsResult = await asyncTry(async () => {
    const querySnapshot = await query.get();
    return querySnapshot.docs.map((doc) => {
      const makeIdResult = makeId(doc.id);
      if (!makeIdResult.success) throw makeIdResult.error;
      return makeIdResult.value;
    });
  });

  return prefixResultIfError(queryIdsResult, 'Error fetching Firestore query IDs');
}

/**
 * Sets a Firestore document.
 */
export async function setFirestoreDoc<T extends DocumentData>(
  docRef: DocumentReference,
  data: T
): AsyncResult<T> {
  const setResult = await asyncTry(async () => docRef.set(data));
  if (!setResult.success) {
    return prefixErrorResult(setResult, 'Error setting Firestore document');
  }
  // Return the data that was set as a convenience since consumers of this function may want to
  // return it in a single line as well.
  return makeSuccessResult(data);
}

/**
 * Updates a Firestore document.
 */
export async function updateFirestoreDoc<T>(
  docRef: DocumentReference,
  updates: Partial<T>
): AsyncResult<void> {
  const updateResult = await asyncTry(async () =>
    docRef.update({
      ...updates,
      lastUpdatedTime: FieldValue.serverTimestamp(),
    })
  );
  if (!updateResult.success) {
    return prefixErrorResult(updateResult, 'Error updating Firestore document');
  }
  // Firebase's method returns a `WriteResult` object, but we don't need to return it.
  return makeSuccessResult(undefined);
}

/**
 * Deletes a Firestore document.
 */
export async function deleteFirestoreDoc(doc: DocumentReference): AsyncResult<void> {
  const deleteResult = await asyncTry(async () => doc.delete());
  if (!deleteResult.success) {
    return prefixErrorResult(deleteResult, 'Error deleting Firestore document');
  }
  // Firebase's method returns a `WriteResult` object, but we don't need to return it.
  return makeSuccessResult(undefined);
}

/**
 * Deletes a list of Firestore documents in batches. Documents can be from across multiple
 * collections.
 *
 * Errors are returned if any batch fails to delete. A failure to one batch does not prevent other
 * batches from being deleted.
 */
export async function batchDeleteFirestoreDocs<T extends DocumentData>(
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

  if (errors.length > 0) {
    return makeErrorResult(prefixError(errors[0], 'Error batch deleting Firestore documents'));
  }
  return makeSuccessResult(undefined);
}

/**
 * Deletes all child IDs from a collection in batches. A convenience function for a common pattern
 * with {@link batchDeleteFirestoreDocs}.
 */
export async function batchDeleteChildIds<T extends DocumentData>(
  collectionRef: CollectionReference<T>,
  idsToDelete: string[]
): AsyncResult<void> {
  const refs = idsToDelete.map((id) => collectionRef.doc(id));
  return batchDeleteFirestoreDocs(refs);
}
