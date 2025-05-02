import {parseFeedItemId} from '@shared/parsers/feedItems.parser';

import type {FeedItemId} from '@shared/types/feedItems.types';

import {feedItemRoute} from '@src/routes/index';

export const useFeedItemIdFromUrl = (): FeedItemId | null => {
  const {feedItemId} = feedItemRoute.useParams();

  if (!feedItemId) return null;

  const feedItemIdResult = parseFeedItemId(feedItemId);
  if (!feedItemIdResult.success) return null;
  return feedItemIdResult.value;
};
