import {useEffect, useState} from 'react';

import {feedItemsService} from '@shared/services/feedItemsService';

import {FeedItem, FeedItemId} from '@shared/types/feedItems';
import {ViewType} from '@shared/types/query';

import {useLoggedInUser} from '@src/lib/users';

export function useFeedItem(feedItemId: FeedItemId): {
  readonly feedItem: FeedItem | null;
  readonly isLoading: boolean;
  readonly error: Error | null;
} {
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
  }, [feedItemId]);

  return state;
}

export function useFeedItems({viewType}: {readonly viewType: ViewType}): {
  readonly feedItems: FeedItem[];
  readonly isLoading: boolean;
  readonly error: Error | null;
} {
  const [state, setState] = useState<{
    readonly feedItems: FeedItem[];
    readonly isLoading: boolean;
    readonly error: Error | null;
  }>({feedItems: [], isLoading: true, error: null});
  const loggedInUser = useLoggedInUser();

  useEffect(() => {
    const unsubscribe = feedItemsService.watchFeedItemsQuery({
      viewType,
      userId: loggedInUser.userId,
      successCallback: (feedItems) => setState({feedItems, isLoading: false, error: null}),
      errorCallback: (error) => setState({feedItems: [], isLoading: false, error}),
    });
    return () => unsubscribe();
  }, [viewType, loggedInUser.userId]);

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

      try {
        const markdown = await feedItemsService.getFeedItemMarkdown(feedItemId);
        if (isMounted) {
          setState({markdown, isLoading: false, error: null});
        }
      } catch (error) {
        // We can safely cast to Error because the feedItemsService throws an Error.
        if (isMounted) {
          setState({markdown: null, isLoading: false, error: error as Error});
        }
      }
    }
    go();

    return () => {
      isMounted = false;
    };
  }, [feedItemId, isFeedItemImported]);

  return state;
}
