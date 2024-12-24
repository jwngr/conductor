import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type {CollectionReference} from 'firebase/firestore';
import type {StorageReference} from 'firebase/storage';
import {getDownloadURL, ref as storageRef} from 'firebase/storage';
import {useEffect, useMemo, useState} from 'react';

import {makeImportQueueItem} from '@shared/services/importQueue.shared';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
} from '@shared/lib/constants.shared';
import {asyncTry, asyncTryAllPromises} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {Views} from '@shared/lib/views.shared';

import {
  FeedItemType,
  type FeedItem,
  type FeedItemId,
  type FeedItemSource,
} from '@shared/types/feedItems.types';
import type {ImportQueueItemId} from '@shared/types/importQueue.types';
import {fromFilterOperator, type ViewType} from '@shared/types/query.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {AuthStateChangedUnsubscribe, UserId} from '@shared/types/user.types';
import type {Consumer} from '@shared/types/utils.types';

import {firebaseService} from '@sharedClient/services/firebase.client';

import {useLoggedInUser} from '@sharedClient/hooks/auth.hooks';

const feedItemsDbRef = collection(firebaseService.firestore, FEED_ITEMS_DB_COLLECTION);
const importQueueDbRef = collection(firebaseService.firestore, IMPORT_QUEUE_DB_COLLECTION);
const feedItemsStorageRef = storageRef(firebaseService.storage, FEED_ITEMS_STORAGE_COLLECTION);

export function useFeedItemsService(): ClientFeedItemsService {
  const loggedInUser = useLoggedInUser();

  const feedItemsService = useMemo(() => {
    return new ClientFeedItemsService({
      feedItemsDbRef,
      importQueueDbRef,
      feedItemsStorageRef,
      userId: loggedInUser.userId,
    });
  }, [loggedInUser]);

  return feedItemsService;
}

export function useFeedItem(feedItemId: FeedItemId): {
  readonly feedItem: FeedItem | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
} {
  const feedItemsService = useFeedItemsService();
  const [state, setState] = useState<{
    readonly feedItem: FeedItem | null;
    readonly isLoading: boolean;
    readonly error: Error | null;
  }>({feedItem: null, isLoading: true, error: null});

  useEffect(() => {
    const unsubscribe = feedItemsService.watchFeedItem(
      feedItemId,
      (feedItem) => setState({feedItem, isLoading: false, error: null}),
      (error) => setState({feedItem: null, isLoading: false, error})
    );
    return () => unsubscribe();
  }, [feedItemId, feedItemsService]);

  return state;
}

export function useFeedItems({viewType}: {readonly viewType: ViewType}): {
  readonly feedItems: FeedItem[];
  readonly isLoading: boolean;
  readonly error: Error | null;
} {
  const feedItemsService = useFeedItemsService();
  const [state, setState] = useState<{
    readonly feedItems: FeedItem[];
    readonly isLoading: boolean;
    readonly error: Error | null;
  }>({feedItems: [], isLoading: true, error: null});

  useEffect(() => {
    const unsubscribe = feedItemsService.watchFeedItemsQuery({
      viewType,
      successCallback: (feedItems) => setState({feedItems, isLoading: false, error: null}),
      errorCallback: (error) => setState({feedItems: [], isLoading: false, error}),
    });
    return () => unsubscribe();
  }, [viewType, feedItemsService]);

  return state;
}

export function useFeedItemMarkdown(
  feedItemId: FeedItemId,
  isFeedItemImported: boolean
): {
  readonly markdown: string | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
} {
  const feedItemsService = useFeedItemsService();
  const [state, setState] = useState<{
    readonly markdown: string | null;
    readonly isLoading: boolean;
    readonly error: Error | null;
  }>({markdown: null, isLoading: true, error: null});

  useEffect(() => {
    let isMounted = true;

    async function go() {
      // Wait to fetch markdown until the feed item has been imported.
      if (!isFeedItemImported) return;

      const markdownResult = await feedItemsService.getFeedItemMarkdown(feedItemId);
      if (isMounted) {
        if (markdownResult.success) {
          setState({markdown: markdownResult.value, isLoading: false, error: null});
        } else {
          setState({markdown: null, isLoading: false, error: markdownResult.error});
        }
      }
    }

    void go();

    return () => {
      isMounted = false;
    };
  }, [feedItemId, isFeedItemImported, feedItemsService]);

  return state;
}

export class ClientFeedItemsService {
  private readonly feedItemsDbRef: CollectionReference;
  private readonly importQueueDbRef: CollectionReference;
  private readonly feedItemsStorageRef: StorageReference;
  private readonly userId: UserId;

  constructor(args: {
    readonly feedItemsDbRef: CollectionReference;
    readonly importQueueDbRef: CollectionReference;
    readonly feedItemsStorageRef: StorageReference;
    readonly userId: UserId;
  }) {
    this.feedItemsDbRef = args.feedItemsDbRef;
    this.importQueueDbRef = args.importQueueDbRef;
    this.feedItemsStorageRef = args.feedItemsStorageRef;
    this.userId = args.userId;
  }

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

    const feedItem = SharedFeedItemHelpers.makeFeedItem({
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

    // TODO: Do these in a transaction.
    const addFeedItemResult = await asyncTryAllPromises([
      setDoc(feedItemDoc, feedItem),
      setDoc(doc(this.importQueueDbRef, importQueueItemId), importQueueItem),
    ]);

    const addFeedItemResultError = addFeedItemResult.success
      ? addFeedItemResult.value.results.find((result) => !result.success)?.error
      : addFeedItemResult.error;
    if (addFeedItemResultError) {
      return makeErrorResult(addFeedItemResultError);
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
}
