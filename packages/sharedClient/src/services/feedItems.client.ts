import {where} from 'firebase/firestore';
import type {StorageReference} from 'firebase/storage';
import {getBlob, ref as storageRef} from 'firebase/storage';
import {useEffect, useMemo} from 'react';

import {logger} from '@shared/services/logger.shared';

import {makeSuccessAsyncState} from '@shared/lib/asyncState.shared';
import {
  FEED_ITEM_FILE_NAME_LLM_CONTEXT,
  FEED_ITEM_FILE_NAME_TRANSCRIPT,
  FEED_ITEM_FILE_NAME_XKCD_EXPLAIN,
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
} from '@shared/lib/constants.shared';
import {isDeliveredAccordingToSchedule} from '@shared/lib/deliverySchedules.shared';
import {asyncTry, prefixErrorResult, prefixResultIfError} from '@shared/lib/errorUtils.shared';
import {
  findDeliveryScheduleForFeedSubscription,
  SharedFeedItemHelpers,
} from '@shared/lib/feedItems.shared';
import {makeErrorResult, makeSuccessResult} from '@shared/lib/results.shared';
import {isValidUrl} from '@shared/lib/urls.shared';
import {assertNever, omitUndefined} from '@shared/lib/utils.shared';
import {Views} from '@shared/lib/views.shared';

import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';

import type {AccountId, AuthStateChangedUnsubscribe} from '@shared/types/accounts.types';
import {AsyncStatus} from '@shared/types/asyncState.types';
import type {AsyncState} from '@shared/types/asyncState.types';
import type {FeedItem, FeedItemId, XkcdFeedItem} from '@shared/types/feedItems.types';
import {FeedSourceType} from '@shared/types/feedSources.types';
import type {FeedSource} from '@shared/types/feedSources.types';
import {fromQueryFilterOp} from '@shared/types/query.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';
import type {Consumer} from '@shared/types/utils.types';
import type {ViewType} from '@shared/types/views.types';

import {firebaseService} from '@sharedClient/services/firebase.client';
import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';
import {useUserFeedSubscriptions} from '@sharedClient/services/userFeedSubscriptions.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';
import {useIsMounted} from '@sharedClient/hooks/utils.hook';

const feedItemsStorageRef = storageRef(firebaseService.storage, FEED_ITEMS_STORAGE_COLLECTION);

const feedItemFirestoreConverter = makeFirestoreDataConverter(toStorageFeedItem, parseFeedItem);

export function useFeedItemsService(): ClientFeedItemsService {
  const loggedInAccount = useLoggedInAccount();

  const feedItemsService = useMemo(() => {
    const feedItemsCollectionService = new ClientFirestoreCollectionService({
      collectionPath: FEED_ITEMS_DB_COLLECTION,
      converter: feedItemFirestoreConverter,
      parseId: parseFeedItemId,
    });

    return new ClientFeedItemsService({
      feedItemsCollectionService,
      feedItemsStorageRef,
      accountId: loggedInAccount.accountId,
    });
  }, [loggedInAccount.accountId]);

  return feedItemsService;
}

export function useFeedItem(feedItemId: FeedItemId): AsyncState<FeedItem | null> {
  const feedItemsService = useFeedItemsService();

  const {asyncState, setPending, setError, setSuccess} = useAsyncState<FeedItem | null>();

  useEffect(() => {
    setPending();
    const unsubscribe = feedItemsService.watchFeedItem(
      feedItemId,
      (feedItem) => setSuccess(feedItem),
      (error) => setError(error)
    );
    return () => unsubscribe();
  }, [feedItemId, setPending, setError, setSuccess, feedItemsService]);

  return asyncState;
}

/**
 * Filters out feed items with delivery schedules that prevent them from being shown.
 */
function filterFeedItemsByDeliverySchedules(args: {
  readonly feedItems: FeedItem[];
  readonly userFeedSubscriptions: UserFeedSubscription[];
}): FeedItem[] {
  const {feedItems, userFeedSubscriptions} = args;

  return feedItems.filter((feedItem) => {
    switch (feedItem.feedSource.feedSourceType) {
      case FeedSourceType.PWA:
      case FeedSourceType.Extension:
      case FeedSourceType.PocketExport:
        // These sources are always shown.
        return true;
      case FeedSourceType.YouTubeChannel:
      case FeedSourceType.Interval:
      case FeedSourceType.RSS: {
        // Some sources have delivery schedules which determine when they are shown.
        const matchingDeliverySchedule = findDeliveryScheduleForFeedSubscription({
          userFeedSubscriptionId: feedItem.feedSource.userFeedSubscriptionId,
          userFeedSubscriptions,
        });

        return isDeliveredAccordingToSchedule({
          createdTime: feedItem.createdTime,
          deliverySchedule: matchingDeliverySchedule,
        });
      }
      default:
        assertNever(feedItem.feedSource);
    }
  });
}

