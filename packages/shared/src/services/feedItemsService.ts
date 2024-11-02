import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {getDownloadURL, ref as storageRef, StorageReference} from 'firebase/storage';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
} from '@shared/lib/constants';
import {firestore, storage} from '@shared/lib/firebase';
import {makeImportQueueItem} from '@shared/lib/importQueue';
import {isValidUrl} from '@shared/lib/urls';
import {Views} from '@shared/lib/views';

import {
  FeedItem,
  FeedItemAction,
  FeedItemActionType,
  FeedItemId,
  FeedItemSource,
  FeedItemType,
  TriageStatus,
} from '@shared/types/feedItems';
import {IconName} from '@shared/types/icons';
import {ImportQueueItemId} from '@shared/types/importQueue';
import {fromFilterOperator, ViewType} from '@shared/types/query';
import {SystemTagId} from '@shared/types/tags';
import {AuthStateChangedUnsubscribe, UserId} from '@shared/types/user';
import {Consumer} from '@shared/types/utils';

export class FeedItemsService {
  constructor(
    private readonly feedItemsDbRef: CollectionReference,
    private readonly importQueueDbRef: CollectionReference,
    private readonly feedItemsStorageRef: StorageReference
  ) {}

  async getFeedItem(itemId: FeedItemId): Promise<FeedItem | null> {
    try {
      const snapshot = await getDoc(doc(this.feedItemsDbRef, itemId));
      return snapshot.exists() ? ({...snapshot.data(), itemId: snapshot.id} as FeedItem) : null;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error fetching feed item: ${error.message}`, {cause: error});
      } else {
        throw new Error(`Error fetching feed item: ${error}`);
      }
    }
  }

  watchFeedItem(
    feedItemId: FeedItemId,
    successCallback: Consumer<FeedItem | null>, // null means feed item does not exist.
    errorCallback: Consumer<Error>
  ): AuthStateChangedUnsubscribe {
    const unsubscribe = onSnapshot(
      doc(this.feedItemsDbRef, feedItemId),
      (snapshot) => {
        if (snapshot.exists()) {
          successCallback({...snapshot.data(), itemId: snapshot.id} as FeedItem);
        } else {
          successCallback(null);
        }
      },
      errorCallback
    );
    return () => unsubscribe();
  }

  watchFeedItemsQuery(args: {
    readonly viewType: ViewType;
    readonly userId: UserId;
    readonly successCallback: Consumer<FeedItem[]>;
    readonly errorCallback: Consumer<Error>;
  }): AuthStateChangedUnsubscribe {
    const {viewType, userId, successCallback, errorCallback} = args;

    // Construct Firestore queries from the view config.
    const viewConfig = Views.get(viewType);
    const whereClauses = [
      where('userId', '==', userId),
      ...viewConfig.filters.map((filter) =>
        where(filter.field, fromFilterOperator(filter.op), filter.value)
      ),
    ];
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
    return () => unsubscribe();
  }

  async addFeedItem(args: {
    readonly url: string;
    readonly source: FeedItemSource;
    readonly userId: UserId;
  }): Promise<FeedItemId | null> {
    const {url, source, userId} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) return null;

    try {
      const feedItem = makeFeedItem({
        url: trimmedUrl,
        // TODO: Make this dynamic based on the actual content. Maybe it should be null initially
        // until we've done the import? Or should we compute this at save time?
        type: FeedItemType.Website,
        source,
        collectionRef: this.feedItemsDbRef,
      });

      // Generate a push ID for the feed item.
      const importQueueItemId = doc(this.importQueueDbRef).id as ImportQueueItemId;

      // Add the feed item to the import queue.
      const importQueueItem = makeImportQueueItem({
        importQueueItemId,
        feedItemId: feedItem.itemId,
        userId,
        url: trimmedUrl,
      });

      await Promise.all([
        setDoc(doc(this.feedItemsDbRef, feedItem.itemId), feedItem),
        addDoc(this.importQueueDbRef, importQueueItem),
      ]);

      return feedItem.itemId;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error adding feed item: ${error.message}`, {cause: error});
      } else {
        throw new Error(`Error adding feed item: ${error}`);
      }
    }
  }

  async updateFeedItem(itemId: FeedItemId, item: Partial<FeedItem>): Promise<void> {
    try {
      await updateDoc(doc(this.feedItemsDbRef, itemId), item);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error updating feed item: ${error.message}`, {cause: error});
      } else {
        throw new Error(`Error updating feed item: ${error}`);
      }
    }
  }

  async deleteFeedItem(itemId: FeedItemId): Promise<void> {
    try {
      await deleteDoc(doc(this.feedItemsDbRef, itemId));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error deleting feed item: ${error.message}`, {cause: error});
      } else {
        throw new Error(`Error deleting feed item: ${error}`);
      }
    }
  }

  async getFeedItemMarkdown(itemId: FeedItemId): Promise<string> {
    try {
      const fileRef = storageRef(this.feedItemsStorageRef, `${itemId}/llmContext.md`);
      const downloadUrl = await getDownloadURL(fileRef);
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Response status ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error getting feed item markdown: ${error.message}`, {cause: error});
      } else {
        throw new Error(`Error getting feed item markdown: ${error}`);
      }
    }
  }
}

interface MakeFeedItemArgs {
  readonly url: string;
  readonly type: FeedItemType;
  readonly source: FeedItemSource;
  readonly collectionRef: CollectionReference;
}

export function makeFeedItem({url, type, source, collectionRef}: MakeFeedItemArgs): FeedItem {
  return {
    itemId: doc(collectionRef).id,
    url,
    type,
    source,
    title: '',
    description: '',
    outgoingLinks: [],
    triageStatus: TriageStatus.Untriaged,
    tagIds: {
      [SystemTagId.Unread]: true,
      [SystemTagId.Importing]: true,
    },
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

const feedItemsDbRef = collection(firestore, FEED_ITEMS_DB_COLLECTION);
const importQueueDbRef = collection(firestore, IMPORT_QUEUE_DB_COLLECTION);
const feedItemsStorageRef = storageRef(storage, FEED_ITEMS_STORAGE_COLLECTION);

export const feedItemsService = new FeedItemsService(
  feedItemsDbRef,
  importQueueDbRef,
  feedItemsStorageRef
);
