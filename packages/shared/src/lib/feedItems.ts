import {
  addDoc,
  CollectionReference,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import {FeedItem, FeedItemAction, FeedItemActionType, TriageStatus} from '@shared/types/core';
import {IconName} from '@shared/types/icons';
import {SystemTagId} from '@shared/types/tags';
import {Func, Task} from '@shared/types/utils';

// TODO: This is currently not used, but the path I'd like to head...

export class FeedItemsService {
  constructor(private readonly collectionRef: CollectionReference) {}

  async watchAll(callback: Func<readonly FeedItem[]>): Promise<Task> {
    const unsubscribe = onSnapshot(this.collectionRef, (snapshot) => {
      callback(snapshot.docs.map((doc) => doc.data() as FeedItem));
    });
    return unsubscribe;
  }

  async watch(callback: Func<FeedItem>): Promise<Task> {
    const unsubscribe = onSnapshot(this.collectionRef, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        callback(doc.data() as FeedItem);
      });
    });
    return unsubscribe;
  }

  async add(item: FeedItem): Promise<string> {
    const docRef = await addDoc(this.collectionRef, item);
    return docRef.id;
  }

  async update(itemId: string, item: Partial<FeedItem>): Promise<void> {
    return updateDoc(doc(this.collectionRef, itemId), item);
  }

  async delete(itemId: string): Promise<void> {
    return deleteDoc(doc(this.collectionRef, itemId));
  }
}

export function makeFeedItem(url: string, collectionRef: CollectionReference): FeedItem {
  return {
    itemId: doc(collectionRef).id,
    url,
    title: '',
    description: '',
    outgoingLinks: [],
    triageStatus: TriageStatus.Untriaged,
    tagIds: {
      [SystemTagId.Unread]: true,
      [SystemTagId.Importing]: true,
    },
    source: 'extension',
    createdTime: serverTimestamp(),
    lastUpdatedTime: serverTimestamp(),
  };
}

export function getMarkDoneFeedItemActionInfo(): FeedItemAction {
  return {
    type: FeedItemActionType.MarkDone,
    text: 'Mark done',
    icon: IconName.MarkDone,
  };
}

export function getSaveFeedItemActionInfo(): FeedItemAction {
  return {
    type: FeedItemActionType.Save,
    text: 'Save',
    icon: IconName.Save,
  };
}

export function getMarkUnreadFeedItemActionInfo(): FeedItemAction {
  return {
    type: FeedItemActionType.MarkUnread,
    text: 'Mark unread',
    icon: IconName.MarkUnread,
  };
}

export function getStarFeedItemActionInfo(): FeedItemAction {
  return {
    type: FeedItemActionType.Star,
    text: 'Star',
    icon: IconName.Star,
  };
}
