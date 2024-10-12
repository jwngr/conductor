import {addDoc, CollectionReference, doc, getDoc, serverTimestamp} from 'firebase/firestore';

import {FeedItemId, ImportQueueItem} from '@shared/types/core';

export class ImportQueue {
  constructor(private readonly collectionRef: CollectionReference) {}

  async add(item: ImportQueueItem): Promise<string> {
    const docRef = await addDoc(this.collectionRef, item);
    return docRef.id;
  }

  async read(id: string): Promise<ImportQueueItem | null> {
    const docRef = doc(this.collectionRef, id);
    const docSnap = await getDoc(docRef);
    return docSnap.data() as ImportQueueItem | null;
  }
}

export function makeImportQueueItem(url: string, feedItemId: FeedItemId): ImportQueueItem {
  return {
    // TODO: Add an ID for these objects?
    url,
    feedItemId,
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  };
}
