import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreDataConverter,
  Query,
  QueryConstraint,
  QueryDocumentSnapshot,
  QuerySnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';
import {
  collection,
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

import {asyncTry, prefixResultIfError} from '@shared/lib/errorUtils.shared';

import type {AsyncResult, Result} from '@shared/types/result.types';
import type {Consumer, Func, Unsubscribe} from '@shared/types/utils.types';

import {firebaseService} from '@sharedClient/services/firebase.client';

/**
 * Parses a Firestore document into a strongly-typed item.
 */
function makeFromFirestoreItemFunc<Item, ItemFromSchema>(
  parseItem: Func<ItemFromSchema, Result<Item>>
) {
  return (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Item => {
    const data = snapshot.data(options) as ItemFromSchema;
    // TODO: Should I be throwing here?
    // eslint-disable-next-line no-restricted-syntax
    if (!data) throw new Error('Firestore document data is unexpectedly null');
    const parseResult = parseItem(data);
    // TODO: Should I be throwing here?
    // eslint-disable-next-line no-restricted-syntax
    if (!parseResult.success) throw parseResult.error;
    return parseResult.value;
  };
}

/**
 * Creates a strongly-typed Firestore data converter.
 */
export function makeFirestoreDataConverter<ItemData, FirestoreItemData extends DocumentData>(
  toFirestore: Func<ItemData, FirestoreItemData>,
  parseData: Func<FirestoreItemData, Result<ItemData>>
): FirestoreDataConverter<ItemData, FirestoreItemData> {
  return {toFirestore, fromFirestore: makeFromFirestoreItemFunc(parseData)};
}

export class ClientFirestoreCollectionService<
  ItemId extends string,
  ItemData extends DocumentData,
> {
  private readonly collectionPath: string;
  private readonly converter: FirestoreDataConverter<ItemData>;
  private readonly parseId: Func<string, Result<ItemId>>;

  constructor(args: {
    collectionPath: string;
    converter: FirestoreDataConverter<ItemData>;
    parseId: Func<string, Result<ItemId>>;
  }) {
    this.collectionPath = args.collectionPath;
    this.converter = args.converter;
    this.parseId = args.parseId;
  }

  /**
   * Returns the underlying Firestore collection reference.
   */
  public getCollectionRef(): CollectionReference<ItemData> {
    return collection(firebaseService.firestore, this.collectionPath).withConverter(this.converter);
  }

  /**
   * Returns a Firestore document reference for the given child ID.
   */
  public getDocRef(docId: ItemId): DocumentReference<ItemData> {
    return doc(this.getCollectionRef(), docId);
  }

  /**
   * Constructs a Firestore query from the given filters.
   */
  public query(filters: QueryConstraint[]): Query<ItemData> {
    return query(this.getCollectionRef(), ...filters);
  }

  /**
   * Fetches data from the single Firestore document with the given ID.
   */
  public async fetchById(docId: ItemId): AsyncResult<ItemData | null> {
    const docRef = this.getDocRef(docId);
    const docDataResult = await asyncTry(async () => {
      const docSnap = await getDoc(docRef);
      return docSnap.data() ?? null;
    });
    return prefixResultIfError(docDataResult, 'Error fetching Firestore document data');
  }

  /**
   * Fetches all documents matching the Firestore query.
   */
  public async fetchQueryDocs(queryToFetch: Query<ItemData>): AsyncResult<ItemData[]> {
    const queryDataResult = await asyncTry(async () => {
      const querySnapshot = await getDocs(queryToFetch);
      return querySnapshot.docs.map((doc) => doc.data());
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
      const queryDocsResult = await this.fetchQueryDocs(queryToFetch);
      // Allow throwing here since we are inside `asyncTry`.
      // eslint-disable-next-line no-restricted-syntax
      if (!queryDocsResult.success) throw queryDocsResult.error;
      if (queryDocsResult.value.length === 0) return null;
      return queryDocsResult.value[0];
    });
    return prefixResultIfError(queryDataResult, 'Error fetching first doc in Firestore query');
  }

  /**
   * Fetches the IDs of all documents matching the Firestore query.
   */
  public async fetchQueryIds(queryToFetch: Query<ItemData>): AsyncResult<ItemId[]> {
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
    const handleSnapshot: Consumer<DocumentSnapshot<ItemData>> = (docSnap) => {
      const data = docSnap.data();
      onData(data ?? null);
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
    query: Query<ItemData>,
    onData: Consumer<ItemData[]>,
    onError: Consumer<Error>
  ): Unsubscribe {
    const handleSnapshot: Consumer<QuerySnapshot<ItemData>> = (querySnap) => {
      const docsData = querySnap.docs.map((doc) => doc.data());
      onData(docsData);
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
    return prefixResultIfError(setResult, 'Error setting Firestore document');
  }

  /**
   * Updates a Firestore document. Updates are merged with the existing document.
   */
  public async updateDoc(
    docId: ItemId,
    updates: Partial<WithFieldValue<Omit<ItemData, 'lastUpdatedTime'>>>
  ): AsyncResult<void> {
    const docRef = this.getDocRef(docId);
    const updateResult = await asyncTry(async () =>
      updateDoc(docRef, {
        ...updates,
        // Always update the `lastUpdatedTime` field.
        lastUpdatedTime: serverTimestamp(),
      })
    );
    return prefixResultIfError(updateResult, 'Error updating Firestore document');
  }

  /**
   * Deletes a Firestore document.
   */
  public async deleteDoc(docId: ItemId): AsyncResult<void> {
    const docRef = this.getDocRef(docId);
    const deleteResult = await asyncTry(async () => deleteDoc(docRef));
    return prefixResultIfError(deleteResult, 'Error deleting Firestore document');
  }
}
