import {useParams} from 'react-router-dom';

import type {FeedItemId} from '@shared/types/feedItems.types';
import {isFeedItemId} from '@shared/types/feedItems.types';
import type {FeedItemScreenParams} from '@shared/types/urls.types';

export const useFeedItemIdFromUrl = (): FeedItemId | undefined => {
  const {feedItemId} = useParams<FeedItemScreenParams>();
  return isFeedItemId(feedItemId) ? feedItemId : undefined;
};
