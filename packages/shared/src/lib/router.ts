import {useParams} from 'react-router-dom';

import {FeedItemId, isFeedItemId} from '@shared/types/feedItems';
import {FeedItemScreenParams} from '@shared/types/urls';

export const useFeedItemIdFromUrl = (): FeedItemId | undefined => {
  const {feedItemId} = useParams<FeedItemScreenParams>();
  return isFeedItemId(feedItemId) ? feedItemId : undefined;
};
