import {ref as storageRef} from 'firebase/storage';
import {useEffect, useMemo} from 'react';

import {logger} from '@shared/services/logger.shared';

import {makeSuccessAsyncState} from '@shared/lib/asyncState.shared';
import {
  FEED_ITEM_FILE_HTML,
  FEED_ITEM_FILE_HTML_MARKDOWN,
  FEED_ITEM_FILE_LLM_CONTEXT,
  FEED_ITEM_FILE_TRANSCRIPT,
  FEED_ITEM_FILE_XKCD_EXPLAIN,
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
} from '@shared/lib/constants.shared';
import {isDeliveredAccordingToSchedule} from '@shared/lib/deliverySchedules.shared';
import {
  findDeliveryScheduleForFeedSubscription,
  SharedFeedItemHelpers,
} from '@shared/lib/feedItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {AsyncState} from '@shared/types/asyncState.types';
import type {FeedItem, FeedItemId, XkcdFeedItem} from '@shared/types/feedItems.types';
import {FeedSourceType} from '@shared/types/feedSourceTypes.types';
import type {UserFeedSubscription} from '@shared/types/userFeedSubscriptions.types';
import type {ViewType} from '@shared/types/views.types';

import {useEventLogService} from '@sharedClient/services/eventLog.client';
import {ClientFeedItemsService} from '@sharedClient/services/feedItems.client';
import {firebaseService} from '@sharedClient/services/firebase.client';
import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

import {useAsyncState} from '@sharedClient/hooks/asyncState.hooks';
import {useLoggedInAccount} from '@sharedClient/hooks/auth.hooks';
import {useIsMounted} from '@sharedClient/hooks/lifecycle.hooks';
import {useUserFeedSubscriptions} from '@sharedClient/hooks/userFeedSubscriptions.hooks';

const feedItemsStorageRef = storageRef(firebaseService.storage, FEED_ITEMS_STORAGE_COLLECTION);

const feedItemFirestoreConverter = makeFirestoreDataConverter(toStorageFeedItem, parseFeedItem);

export function useFeedItemsService(): ClientFeedItemsService {
  const loggedInAccount = useLoggedInAccount();
  const eventLogService = useEventLogService();

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
      eventLogService,
    });
  }, [loggedInAccount.accountId, eventLogService]);

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

function useFeedItemFile(args: {
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

export function useFeedItemHtml(feedItem: FeedItem): AsyncState<string> {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_HTML});
}

export function useFeedItemMarkdown(feedItem: FeedItem): AsyncState<string> {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_LLM_CONTEXT});
}

export function useFeedItemDefuddleMarkdown(feedItem: FeedItem): AsyncState<string> {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_HTML_MARKDOWN});
}

export function useYouTubeFeedItemTranscript(feedItem: FeedItem): AsyncState<string> {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_TRANSCRIPT});
}

export function useExplainXkcdMarkdown(feedItem: XkcdFeedItem): AsyncState<string> {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_XKCD_EXPLAIN});
}
