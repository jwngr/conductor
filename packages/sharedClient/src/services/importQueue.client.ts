import {collection, serverTimestamp} from 'firebase/firestore';

import {IMPORT_QUEUE_DB_COLLECTION} from '@shared/lib/constants.shared';
import {prefixErrorResult} from '@shared/lib/errorUtils.shared';

import {parseImportQueueItem, parseImportQueueItemId} from '@shared/parsers/importQueue.parser';

import {
  makeImportQueueItem,
  type ImportQueueItem,
  type ImportQueueItemId,
} from '@shared/types/importQueue.types';
import {makeSuccessResult, type AsyncResult} from '@shared/types/result.types';

import {firebaseService} from '@sharedClient/services/firebase.client';
import {ClientFirestoreCollectionService} from '@sharedClient/services/firestore.client';

type ImportQueueCollectionService = ClientFirestoreCollectionService<
  ImportQueueItemId,
  ImportQueueItem
>;

export class ClientImportQueueService {
  private readonly importQueueCollectionService: ImportQueueCollectionService;

  constructor(args: {importQueueCollectionService: ImportQueueCollectionService}) {
    this.importQueueCollectionService = args.importQueueCollectionService;
  }

  /**
   * Adds a new import queue item to Firestore.
   */
  public async create(
    importQueueItemDetails: Omit<
      ImportQueueItem,
      'importQueueItemId' | 'createdTime' | 'lastUpdatedTime' | 'status'
    >
  ): AsyncResult<ImportQueueItem> {
    // Create the new feed source in memory.
    const makeImportQueueItemResult = makeImportQueueItem({
      feedItemId: importQueueItemDetails.feedItemId,
      userId: importQueueItemDetails.userId,
      url: importQueueItemDetails.url,
      createdTime: serverTimestamp(),
      lastUpdatedTime: serverTimestamp(),
    });
    if (!makeImportQueueItemResult.success) return makeImportQueueItemResult;
    const newImportQueueItem = makeImportQueueItemResult.value;

    // Create the new feed source in Firestore.
    const createResult = await this.importQueueCollectionService.setDoc(
      newImportQueueItem.importQueueItemId,
      newImportQueueItem
    );
    if (!createResult.success) {
      return prefixErrorResult(createResult, 'Error creating import queue item in Firestore');
    }
    return makeSuccessResult(newImportQueueItem);
  }

  /**
   * Fetches an import queue item from Firestore by its ID.
   */
  public async fetchById(
    importQueueItemId: ImportQueueItemId
  ): AsyncResult<ImportQueueItem | null> {
    return this.importQueueCollectionService.fetchById(importQueueItemId);
  }
}

const importQueueDbRef = collection(firebaseService.firestore, IMPORT_QUEUE_DB_COLLECTION);

const importQueueCollectionService = new ClientFirestoreCollectionService({
  collectionRef: importQueueDbRef,
  parseId: parseImportQueueItemId,
  parseData: parseImportQueueItem,
});

export const importQueueService = new ClientImportQueueService({
  importQueueCollectionService,
});

export function useImportQueueService(): ClientImportQueueService {
  return importQueueService;
}
