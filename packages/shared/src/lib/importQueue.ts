import {
  addDoc,
  CollectionReference,
  doc,
  DocumentReference,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

import {asyncTry} from '@shared/lib/errors';

import {FeedItemId} from '@shared/types/feedItems.types';
import {
  ImportQueueItem,
  ImportQueueItemId,
  ImportQueueItemStatus,
  makeImportQueueItemId,
} from '@shared/types/importQueue.types';
import {AsyncResult} from '@shared/types/result.types';
import {UserId} from '@shared/types/user.types';

// TODO: This is not used anywhere.
export class ImportQueue {
  constructor(private readonly collectionRef: CollectionReference) {}

  async add(item: ImportQueueItem): AsyncResult<ImportQueueItemId> {
    const docRefResult = await asyncTry<DocumentReference>(async () => {
      return await addDoc(this.collectionRef, item);
    });
    if (!docRefResult.success) return docRefResult;
    return makeImportQueueItemId(docRefResult.value.id);
  }

  async read(importQueueItemId: ImportQueueItemId): AsyncResult<ImportQueueItem | null> {
    return asyncTry<ImportQueueItem | null>(async () => {
      const docRef = doc(this.collectionRef, importQueueItemId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      // TODO: Add typesafe `createImportQueueItem` helper.
      return {...docSnap.data(), importQueueItemId} as ImportQueueItem;
    });
  }
}

export function makeImportQueueItem({
  importQueueItemId,
  feedItemId,
  userId,
  url,
}: {
  readonly importQueueItemId: ImportQueueItemId;
  readonly feedItemId: FeedItemId;
  readonly userId: UserId;
  readonly url: string;
}): ImportQueueItem {
  return {
    importQueueItemId,
    feedItemId,
    userId,
    url,
    status: ImportQueueItemStatus.New,
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  };
}
