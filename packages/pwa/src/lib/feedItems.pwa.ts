import {collection} from 'firebase/firestore';
import {ref as storageRef} from 'firebase/storage';
import {useEffect, useMemo, useState} from 'react';

import {
  FEED_ITEMS_DB_COLLECTION,
  FEED_ITEMS_STORAGE_COLLECTION,
  IMPORT_QUEUE_DB_COLLECTION,
} from '@shared/lib/constants';
import {FeedItemsService} from '@shared/lib/feedItems';

import {FeedItem, FeedItemId} from '@shared/types/feedItems.types';
import {ViewType} from '@shared/types/query.types';

import {useLoggedInUser} from '@shared/hooks/auth.hooks';

import {firebaseService} from '@sharedClient/lib/firebase.client';

const feedItemsDbRef = collection(firebaseService.firestore, FEED_ITEMS_DB_COLLECTION);
const importQueueDbRef = collection(firebaseService.firestore, IMPORT_QUEUE_DB_COLLECTION);
const feedItemsStorageRef = storageRef(firebaseService.storage, FEED_ITEMS_STORAGE_COLLECTION);

export function useFeedItemsService(): FeedItemsService {
  const loggedInUser = useLoggedInUser();

  const feedItemsService = useMemo(() => {
    return new FeedItemsService(
      feedItemsDbRef,
      importQueueDbRef,
      feedItemsStorageRef,
      loggedInUser.userId
    );
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
