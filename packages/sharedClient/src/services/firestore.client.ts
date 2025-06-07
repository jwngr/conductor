import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FirestoreDataConverter,
  PartialWithFieldValue,
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
import type {BaseStoreItem, Consumer, Func, Unsubscribe} from '@shared/types/utils.types';

import {clientTimestampSupplier, firebaseService} from '@sharedClient/services/firebase.client';

/**
 * Creates a strongly-typed converter between a Firestore data type and a client data type.
 */
function makeFirestoreDataConverter<
  ItemData extends BaseStoreItem,
  ItemDataFromStorage extends DocumentData,
>(
  toFirestore: Func<ItemData, ItemDataFromStorage>,
  fromFirestore: Func<ItemDataFromStorage, Result<ItemData>>
): FirestoreDataConverter<ItemData, ItemDataFromStorage> {
  return {
    toFirestore,
    fromFirestore: (
      snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>,
      options: SnapshotOptions
    ): ItemData => {
      const data = snapshot.data(options) as ItemDataFromStorage;

      const parseDataResult = fromFirestore(data);
      if (!parseDataResult.success) {
        const message = 'Failed to parse Firestore document data';
        const betterError = prefixError(parseDataResult.error, message);
        logger.error(betterError, {path: snapshot.ref.path});
        // The return type of the Firestore data converter cannot be changed since it comes from the
        // Firebase SDK. Hack the types to return a sentinel value to be filtered out later.
        return FIRESTORE_PARSING_FAILURE_SENTINEL as unknown as ItemData;
      }

      return parseDataResult.value;
    },
  };
}

export class ClientFirestoreCollectionService<
  ItemId extends string,
  ItemData extends BaseStoreItem,
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
  public getCollectionRef(): CollectionReference<ItemData, ItemDataFromStorage> {
    const collectionRef = collection(firebaseService.firestore, this.collectionPath);
    return collectionRef.withConverter(this.converter);
  }

  /**
   * Returns a Firestore document reference for the given child ID.
   */
  public getDocRef(docId: ItemId): DocumentReference<ItemData, ItemDataFromStorage> {
    return doc(this.getCollectionRef(), docId);
  }

  /**
   * Constructs a Firestore query from the given filters.
   */
  public query(filters: QueryConstraint[]): Query<ItemData, ItemDataFromStorage> {
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
  public async fetchQueryDocs(
    queryToFetch: Query<ItemData, ItemDataFromStorage>
  ): AsyncResult<ItemData[]> {
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
  public async fetchQueryIds(
    queryToFetch: Query<ItemData, ItemDataFromStorage>
  ): AsyncResult<ItemId[]> {
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
    const handleSnapshot: Consumer<DocumentSnapshot<ItemData, ItemDataFromStorage>> = (docSnap) => {
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
        return;
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
    query: Query<ItemData, ItemDataFromStorage>,
    onData: Consumer<ItemData[]>,
    onError: Consumer<Error>
  ): Unsubscribe {
    const handleSnapshot: Consumer<QuerySnapshot<ItemData, ItemDataFromStorage>> = (querySnap) => {
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
   * Partially updates or creates a Firestore document. This is useful for updating a doc that may
   * or may not exist without having to first fetch it.
   */
  public async setDocWithMerge(docId: ItemId, data: Partial<ItemData>): AsyncResult<void> {
    const setResult = await asyncTry(async () => {
      const dataToWrite: PartialWithFieldValue<ItemData> = {
        ...data,
        lastUpdatedTime: clientTimestampSupplier(),
      };

      await setDoc(this.getDocRef(docId), dataToWrite, {merge: true});
    });
    return prefixResultIfError(setResult, 'Error setting Firestore document with merge');
  }

  /**
   * Updates an existing Firestore document, merging with the existing document. Throws if the
   * document does not already exist.
   */
  public async updateDoc(
    docId: ItemId,
    updates: Partial<WithFieldValue<ItemData>>
  ): AsyncResult<void> {
    const docRef = this.getDocRef(docId);
    const updateResult = await asyncTry(async () => {
      // Firestore's `updateDoc` method takes an `ItemDataFromStorage`, but there is no method to
      // transform a partial `ItemData` into a partial `ItemDataFromStorage`. The real solution
      // may be a custom
      // See the Firestore data converter docs TypeScript types for the best docs and examples.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dataToUpdate: any = {
        ...updates,
        lastUpdatedTime: clientTimestampSupplier(),
      };
      await updateDoc(docRef, dataToUpdate);
    });
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
  ItemData extends BaseStoreItem,
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
