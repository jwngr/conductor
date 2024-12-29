import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Query,
  QueryConstraint,
  QuerySnapshot,
  WithFieldValue,
} from 'firebase/firestore';
import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {AsyncResult, Result} from '@shared/types/result.types';
import {makeSuccessResult} from '@shared/types/result.types';
import type {Consumer, Func, Unsubscribe} from '@shared/types/utils.types';

export class ClientFirestoreCollectionService<
  ItemId extends string,
  ItemData extends DocumentData,
> {
  private readonly collectionRef: CollectionReference<ItemData>;
  private readonly parseData: Func<DocumentData, Result<ItemData>>;
  private readonly parseId: Func<string, Result<ItemId>>;

  constructor(args: {
    collectionRef: CollectionReference<ItemData>;
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
  public getCollectionRef(): CollectionReference<ItemData> {
    return this.collectionRef;
  }

  /**
   * Returns a Firestore document reference for the given child ID.
   */
  public getDocRef(docId: ItemId): DocumentReference<ItemData> {
    return doc(this.collectionRef, docId);
  }

  /**
   * Constructs a Firestore query from the given filters.
   */
  public query(filters: QueryConstraint[]): Query {
    return query(this.collectionRef, ...filters);
  }

  /**
   * Fetches data from the single Firestore document with the given ID.
   */
  public async fetchById(id: ItemId): AsyncResult<ItemData | null> {
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
  public async fetchQueryDocs(queryToFetch: Query): AsyncResult<ItemData[]> {
    const queryDataResult = await asyncTry(async () => {
      const querySnapshot = await getDocs(queryToFetch);
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
  public async fetchFirstQueryDoc(filters: QueryConstraint[]): AsyncResult<ItemData | null> {
    const queryDataResult = await asyncTry(async () => {
      const queryToFetch = this.query(filters.concat(limit(1)));
      const querySnapshot = await this.fetchQueryDocs(queryToFetch);
      // Allow throwing here since we are inside `asyncTry`.
      // eslint-disable-next-line no-restricted-syntax
      if (!querySnapshot.success) throw querySnapshot.error;
      const firstDoc = querySnapshot.value[0];
      if (!firstDoc) return null;
      const parseDataResult = this.parseData(firstDoc);
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
  public async fetchQueryIds(queryToFetch: Query): AsyncResult<ItemId[]> {
    const queryIdsResult = await asyncTry(async () => {
      const querySnapshot = await getDocs(queryToFetch);
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
   * Subscribes to changes to the given Firestore document.
   */
  public watchDoc(
    docId: ItemId,
    onData: Consumer<ItemData | null>,
    onError: Consumer<Error>
  ): Unsubscribe {
    const handleSnapshot = (docSnap: DocumentSnapshot<DocumentData>) => {
      const data = docSnap.data();
      if (!data) {
        onData(null);
        return;
      }
      const parseDataResult = this.parseData(data);
      if (!parseDataResult.success) {
        onError(parseDataResult.error);
        return;
      }
      onData(parseDataResult.value);
    };

    const handleError: Consumer<Error> = (error) => {
      onError(error);
    };

    return onSnapshot(this.getDocRef(docId), handleSnapshot, handleError);
  }

  /**
   * Subscribes to changes to the given Firestore document.
   */
  public watchDocs(
    query: Query,
    onData: Consumer<ItemData[]>,
    onError: Consumer<Error>
  ): Unsubscribe {
    const handleSnapshot = (querySnap: QuerySnapshot<DocumentData>) => {
      const docsData = querySnap.docs.map((doc) => doc.data());
      const parseDataResults = docsData.map(this.parseData);

      // TODO: Clean this up.
      if (!parseDataResults.every((result) => result.success)) {
        const error = parseDataResults.find((result) => !result.success)?.error;
        if (error) {
          onError(error);
        }
        return;
      }
      onData(parseDataResults.map((result) => result.value));
    };

    const handleError: Consumer<Error> = (error) => {
      onError(error);
    };

    return onSnapshot(query, handleSnapshot, handleError);
  }

  /**
   * Sets a Firestore document. The entire document is replaced.
   */
  public async setDoc(docId: ItemId, data: WithFieldValue<ItemData>): AsyncResult<void> {
    const setResult = await asyncTry(async () => setDoc(this.getDocRef(docId), data));
    if (!setResult.success) {
      return prefixErrorResult(setResult, 'Error setting Firestore document');
    }
    return makeSuccessResult(undefined);
  }

  /**
   * Updates a Firestore document. Updates are merged with the existing document.
   */
  public async updateDoc(docId: ItemId, updates: Partial<ItemData>): AsyncResult<void> {
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
  public async deleteDoc(docId: ItemId): AsyncResult<void> {
    const docRef = doc(this.collectionRef, docId);
    const deleteResult = await asyncTry(async () => deleteDoc(docRef));
    if (!deleteResult.success) {
      return prefixErrorResult(deleteResult, 'Error deleting Firestore document');
    }
    // Firebase's method returns a `WriteResult` object, but we don't need to return it.
    return makeSuccessResult(undefined);
  }
}
