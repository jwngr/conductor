import {addDoc, CollectionReference, doc, getDoc, serverTimestamp} from 'firebase/firestore';

import {FeedItemId} from '@shared/types/feedItems';
import {ImportQueueItem, ImportQueueItemId} from '@shared/types/importQueue';
import {UserId} from '@shared/types/user';

// TODO: This is not used anywhere.
export class ImportQueue {
  constructor(private readonly collectionRef: CollectionReference) {}

  async add(item: ImportQueueItem): Promise<string> {
    const docRef = await addDoc(this.collectionRef, item);
    return docRef.id;
  }

  async read(itemId: ImportQueueItemId): Promise<ImportQueueItem | null> {
    const docRef = doc(this.collectionRef, itemId);
    const docSnap = await getDoc(docRef);
    return {...docSnap.data(), importQueueItemId: itemId} as ImportQueueItem | null;
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
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  };
}