/**
 * Internal helper for fetching all feed items for a view, ignoring delivery schedules. Works for
 * all views.
 */
function useFeedItemsInternal(args: {readonly viewType: ViewType}): AsyncState<FeedItem[]> {
  const {viewType} = args;
  const feedItemsService = useFeedItemsService();

  const {asyncState, setPending, setError, setSuccess} = useAsyncState<FeedItem[]>();

  useEffect(() => {
    setPending();
    const unsubscribe = feedItemsService.watchFeedItemsQuery({
      viewType,
      successCallback: (feedItems) => setSuccess(feedItems),
      errorCallback: (error) => setError(error),
    });
    return () => unsubscribe();
  }, [viewType, feedItemsService, setPending, setError, setSuccess]);

  return asyncState;
}

/**
 * Fetches all feed items for a view, ignoring delivery schedules. Used for most views.
 *
 * Note: Use `useFeedItemsRespectingDelivery` for views like Untriaged which should filter based on
 * delivery schedules.
 */
export function useFeedItemsIgnoringDelivery(args: {
  readonly viewType: Exclude<ViewType, ViewType.Untriaged>;
}): AsyncState<FeedItem[]> {
  return useFeedItemsInternal({viewType: args.viewType});
}

/**
 * Fetches all feed items for a view while filtering out items based on delivery schedules. Only
 * used for the Untriaged view, although could be used for other views in the future.
 *
 * Note: Use `useFeedItemsIgnoringDelivery` for views which should not filter based on delivery
 * schedules.
 */
export function useFeedItemsRespectingDelivery(args: {
  readonly viewType: ViewType.Untriaged;
}): AsyncState<FeedItem[]> {
  const {viewType} = args;

  const feedItemsState = useFeedItemsInternal({viewType});
  const userFeedSubscriptionsState = useUserFeedSubscriptions();

  const filteredFeedItemsState: AsyncState<FeedItem[]> = useMemo(() => {
    // Do not consider loaded until both the feed items and the user feed subscriptions are loaded. filtering.
    // Favor the feed items state over the user feed subscriptions state.
    if (feedItemsState.status !== AsyncStatus.Success) {
      return feedItemsState;
    }

    if (userFeedSubscriptionsState.status !== AsyncStatus.Success) {
      return userFeedSubscriptionsState;
    }

    // Filter the feed items based on delivery schedules.
    const filteredFeedItems = filterFeedItemsByDeliverySchedules({
      feedItems: feedItemsState.value,
      userFeedSubscriptions: userFeedSubscriptionsState.value,
    });

    return makeSuccessAsyncState(filteredFeedItems);
  }, [feedItemsState, userFeedSubscriptionsState]);

  return filteredFeedItemsState;
}

export function useFeedItemFile(args: {
  readonly feedItem: FeedItem;
  readonly filename: string;
}): AsyncState<string> {
  const {feedItem, filename} = args;
  const feedItemId = feedItem.feedItemId;
  const hasFeedItemEverBeenImported = SharedFeedItemHelpers.hasEverBeenImported(feedItem);

  const isMounted = useIsMounted();
  const feedItemsService = useFeedItemsService();

  const {asyncState, setPending, setError, setSuccess} = useAsyncState<string>();

  useEffect(() => {
    async function go(): Promise<void> {
      if (!hasFeedItemEverBeenImported) {
        const error = new Error('Cannot fetch file for feed item that has never been imported');
        logger.error(error, {feedItemId, filename});
        setError(error);
        return;
      }

      setPending();
      const contentsResult = await feedItemsService.getFileFromStorage({feedItemId, filename});

      if (!isMounted.current) return;

      if (contentsResult.success) {
        setSuccess(contentsResult.value);
      } else {
        setError(contentsResult.error);
      }
    }

    void go();
  }, [
    feedItemId,
    filename,
    hasFeedItemEverBeenImported,
    feedItemsService,
    isMounted,
    setPending,
    setError,
    setSuccess,
  ]);

  return asyncState;
}

export function useFeedItemMarkdown(feedItem: FeedItem): AsyncState<string> {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_NAME_LLM_CONTEXT});
}

export function useYouTubeFeedItemTranscript(feedItem: FeedItem): AsyncState<string> {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_NAME_TRANSCRIPT});
}

export function useExplainXkcdMarkdown(feedItem: XkcdFeedItem): AsyncState<string> {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_NAME_XKCD_EXPLAIN});
}

