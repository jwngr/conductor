import {addDoc, CollectionReference, doc, getDoc, serverTimestamp} from 'firebase/firestore';

import {FeedItemId} from '@shared/types/feedItems.types';
import {
  ImportQueueItem,
  ImportQueueItemId,
  ImportQueueItemStatus,
} from '@shared/types/importQueue.types';
import {UserId} from '@shared/types/user.types';

// TODO: This is not used anywhere.
export class ImportQueue {
  constructor(private readonly collectionRef: CollectionReference) {}

  async add(item: ImportQueueItem): Promise<string> {
    const docRef = await addDoc(this.collectionRef, item);
    return docRef.id;
  }

  async read(importQueueItemId: ImportQueueItemId): Promise<ImportQueueItem | null> {
    const docRef = doc(this.collectionRef, importQueueItemId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return {...docSnap.data(), importQueueItemId} as ImportQueueItem;
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
