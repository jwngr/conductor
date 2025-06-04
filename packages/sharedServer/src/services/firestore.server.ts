import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  Query,
  QueryDocumentSnapshot,
  WithFieldValue,
} from 'firebase-admin/firestore';

import {logger} from '@shared/services/logger.shared';

import {
  asyncTry,
  prefixError,
  prefixErrorResult,
  prefixResultIfError,
} from '@shared/lib/errorUtils.shared';
import {
  FIRESTORE_PARSING_FAILURE_SENTINEL,
  isParsingFailureSentinel,
} from '@shared/lib/firestore.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';

import type {AsyncResult, Result} from '@shared/types/results.types';
import type {Func} from '@shared/types/utils.types';

import {firestore} from '@sharedServer/services/firebase.server';

const BATCH_DELETE_SIZE = 500;

/**
 * Creates a strongly-typed Firestore data converter.
 */
export function makeFirestoreDataConverter<ItemData, FirestoreItemData extends DocumentData>(
  toFirestore: Func<ItemData, FirestoreItemData>,
  fromFirestore: Func<FirestoreItemData, Result<ItemData>>
): FirestoreDataConverter<ItemData, FirestoreItemData> {
  return {
    toFirestore,
    fromFirestore: (snapshot: QueryDocumentSnapshot): ItemData => {
      const data = snapshot.data() as FirestoreItemData;

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

export class ServerFirestoreCollectionService<
  ItemId extends string,
  ItemData,
  ItemDataFromSchema extends DocumentData,
> {
  private readonly collectionPath: string;
  private readonly converter: FirestoreDataConverter<ItemData, ItemDataFromSchema>;
  private readonly parseId: Func<string, Result<ItemId>>;

  constructor(args: {
    collectionPath: string;
    converter: FirestoreDataConverter<ItemData, ItemDataFromSchema>;
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
    return firestore.collection(this.collectionPath).withConverter(this.converter);
  }

  /**
   * Returns a Firestore document reference for the given child ID.
   */
  public getDocRef(docId: ItemId): DocumentReference<ItemData> {
    return this.getCollectionRef().doc(docId);
  }

  /**
   * Constructs a Firestore query from the given filters.
   */
  // TODO: Implement this.
  // public query(filters: QueryConstraint[]): Query<ItemData> {
  //   return this.getCollectionRef().where(filters);
  // }

  /**
   * Fetches data from the single Firestore document with the given ID.
   */
  public async fetchById(id: ItemId): AsyncResult<ItemData | null> {
    const docRef = this.getDocRef(id);
    const docDataResult = await asyncTry(async () => {
      const docSnap = await docRef.get();
      if (!docSnap.exists) return null;
      const docData = docSnap.data();
      if (isParsingFailureSentinel(docData)) {
        // Allow throwing here since we are inside `asyncTry`.
        // eslint-disable-next-line no-restricted-syntax
        throw new Error('Firestore document data failed to parse');
      }
      return docData ?? null;
    });
    return prefixResultIfError(docDataResult, 'Error fetching Firestore document data');
  }

  /**
   * Fetches all documents matching the Firestore query.
   */
  public async fetchQueryDocs(queryToFetch: Query<ItemData>): AsyncResult<ItemData[]> {
    const queryDataResult = await asyncTry(async () => {
      const querySnapshot = await queryToFetch.get();
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
  public async fetchFirstQueryDoc(queryToFetch: Query<ItemData>): AsyncResult<ItemData | null> {
    const queryDataResult = await asyncTry(async () => {
      const queryDocsResult = await this.fetchQueryDocs(queryToFetch);
      // Allow throwing here since we are inside `asyncTry`.
      // eslint-disable-next-line no-restricted-syntax
      if (!queryDocsResult.success) throw queryDocsResult.error;
      if (queryDocsResult.value.length === 0) return null;
      return queryDocsResult.value[0];
    });
    return prefixResultIfError(queryDataResult, 'Error fetching Firestore first query doc');
  }

  /**
   * Fetches the IDs of all documents matching the Firestore query.
   */
  public async fetchQueryIds(query: Query<ItemData>): AsyncResult<ItemId[]> {
    const queryIdsResult = await asyncTry(async () => {
      const querySnapshot = await query.get();
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
  public async setDoc(docId: ItemId, data: WithFieldValue<ItemData>): AsyncResult<void> {
    const setResult = await asyncTry(async () => this.getDocRef(docId).set(data));
    if (!setResult.success) {
      return prefixErrorResult(setResult, 'Error setting Firestore document');
    }
    // Firebase's method returns a `WriteResult` object, but we don't need to return it.
    return makeSuccessResult(undefined);
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
      docRef.update({
        ...updates,
        // TODO(timestamps): Use server timestamps instead.
        lastUpdatedTime: new Date(),
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
    const docRef = this.getDocRef(docId);
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
  public async batchDeleteDocs(idsToDelete: ItemId[]): AsyncResult<void> {
    const errors: Error[] = [];

    const totalBatches = Math.ceil(idsToDelete.length / BATCH_DELETE_SIZE);

    const idsPerBatch = Array.from({length: totalBatches}).map((_, i) =>
      idsToDelete.slice(i * BATCH_DELETE_SIZE, (i + 1) * BATCH_DELETE_SIZE)
    );

    // Run one batch at a time.
    for (const currentIds of idsPerBatch) {
      const deleteBatchResult = await asyncTry(async () => {
        const batch = firestore.batch();
        currentIds.forEach((id) => batch.delete(this.getDocRef(id)));
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

export function makeServerFirestoreCollectionService<
  ItemId extends string,
  ItemData extends DocumentData,
  ItemDataFromStorage extends DocumentData,
>(args: {
  readonly collectionPath: string;
  readonly parseId: Func<string, Result<ItemId>>;
  readonly toStorage: Func<ItemData, ItemDataFromStorage>;
  readonly fromStorage: Func<ItemDataFromStorage, Result<ItemData>>;
}): ServerFirestoreCollectionService<ItemId, ItemData, ItemDataFromStorage> {
  const {collectionPath, parseId, toStorage, fromStorage} = args;

  const firestoreConverter = makeFirestoreDataConverter(toStorage, fromStorage);

  const collectionService = new ServerFirestoreCollectionService({
    collectionPath,
    parseId,
    converter: firestoreConverter,
  });

  return collectionService;
}
