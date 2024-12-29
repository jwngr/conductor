import admin from 'firebase-admin';
import type {DocumentData, Query} from 'firebase-admin/firestore';
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

export class FirestoreCollectionService<ItemId extends string, ItemData extends DocumentData> {
  private readonly collectionRef: CollectionReference;
  private readonly parseData: Func<DocumentData, Result<ItemData>>;
  private readonly parseId: Func<string, Result<ItemId>>;

  constructor(args: {
    collectionRef: CollectionReference;
    parseData: Func<DocumentData, Result<ItemData>>;
    parseId: Func<string, Result<ItemId>>;
  }) {
    this.collectionRef = args.collectionRef;
    this.parseData = args.parseData;
    this.parseId = args.parseId;
  }

  /**
   * Returns the underlying Firestore collection reference.
   */
  public getRef(): CollectionReference {
    return this.collectionRef;
  }

  /**
   * Fetches data from the single Firestore document with the given ID.
   */
  async fetchById(id: ItemId): AsyncResult<ItemData | null> {
    const docRef = this.collectionRef.doc(id);
    const docDataResult = await asyncTry(async () => {
      const docSnap = await docRef.get();
      const data = docSnap.data();
      if (!data) return null;
      const parseDataResult = this.parseData(data);
      if (!parseDataResult.success) throw parseDataResult.error;
      return parseDataResult.value;
    });
    return prefixResultIfError(docDataResult, 'Error fetching Firestore document data');
  }

  /**
   * Fetches all documents matching the Firestore query.
   */
  async fetchQueryDocs(query: Query): AsyncResult<ItemData[]> {
    const queryDataResult = await asyncTry(async () => {
      const querySnapshot = await query.get();
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const parseDataResult = this.parseData(data);
        if (!parseDataResult.success) throw parseDataResult.error;
        return parseDataResult.value;
      });
    });
    return prefixResultIfError(queryDataResult, 'Error fetching Firestore query data');
  }

  /**
   * Fetches data from the first document matching a Firestore query. If no documents match, returns
   * `null`.
   */
  async fetchFirstQueryDoc(query: Query): AsyncResult<ItemData | null> {
    const queryDataResult = await asyncTry(async () => {
      const querySnapshot = await query.limit(1).get();
      if (querySnapshot.empty) return null;
      const data = querySnapshot.docs[0].data();
      const parseDataResult = this.parseData(data);
      if (!parseDataResult.success) throw parseDataResult.error;
      return parseDataResult.value;
    });
    return prefixResultIfError(queryDataResult, 'Error fetching Firestore query data');
  }

  /**
   * Fetches the IDs of all documents matching the Firestore query.
   */
  async fetchQueryIds(query: Query): AsyncResult<ItemId[]> {
    const queryIdsResult = await asyncTry(async () => {
      const querySnapshot = await query.get();
      return querySnapshot.docs.map((doc) => {
        const parseIdResult = this.parseId(doc.id);
        if (!parseIdResult.success) throw parseIdResult.error;
        return parseIdResult.value;
      });
    });

    return prefixResultIfError(queryIdsResult, 'Error fetching Firestore query IDs');
  }

  /**
   * Sets a Firestore document. The entire document is replaced.
   */
  async setDoc(docId: ItemId, data: ItemData): AsyncResult<ItemData> {
    const docRef = this.collectionRef.doc(docId);
    const setResult = await asyncTry(async () => docRef.set(data));
    if (!setResult.success) {
      return prefixErrorResult(setResult, 'Error setting Firestore document');
    }
    // Return the data that was set as a convenience since consumers of this function may want to
    // return it in a single line as well.
    return makeSuccessResult(data);
  }

  /**
   * Updates a Firestore document. Updates are merged with the existing document.
   */
  async updateDoc(docId: ItemId, updates: Partial<ItemData>): AsyncResult<void> {
    const docRef = this.collectionRef.doc(docId);
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
  async deleteDoc(docId: ItemId): AsyncResult<void> {
    const docRef = this.collectionRef.doc(docId);
    const deleteResult = await asyncTry(async () => docRef.delete());
    if (!deleteResult.success) {
      return prefixErrorResult(deleteResult, 'Error deleting Firestore document');
    }
    // Firebase's method returns a `WriteResult` object, but we don't need to return it.
    return makeSuccessResult(undefined);
  }

  /**
   * Deletes all child IDs from a collection in batches.
   *
   * Errors are returned if any batch fails to delete. A failure to one batch does not prevent other
   * batches from being deleted.
   */
  async batchDeleteDocs(idsToDelete: ItemId[]): AsyncResult<void> {
    const errors: Error[] = [];

    const totalBatches = Math.ceil(idsToDelete.length / BATCH_DELETE_SIZE);

    const idsPerBatch = Array.from({length: totalBatches}).map((_, i) =>
      idsToDelete.slice(i * BATCH_DELETE_SIZE, (i + 1) * BATCH_DELETE_SIZE)
    );

    // Run one batch at a time.
    for (const currentIds of idsPerBatch) {
      const deleteBatchResult = await asyncTry(async () => {
        const batch = firestore.batch();
        currentIds.forEach((id) => batch.delete(this.collectionRef.doc(id)));
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
}
