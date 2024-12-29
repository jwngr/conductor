import type {CollectionReference, DocumentData, Query, QueryConstraint} from 'firebase/firestore';
import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {AsyncResult, Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {Func} from '@shared/types/utils.types';

export class ClientFirestoreCollectionService<
  ItemId extends string,
  ItemData extends DocumentData,
> {
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
    const docRef = doc(this.collectionRef, id);
    const docDataResult = await asyncTry(async () => {
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      if (!data) return null;
      const parseDataResult = this.parseData(data);
      // Allow throwing here since we are inside `asyncTry`.
      // eslint-disable-next-line no-restricted-syntax
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
      const querySnapshot = await getDocs(query);
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const parseDataResult = this.parseData(data);
        // Allow throwing here since we are inside `asyncTry`.
        // eslint-disable-next-line no-restricted-syntax
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
  async fetchFirstQueryDoc(filters: QueryConstraint[]): AsyncResult<ItemData | null> {
    const queryDataResult = await asyncTry(async () => {
      const querySnapshot = await getDocs(query(this.collectionRef, ...filters, limit(1)));
      if (querySnapshot.empty) return null;
      const data = querySnapshot.docs[0].data();
      const parseDataResult = this.parseData(data);
      // Allow throwing here since we are inside `asyncTry`.
      // eslint-disable-next-line no-restricted-syntax
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
      const querySnapshot = await getDocs(query);
      return querySnapshot.docs.map((doc) => {
        const parseIdResult = this.parseId(doc.id);
        // Allow throwing here since we are inside `asyncTry`.
        // eslint-disable-next-line no-restricted-syntax
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
    const docRef = doc(this.collectionRef, docId);
    const setResult = await asyncTry(async () => setDoc(docRef, data));
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
    const docRef = doc(this.collectionRef, docId);
    const updateResult = await asyncTry(async () =>
      updateDoc(docRef, {
        ...updates,
        lastUpdatedTime: serverTimestamp(),
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
    const docRef = doc(this.collectionRef, docId);
    const deleteResult = await asyncTry(async () => deleteDoc(docRef));
    if (!deleteResult.success) {
      return prefixErrorResult(deleteResult, 'Error deleting Firestore document');
    }
    // Firebase's method returns a `WriteResult` object, but we don't need to return it.
    return makeSuccessResult(undefined);
  }
}
