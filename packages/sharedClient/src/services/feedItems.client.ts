import {where} from 'firebase/firestore';
import type {StorageReference} from 'firebase/storage';
import {getBlob, ref as storageRef} from 'firebase/storage';
import {useEffect, useMemo, useState} from 'react';

import {logger} from '@shared/services/logger.shared';

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
import {omitUndefined} from '@shared/lib/utils.shared';
import {Views} from '@shared/lib/views.shared';

import {parseFeedItem, parseFeedItemId, toStorageFeedItem} from '@shared/parsers/feedItems.parser';

import type {AccountId, AuthStateChangedUnsubscribe} from '@shared/types/accounts.types';
import type {DeliverySchedule} from '@shared/types/deliverySchedules.types';
import type {
  FeedItem,
  FeedItemId,
  FeedItemSource,
  XkcdFeedItem,
} from '@shared/types/feedItems.types';
import {FeedItemSourceType} from '@shared/types/feedItems.types';
import {fromQueryFilterOp} from '@shared/types/query.types';
import type {AsyncResult} from '@shared/types/results.types';
import type {Consumer} from '@shared/types/utils.types';
import {ViewType} from '@shared/types/views.types';

import {firebaseService} from '@sharedClient/services/firebase.client';
import {
  ClientFirestoreCollectionService,
  makeFirestoreDataConverter,
} from '@sharedClient/services/firestore.client';

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

/**
 * Filters out feed items with delivery schedules that prevent them from being shown.
 */
function filterFeedItemsByDeliverySchedules(args: {
  readonly feedItems: FeedItem[];
  readonly deliverySchedules: DeliverySchedule[];
}): FeedItem[] {
  const {feedItems, deliverySchedules} = args;

  return feedItems.filter((feedItem) => {
    switch (feedItem.feedItemSource.type) {
      case FeedItemSourceType.App:
      case FeedItemSourceType.Extension:
      case FeedItemSourceType.PocketExport:
        // These sources are always shown.
        return true;
      case FeedItemSourceType.RSS: {
        // Some sources have delivery schedules which determine when they are shown.
        const matchingDeliverySchedule = findDeliveryScheduleForFeedSubscription({
          userFeedSubscriptionId: feedItem.feedItemSource.userFeedSubscriptionId,
          deliverySchedules,
        });

        return isDeliveredAccordingToSchedule({
          createdTime: feedItem.createdTime,
          deliverySchedule: matchingDeliverySchedule,
        });
      }
      default:
        return false;
    }
  });
}

interface FeedItemsState {
  readonly feedItems: FeedItem[];
  readonly isLoading: boolean;
  readonly error: Error | null;
}

const INITIAL_FEED_ITEMS_STATE: FeedItemsState = {
  feedItems: [],
  isLoading: true,
  error: null,
} as const;

const useDeliverySchedules = (): DeliverySchedule[] => {
  // TODO: Fetch all of these.
  return [];
};

export function useFeedItems({viewType}: {readonly viewType: ViewType}): FeedItemsState {
  const feedItemsService = useFeedItemsService();
  const deliverySchedules = useDeliverySchedules();

  const [state, setState] = useState<FeedItemsState>(INITIAL_FEED_ITEMS_STATE);

  useEffect(() => {
    const unsubscribe = feedItemsService.watchFeedItemsQuery({
      viewType,
      successCallback: (feedItems) => {
        let filteredFeedItems: FeedItem[];
        switch (viewType) {
          case ViewType.All:
          case ViewType.Done:
          case ViewType.Saved:
          case ViewType.Starred:
          case ViewType.Today:
          case ViewType.Trashed:
          case ViewType.Unread:
            filteredFeedItems = feedItems;
            break;
          case ViewType.Untriaged:
            filteredFeedItems = filterFeedItemsByDeliverySchedules({feedItems, deliverySchedules});
            break;
        }
        setState({feedItems: filteredFeedItems, isLoading: false, error: null});
      },
      errorCallback: (error) => {
        setState({feedItems: [], isLoading: false, error});
      },
    });
    return () => unsubscribe();
  }, [viewType, feedItemsService, deliverySchedules]);

  return state;
}

interface UseFeedItemFileResult {
  readonly content: string | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
}

const INITIAL_USE_FEED_ITEM_FILE_STATE: UseFeedItemFileResult = {
  content: null,
  isLoading: true,
  error: null,
};

export function useFeedItemFile(args: {
  readonly feedItem: FeedItem;
  readonly filename: string;
}): UseFeedItemFileResult {
  const {feedItem, filename} = args;
  const feedItemId = feedItem.feedItemId;
  const hasFeedItemEverBeenImported = SharedFeedItemHelpers.hasEverBeenImported(feedItem);

  const isMounted = useIsMounted();
  const feedItemsService = useFeedItemsService();
  const [state, setState] = useState(INITIAL_USE_FEED_ITEM_FILE_STATE);

  useEffect(() => {
    async function go(): Promise<void> {
      if (!hasFeedItemEverBeenImported) {
        const error = new Error('Cannot fetch file for feed item that has never been imported');
        logger.error(error, {feedItemId, filename});
        setState({content: null, isLoading: false, error});
        return;
      }

      const contentsResult = await feedItemsService.getFileFromStorage({feedItemId, filename});

      if (!isMounted.current) return;

      if (contentsResult.success) {
        setState({content: contentsResult.value, isLoading: false, error: null});
      } else {
        setState({content: null, isLoading: false, error: contentsResult.error});
      }
    }

    void go();
  }, [feedItemId, filename, hasFeedItemEverBeenImported, feedItemsService, isMounted]);

  return state;
}

export function useFeedItemMarkdown(feedItem: FeedItem): UseFeedItemFileResult {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_NAME_LLM_CONTEXT});
}

export function useYouTubeFeedItemTranscript(feedItem: FeedItem): UseFeedItemFileResult {
  return useFeedItemFile({feedItem, filename: FEED_ITEM_FILE_NAME_TRANSCRIPT});
}

export function useExplainXkcdMarkdown(feedItem: XkcdFeedItem): UseFeedItemFileResult {
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

  public async createFeedItem(args: {
    readonly url: string;
    readonly feedItemSource: FeedItemSource;
    readonly title: string;
  }): AsyncResult<FeedItem> {
    const {url, feedItemSource, title} = args;

    const trimmedUrl = url.trim();
    if (!isValidUrl(trimmedUrl)) {
      return makeErrorResult(new Error(`Invalid URL provided for feed item: "${url}"`));
    }

    const feedItemResult = SharedFeedItemHelpers.makeFeedItem({
      url: trimmedUrl,
      feedItemSource,
      accountId: this.accountId,
      title,
      description: null,
    });
    if (!feedItemResult.success) return feedItemResult;
    const feedItem = feedItemResult.value;

    const addFeedItemResult = await this.feedItemsCollectionService.setDoc(
      feedItem.feedItemId,
      feedItem
    );
    if (!addFeedItemResult.success) {
      return makeErrorResult(addFeedItemResult.error);
    }

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
