import {
  addDoc,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import {getDownloadURL, ref as storageRef, StorageReference} from 'firebase/storage';

import {
  FeedItem,
  FeedItemAction,
  FeedItemActionType,
  FeedItemId,
  TriageStatus,
} from '@shared/types/core';
import {IconName} from '@shared/types/icons';
import {fromFilterOperator, ViewType} from '@shared/types/query';
import {SystemTagId} from '@shared/types/tags';
import {Func} from '@shared/types/utils';

import {makeImportQueueItem} from './importQueue';
import {Views} from './views';

export class FeedItemsService {
  constructor(
    private readonly feedItemsDbRef: CollectionReference,
    private readonly importQueueDbRef: CollectionReference,
    private readonly feedItemsStorageRef: StorageReference
  ) {}

  watchAll(successCallback: Func<readonly FeedItem[]>, errorCallback: Func<Error>): Unsubscribe {
    const unsubscribe = onSnapshot(
      this.feedItemsDbRef,
      (snapshot) => {
        successCallback(snapshot.docs.map((doc) => ({...doc.data(), itemId: doc.id}) as FeedItem));
      },
      errorCallback
    );
    return unsubscribe;
  }

  watchFeedItem(
    feedItemId: FeedItemId,
    successCallback: Func<FeedItem>,
    errorCallback: Func<Error>
  ): Unsubscribe {
    const unsubscribe = onSnapshot(
      doc(this.feedItemsDbRef, feedItemId),
      (snapshot) => {
        successCallback({...snapshot.data(), itemId: snapshot.id} as FeedItem);
      },
      errorCallback
    );
    return unsubscribe;
  }

  watchFeedItemsQuery(
    viewType: ViewType,
    successCallback: Func<FeedItem[]>,
    errorCallback: Func<Error>
  ): Unsubscribe {
    // Construct Firestore queries from the view config.
    const viewConfig = Views.get(viewType);
    const whereClauses = viewConfig.filters.map((filter) =>
      where(filter.field, fromFilterOperator(filter.op), filter.value)
    );
    const itemsQuery = query(
      this.feedItemsDbRef,
      ...whereClauses
      // TODO: Add order by condition.
      // orderBy(viewConfig.sort.field, fromSortDirection(viewConfig.sort.direction))
    );

    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const feedItems = snapshot.docs.map((doc) => ({...doc.data(), itemId: doc.id}) as FeedItem);
        successCallback(feedItems);
      },
      errorCallback
    );
    return unsubscribe;
  }

  async addFeedItem(url: string): Promise<FeedItemId | null> {
    const trimmedUrl = url.trim();

    // TODO: Validate URL.
    if (!trimmedUrl) {
      return null;
    }

    try {
      const feedItem = makeFeedItem(url, this.feedItemsDbRef);
      const importQueueItem = makeImportQueueItem(url, feedItem.itemId);

      await Promise.all([
        setDoc(doc(this.feedItemsDbRef, feedItem.itemId), feedItem),
        addDoc(this.importQueueDbRef, importQueueItem),
      ]);

      return feedItem.itemId;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateFeedItem(itemId: FeedItemId, item: Partial<FeedItem>): Promise<void> {
    return updateDoc(doc(this.feedItemsDbRef, itemId), item);
  }

  async deleteFeedItem(itemId: FeedItemId): Promise<void> {
    return deleteDoc(doc(this.feedItemsDbRef, itemId));
  }

  async getFeedItem(itemId: FeedItemId): Promise<FeedItem | null> {
    const docSnap = await getDoc(doc(this.feedItemsDbRef, itemId));
    if (docSnap.exists()) {
      return {...docSnap.data(), itemId: docSnap.id} as FeedItem;
    }
    return null;
  }

  async getFeedItemMarkdown(itemId: FeedItemId): Promise<string> {
    return getDownloadURL(storageRef(this.feedItemsStorageRef, `${itemId}/llmContext.md`));
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
