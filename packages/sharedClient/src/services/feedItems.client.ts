import {where} from 'firebase/firestore';
import type {StorageReference} from 'firebase/storage';
import {getDownloadURL, ref as storageRef} from 'firebase/storage';
import {useEffect, useMemo, useState} from 'react';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
} from '@shared/lib/constants.shared';
import {
  asyncTry,
  asyncTryAll,
  prefixErrorResult,
  prefixResultIfError,
} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {requestGet} from '@shared/lib/requests.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {Views} from '@shared/lib/views.shared';

import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';

import {
  FeedItemType,
  type FeedItem,
  type FeedItemId,
  type FeedItemSource,
} from '@shared/types/feedItems.types';
import {makeImportQueueItem} from '@shared/types/importQueue.types';
import {fromFilterOperator, type ViewType} from '@shared/types/query.types';
import type {AsyncResult} from '@shared/types/result.types';
import {makeErrorResult, makeSuccessResult} from '@shared/types/result.types';
import type {AuthStateChangedUnsubscribe, UserId} from '@shared/types/user.types';
import type {Consumer} from '@shared/types/utils.types';

import {firebaseService} from '@sharedClient/services/firebase.client';
import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';
import {useImportQueueService} from '@sharedClient/services/importQueue.client';
import type {ClientImportQueueService} from '@sharedClient/services/importQueue.client';

import {useLoggedInUser} from '@sharedClient/hooks/auth.hooks';

const feedItemsStorageRef = storageRef(firebaseService.storage, FEED_ITEMS_STORAGE_COLLECTION);

const feedItemFirestoreConverter = makeFirestoreDataConverter(toStorageFeedItem, parseFeedItem);

export function useFeedItemsService(): ClientFeedItemsService {
  const loggedInUser = useLoggedInUser();
  const importQueueService = useImportQueueService();

  const feedItemsService = useMemo(() => {
    const feedItemsCollectionService = new ClientFirestoreCollectionService({
      collectionPath: FEED_ITEMS_DB_COLLECTION,
      converter: feedItemFirestoreConverter,
      parseId: parseFeedItemId,
    });

    return new ClientFeedItemsService({
      feedItemsCollectionService,
      importQueueService,
      feedItemsStorageRef,
      userId: loggedInUser.userId,
    });
  }, [loggedInUser.userId, importQueueService]);

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

type FeedItemsCollectionService = ClientFirestoreCollectionService<FeedItemId, FeedItem>;

export class ClientFeedItemsService {
  private readonly feedItemsCollectionService: FeedItemsCollectionService;
  private readonly importQueueService: ClientImportQueueService;
  private readonly feedItemsStorageRef: StorageReference;
  private readonly userId: UserId;

  constructor(args: {
    readonly feedItemsCollectionService: FeedItemsCollectionService;
    readonly importQueueService: ClientImportQueueService;
    readonly feedItemsStorageRef: StorageReference;
    readonly userId: UserId;
  }) {
    this.feedItemsCollectionService = args.feedItemsCollectionService;
    this.importQueueService = args.importQueueService;
    this.feedItemsStorageRef = args.feedItemsStorageRef;
    this.userId = args.userId;
  }

  public async fetchById(feedItemId: FeedItemId): AsyncResult<FeedItem | null> {
    return this.feedItemsCollectionService.fetchById(feedItemId);
  }

  public watchFeedItem(
    feedItemId: FeedItemId,
    successCallback: Consumer<FeedItem | null>, // null means feed item does not exist.
    errorCallback: Consumer<Error>
  ): AuthStateChangedUnsubscribe {
    const unsubscribe = this.feedItemsCollectionService.watchDoc(
      feedItemId,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }

  public watchFeedItemsQuery(args: {
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
    const itemsQuery = this.feedItemsCollectionService.query(whereClauses);

    const unsubscribe = this.feedItemsCollectionService.watchDocs(
      itemsQuery,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }

  public async createFeedItem(args: {
    readonly url: string;
    readonly source: FeedItemSource;
  }): AsyncResult<FeedItemId | null> {
    const {url, source} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return makeErrorResult(new Error(`Invalid URL provided for feed item: "${url}"`));
    }

    const feedItemResult = SharedFeedItemHelpers.makeFeedItem({
      type: FeedItemType.Website,
      url: trimmedUrl,
      // TODO: Make this dynamic based on the actual content. Maybe it should be null initially
      // until we've done the import? Or should we compute this at save time?
      source,
      userId: this.userId,
    });
    if (!feedItemResult.success) return feedItemResult;
    const feedItem = feedItemResult.value;

    // Add the feed item to the import queue.
    const makeImportQueueItemResult = makeImportQueueItem({
      feedItemId: feedItem.feedItemId,
      userId: this.userId,
      url: trimmedUrl,
    });
    if (!makeImportQueueItemResult.success) return makeImportQueueItemResult;

    // TODO: Do these in a transaction.
    const addFeedItemResult = await asyncTryAll([
      this.feedItemsCollectionService.setDoc(feedItem.feedItemId, feedItem),
      this.importQueueService.create({
        feedItemId: feedItem.feedItemId,
        userId: this.userId,
        url: trimmedUrl,
      }),
    ]);

    const addFeedItemResultError = addFeedItemResult.success
      ? addFeedItemResult.value.results.find((result) => !result.success)?.error
      : addFeedItemResult.error;
    if (addFeedItemResultError) {
      return makeErrorResult(addFeedItemResultError);
    }

    return makeSuccessResult(feedItem.feedItemId);
  }

  public async updateFeedItem(
    feedItemId: FeedItemId,
    item: Partial<
      Pick<FeedItem, 'url' | 'title' | 'description' | 'outgoingLinks' | 'triageStatus' | 'tagIds'>
    >
  ): AsyncResult<void> {
    const updateResult = await this.feedItemsCollectionService.updateDoc(feedItemId, item);
    return prefixResultIfError(updateResult, 'Error updating feed item');
  }

  public async deleteFeedItem(feedItemId: FeedItemId): AsyncResult<void> {
    const deleteResult = await this.feedItemsCollectionService.deleteDoc(feedItemId);
    return prefixResultIfError(deleteResult, 'Error deleting feed item');
  }

  public async getFeedItemMarkdown(feedItemId: FeedItemId): AsyncResult<string> {
    const fileRef = storageRef(
      this.feedItemsStorageRef,
      `${this.userId}/${feedItemId}/llmContext.md`
    );

    // Fetch the download URL for the file.
    const downloadUrlResult = await asyncTry(async () => getDownloadURL(fileRef));
    if (!downloadUrlResult.success) {
      return prefixErrorResult(downloadUrlResult, 'Error fetching feed item download URL');
    }

    // Fetch the markdown content from the file.
    const downloadUrl = downloadUrlResult.value;
    const responseResult = await requestGet<string>(downloadUrl, {
      headers: {'Content-Type': 'text/markdown'},
    });

    // Return the markdown content.
    return prefixResultIfError(responseResult, 'Error fetching feed item markdown content');
  }
}
