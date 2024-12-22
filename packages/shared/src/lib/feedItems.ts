import {
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

import {asyncTry, asyncTryAllPromises} from '@shared/lib/errors';
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
} from '@shared/types/feedItems.types';
import {IconName} from '@shared/types/icons.types';
import {ImportQueueItemId} from '@shared/types/importQueue.types';
import {fromFilterOperator, ViewType} from '@shared/types/query.types';
import {AsyncResult, makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import {KeyboardShortcutId} from '@shared/types/shortcuts.types';
import {SystemTagId} from '@shared/types/tags.types';
import {AuthStateChangedUnsubscribe, UserId} from '@shared/types/user.types';
import {Consumer} from '@shared/types/utils.types';

export class FeedItemsService {
  constructor(
    private readonly feedItemsDbRef: CollectionReference,
    private readonly importQueueDbRef: CollectionReference,
    private readonly feedItemsStorageRef: StorageReference,
    private readonly userId: UserId
  ) {}

  async getFeedItem(feedItemId: FeedItemId): AsyncResult<FeedItem | null> {
    return asyncTry<FeedItem | null>(async () => {
      const snapshot = await getDoc(doc(this.feedItemsDbRef, feedItemId));
      return snapshot.exists() ? ({...snapshot.data(), feedItemId: snapshot.id} as FeedItem) : null;
    });
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
          successCallback({...snapshot.data(), feedItemId: snapshot.id} as FeedItem);
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
    readonly successCallback: Consumer<FeedItem[]>;
    readonly errorCallback: Consumer<Error>;
  }): AuthStateChangedUnsubscribe {
    const {viewType, successCallback, errorCallback} = args;

    // Construct Firestore queries from the view config.
    const viewConfig = Views.get(viewType);
    const whereClauses = [
      where('userId', '==', this.userId),
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
        const feedItems = snapshot.docs.map((doc) => doc.data() as FeedItem);
        successCallback(feedItems);
      },
      errorCallback
    );
    return () => unsubscribe();
  }

  async addFeedItem(args: {
    readonly url: string;
    readonly source: FeedItemSource;
  }): AsyncResult<FeedItemId | null> {
    const {url, source} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return makeErrorResult(new Error(`Invalid URL provided for feed item: "${url}"`));
    }

    const feedItemDoc = doc(this.feedItemsDbRef);

    const feedItem = makeFeedItem({
      feedItemId: feedItemDoc.id as FeedItemId,
      type: FeedItemType.Website,
      url: trimmedUrl,
      // TODO: Make this dynamic based on the actual content. Maybe it should be null initially
      // until we've done the import? Or should we compute this at save time?
      source,
      userId: this.userId,
    });

    // Generate a push ID for the feed item.
    const importQueueItemId = doc(this.importQueueDbRef).id as ImportQueueItemId;

    // Add the feed item to the import queue.
    const importQueueItem = makeImportQueueItem({
      importQueueItemId,
      feedItemId: feedItem.feedItemId,
      userId: this.userId,
      url: trimmedUrl,
    });

    const addFeedItemResult = await asyncTryAllPromises([
      setDoc(feedItemDoc, feedItem),
      setDoc(doc(this.importQueueDbRef, importQueueItemId), importQueueItem),
    ]);

    if (!addFeedItemResult.success) {
      return makeErrorResult(addFeedItemResult.error);
    }

    return makeSuccessResult(feedItem.feedItemId);
  }

  async updateFeedItem(feedItemId: FeedItemId, item: Partial<FeedItem>): AsyncResult<undefined> {
    return asyncTry<undefined>(async () => {
      await updateDoc(doc(this.feedItemsDbRef, feedItemId), item);
    });
  }

  async deleteFeedItem(feedItemId: FeedItemId): AsyncResult<undefined> {
    return asyncTry<undefined>(async () => {
      await deleteDoc(doc(this.feedItemsDbRef, feedItemId));
    });
  }

  async getFeedItemMarkdown(feedItemId: FeedItemId): AsyncResult<string> {
    // TODO: Clean up error handling here.
    return asyncTry<string>(async () => {
      const fileRef = storageRef(
        this.feedItemsStorageRef,
        `${this.userId}/${feedItemId}/llmContext.md`
      );
      const downloadUrl = await getDownloadURL(fileRef);
      // TODO: Use shared `request` helper instead of `fetch`.
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Response status ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    });
  }

  public static isMarkedDone(feedItem: MaybeFeedItem): boolean {
    return feedItem?.triageStatus === TriageStatus.Done;
  }

  public static isSaved(feedItem: MaybeFeedItem): boolean {
    return feedItem?.triageStatus === TriageStatus.Saved;
  }

  public static isTrashed(feedItem: MaybeFeedItem): boolean {
    return feedItem?.triageStatus === TriageStatus.Trashed;
  }

  public static isStarred(feedItem: MaybeFeedItem): boolean {
    return feedItem?.tagIds[SystemTagId.Starred] === true;
  }

  public static isImporting(feedItem: MaybeFeedItem): boolean {
    return feedItem?.tagIds[SystemTagId.Importing] === true;
  }

  public static isUnread(feedItem: MaybeFeedItem): boolean {
    return feedItem?.tagIds[SystemTagId.Unread] === true;
  }
}

interface MakeFeedItemArgs {
  readonly feedItemId: FeedItemId;
  readonly type: FeedItemType;
  readonly url: string;
  readonly source: FeedItemSource;
  readonly userId: UserId;
}

export function makeFeedItem({feedItemId, type, url, source, userId}: MakeFeedItemArgs): FeedItem {
  return {
    feedItemId,
    userId,
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

export function getMarkDoneFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
  const isAlreadyDone = FeedItemsService.isMarkedDone(feedItem);
  return {
    type: FeedItemActionType.MarkDone,
    text: isAlreadyDone ? 'Mark undone' : 'Mark done',
    icon: IconName.MarkDone, // TODO: Make icon dynamic.
    shortcutId: KeyboardShortcutId.ToggleDone,
  };
}

export function getSaveFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
  const isAlreadySaved = FeedItemsService.isSaved(feedItem);
  return {
    type: FeedItemActionType.Save,
    text: isAlreadySaved ? 'Unsave' : 'Save',
    icon: IconName.Save,
    shortcutId: KeyboardShortcutId.ToggleSaved,
  };
}

export function getMarkUnreadFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
  const isAlreadyUnread = FeedItemsService.isUnread(feedItem);
  return {
    type: FeedItemActionType.MarkUnread,
    text: isAlreadyUnread ? 'Mark read' : 'Mark unread',
    icon: IconName.MarkUnread,
    shortcutId: KeyboardShortcutId.ToggleUnread,
  };
}

export function getStarFeedItemActionInfo(feedItem: FeedItem): FeedItemAction {
  const isAlreadyStarred = FeedItemsService.isStarred(feedItem);
  return {
    type: FeedItemActionType.Star,
    text: isAlreadyStarred ? 'Unstar' : 'Star',
    icon: IconName.Star,
    shortcutId: KeyboardShortcutId.ToggleStarred,
  };
}

type MaybeFeedItem = FeedItem | undefined | null;
