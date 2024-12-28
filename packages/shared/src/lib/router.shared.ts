import {useParams} from 'react-router-dom';

import type {FeedItemId} from '@shared/types/feedItems.types';
import {parseFeedItemId} from '@shared/types/feedItems.types';
import type {FeedItemScreenParams} from '@shared/types/urls.types';

export const useFeedItemIdFromUrl = (): FeedItemId | null => {
  const {feedItemId} = useParams<FeedItemScreenParams>();
  if (!feedItemId) return null;

  const feedItemIdResult = parseFeedItemId(feedItemId);
  if (!feedItemIdResult.success) return null;
  return feedItemIdResult.value;
};
