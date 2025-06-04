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
  SetOptions,
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
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import {logger} from '@shared/services/logger.shared';

import {asyncTry, prefixError, prefixResultIfError, syncTry} from '@shared/lib/errorUtils.shared';
import {
  FIRESTORE_PARSING_FAILURE_SENTINEL,
  isParsingFailureSentinel,
} from '@shared/lib/firestore.shared';

import type {AsyncResult, Result} from '@shared/types/results.types';
import type {Consumer, Func, Unsubscribe} from '@shared/types/utils.types';

import {firebaseService} from '@sharedClient/services/firebase.client';

/**
 * Creates a strongly-typed converter between a Firestore data type and a client data type.
 */
export function makeFirestoreDataConverter<ItemData, FirestoreItemData extends DocumentData>(
  toFirestore: Func<ItemData, FirestoreItemData>,
  fromFirestore: Func<FirestoreItemData, Result<ItemData>>
): FirestoreDataConverter<ItemData, FirestoreItemData> {
  return {
    toFirestore,
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): ItemData => {
      const data = snapshot.data(options) as FirestoreItemData;

      const parseDataResult = fromFirestore(data);
      if (!parseDataResult.success) {
        const message = 'Failed to parse Firestore document data';
        const betterError = prefixError(parseDataResult.error, message);
        logger.error(betterError, {path: snapshot.ref.path});
        return FIRESTORE_PARSING_FAILURE_SENTINEL as unknown as ItemData;
      }

      return parseDataResult.value;
    },
  };
}

export class ClientFirestoreCollectionService<
  ItemId extends string,
  ItemData extends DocumentData,
  ItemDataFromStorage extends DocumentData,
> {
  private readonly collectionPath: string;
  private readonly converter: FirestoreDataConverter<ItemData, ItemDataFromStorage>;
  private readonly parseId: Func<string, Result<ItemId>>;

  constructor(args: {
    collectionPath: string;
    converter: FirestoreDataConverter<ItemData, ItemDataFromStorage>;
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
      if (!docSnap.exists()) return null;
      const docData = docSnap.data();
      if (isParsingFailureSentinel(docData)) {
        // Allow throwing here since we are inside `asyncTry`.
        // eslint-disable-next-line no-restricted-syntax
        throw new Error('Firestore document data failed to parse');
      }
      return docData;
    });
    return prefixResultIfError(docDataResult, 'Error fetching Firestore document data');
  }

  /**
   * Fetches all documents matching the Firestore query.
   */
  public async fetchQueryDocs(queryToFetch: Query<ItemData>): AsyncResult<ItemData[]> {
    const queryDataResult = await asyncTry(async () => {
      const querySnapshot = await getDocs(queryToFetch);
      return (
        querySnapshot.docs
          .map((doc) => doc.data())
          // Filter out parsing failures.
          .filter((data) => !isParsingFailureSentinel(data))
      );
    });
    return prefixResultIfError(queryDataResult, 'Error fetching Firestore query docs');
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
      if (!docSnap.exists()) {
        onData(null);
        return;
      }

      const parsedDataResult = syncTry(() => docSnap.data());
      if (!parsedDataResult.success) {
        onError(parsedDataResult.error);
        return;
      } else if (isParsingFailureSentinel(parsedDataResult.value)) {
        // Forward parsing failures to the error handler.
        onError(new Error('Firestore document parsing failed'));
      }

      onData(parsedDataResult.value ?? null);
    };

    const handleError: Consumer<Error> = (error) => onError(error);
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
      const parsedDataResult = syncTry(() =>
        // Filter out parsing failures.
        querySnap.docs.map((doc) => doc.data()).filter((data) => !isParsingFailureSentinel(data))
      );

      if (!parsedDataResult.success) {
        onError(parsedDataResult.error);
        return;
      }

      onData(parsedDataResult.value);
    };

    const handleError: Consumer<Error> = (error) => {
      onError(error);
    };

    return onSnapshot(query, handleSnapshot, handleError);
  }

  /**
   * Sets a Firestore document. The entire document is replaced.
   */
  public async setDoc(
    docId: ItemId,
    data: WithFieldValue<ItemData>,
    options: SetOptions = {}
  ): AsyncResult<void> {
    const setResult = await asyncTry(async () => setDoc(this.getDocRef(docId), data, options));
    return prefixResultIfError(setResult, 'Error setting Firestore document');
  }

  /**
   * Updates a Firestore document using setDoc() with the `merge` option. This is useful for
   * updating a doc that may or may not exist without having to first fetch it.
   */
  public async setDocWithMerge(
    docId: ItemId,
    data: Partial<WithFieldValue<ItemData>>
  ): AsyncResult<void> {
    const setResult = await asyncTry(async () =>
      setDoc(
        this.getDocRef(docId),
        // The Firestore data converter does not allow for partial writes via `setDoc` at the type
        // level. However, the entire point of `merge: true` is to allow for partial updates.
        {
          ...data,
          // TODO(timestamps): Use server timestamps instead.
          lastUpdatedTime: new Date(),
        } as WithFieldValue<ItemData>,
        {merge: true}
      )
    );
    return prefixResultIfError(setResult, 'Error setting Firestore document with merge');
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
        // TODO(timestamps): Use server timestamps instead.
        lastUpdatedTime: new Date(),
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

export function makeClientFirestoreCollectionService<
  ItemId extends string,
  ItemData extends DocumentData,
  ItemDataFromStorage extends DocumentData,
>(args: {
  readonly collectionPath: string;
  readonly parseId: Func<string, Result<ItemId>>;
  readonly toStorage: Func<ItemData, ItemDataFromStorage>;
  readonly fromStorage: Func<ItemDataFromStorage, Result<ItemData>>;
}): ClientFirestoreCollectionService<ItemId, ItemData, ItemDataFromStorage> {
  const {collectionPath, parseId, toStorage, fromStorage} = args;

  const firestoreConverter = makeFirestoreDataConverter(toStorage, fromStorage);

  const collectionService = new ClientFirestoreCollectionService({
    collectionPath,
    parseId,
    converter: firestoreConverter,
  });

  return collectionService;
}
