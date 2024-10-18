import {useParams} from 'react-router-dom';

import {FeedItemId} from '@shared/types/core';
import {FeedItemScreenParams} from '@shared/types/urls';

export const useFeedItemIdFromUrl = (): FeedItemId | undefined => {
  const {feedItemId} = useParams<FeedItemScreenParams>();
  return feedItemId;
};