type FeedItemsCollectionService = ClientFirestoreCollectionService<FeedItemId, FeedItem>;

export class ClientFeedItemsService {
  private readonly feedItemsCollectionService: FeedItemsCollectionService;
  private readonly feedItemsStorageRef: StorageReference;
  private readonly accountId: AccountId;

  constructor(args: {
    readonly feedItemsCollectionService: FeedItemsCollectionService;
    readonly feedItemsStorageRef: StorageReference;
    readonly accountId: AccountId;
  }) {
    this.feedItemsCollectionService = args.feedItemsCollectionService;
    this.feedItemsStorageRef = args.feedItemsStorageRef;
    this.accountId = args.accountId;
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
      where('accountId', '==', this.accountId),
      ...viewConfig.filters.map((filter) =>
        where(filter.field, fromQueryFilterOp(filter.op), filter.value)
      ),
      // TODO: Order by created time to ensure a consistent order.
      // orderBy(viewConfig.sort.field, viewConfig.sort.direction),
    ];
    const itemsQuery = this.feedItemsCollectionService.query(whereClauses);

    const unsubscribe = this.feedItemsCollectionService.watchDocs(
      itemsQuery,
      successCallback,
      errorCallback
    );
    return () => unsubscribe();
  }

  public async createFeedItem(
    args: Pick<FeedItem, 'feedSource' | 'url' | 'title'>
  ): AsyncResult<FeedItem> {
    const {feedSource, url, title} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return makeErrorResult(new Error(`Invalid URL provided for feed item: "${url}"`));
    }

    // Create a new feed item object locally.
    const feedItemResult = SharedFeedItemHelpers.makeFeedItem({
      feedSource,
      url: trimmedUrl,
      accountId: this.accountId,
      title,
      description: null,
    });
    if (!feedItemResult.success) return feedItemResult;
    const feedItem = feedItemResult.value;

    // Save the feed item to Firestore.
    const addFeedItemResult = await this.feedItemsCollectionService.setDoc(
      feedItem.feedItemId,
      feedItem
    );
    if (!addFeedItemResult.success) return makeErrorResult(addFeedItemResult.error);

    // Return the feed item.
    return makeSuccessResult(feedItem);
  }

  public async updateFeedItem(
    feedItemId: FeedItemId,
    updates: Partial<
      Pick<FeedItem, 'url' | 'title' | 'description' | 'outgoingLinks' | 'triageStatus' | 'tagIds'>
    >
  ): AsyncResult<void> {
    const updateResult = await this.feedItemsCollectionService.updateDoc(
      feedItemId,
      omitUndefined(updates)
    );
    return prefixResultIfError(updateResult, 'Error updating feed item');
  }

  public async deleteFeedItem(feedItemId: FeedItemId): AsyncResult<void> {
    const deleteResult = await this.feedItemsCollectionService.deleteDoc(feedItemId);
    return prefixResultIfError(deleteResult, 'Error deleting feed item');
  }

  /**
   * Returns an account-specific path to a file in Firebase Storage for a given feed item.
   */
  public getFilePath(args: {readonly feedItemId: FeedItemId; readonly filename: string}): string {
    const {feedItemId, filename} = args;
    return `${this.accountId}/${feedItemId}/${filename}`;
  }

  /**
   * Fetches a file from Firebase Storage as a string.
   */
  public async getFileFromStorage(args: {
    readonly feedItemId: FeedItemId;
    readonly filename: string;
  }): AsyncResult<string> {
    const {feedItemId, filename} = args;

    const filePath = this.getFilePath({feedItemId, filename});
    const fileRef = storageRef(this.feedItemsStorageRef, filePath);

    // Fetch the download URL for the file.
    const downloadUrlResult = await asyncTry(async () => getBlob(fileRef));
    if (!downloadUrlResult.success) {
      return prefixErrorResult(downloadUrlResult, 'Error fetching feed item download URL');
    }

    // TODO: Handle various expected Firebase errors.

    const parseBlobResult = await asyncTry(async () => downloadUrlResult.value.text());
    return prefixResultIfError(parseBlobResult, 'Error parsing downloaded file blob');
  }

  public async getFeedItemMarkdown(feedItemId: FeedItemId): AsyncResult<string> {
    return this.getFileFromStorage({feedItemId, filename: FEED_ITEM_FILE_NAME_LLM_CONTEXT});
  }

  public async getFeedItemTranscript(feedItemId: FeedItemId): AsyncResult<string> {
    return this.getFileFromStorage({feedItemId, filename: FEED_ITEM_FILE_NAME_TRANSCRIPT});
  }
}
