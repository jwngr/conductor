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
  FeedItemSource,
  TriageStatus,
} from '@shared/types/feedItems';
import {IconName} from '@shared/types/icons';
import {fromFilterOperator, ViewType} from '@shared/types/query';
import {SystemTagId} from '@shared/types/tags';
import {Func} from '@shared/types/utils';

import {makeImportQueueItem} from './importQueue';
import {isValidUrl} from './urls';
import {Views} from './views';

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
    successCallback: Func<FeedItem | null>, // null means feed item does not exist.
    errorCallback: Func<Error>
  ): Unsubscribe {
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

  async addFeedItem(args: {
    readonly url: string;
    readonly source: FeedItemSource;
  }): Promise<FeedItemId | null> {
    const {url, source} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) return null;

    try {
      const feedItem = makeFeedItem({
        url: trimmedUrl,
        collectionRef: this.feedItemsDbRef,
        source,
      });
      const importQueueItem = makeImportQueueItem(trimmedUrl, feedItem.itemId);

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
  readonly collectionRef: CollectionReference;
  readonly source: FeedItemSource;
}

export function makeFeedItem({url, collectionRef, source}: MakeFeedItemArgs): FeedItem {
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
    source,
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
