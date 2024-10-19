import {useEffect, useState} from 'react';

import {feedItemsService} from '@shared/lib/feedItemsServiceInstance';
import {FeedItem, FeedItemId} from '@shared/types/core';
import {ViewType} from '@shared/types/query';

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

  useEffect(() => {
    const unsubscribe = feedItemsService.watchFeedItemsQuery(
      viewType,
      (feedItems) => {
        setState({feedItems, isLoading: false, error: null});
      },
      (error) => setState({feedItems: [], isLoading: false, error})
    );
    return () => unsubscribe();
  }, [viewType]);

  return state;
}
