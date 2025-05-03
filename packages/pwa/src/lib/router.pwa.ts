import {parseFeedItemId} from '@shared/parsers/feedItems.parser';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {StoriesSidebarSectionId} from '@shared/types/stories.types';

import {feedItemRoute, storiesRoute} from '@src/routes/index';

export const useFeedItemIdFromUrl = (): FeedItemId | null => {
  const {feedItemId: feedItemIdFromUrl} = feedItemRoute.useParams();

  if (!feedItemIdFromUrl) return null;

  const feedItemIdResult = parseFeedItemId(feedItemIdFromUrl);
  if (!feedItemIdResult.success) return null;
  return feedItemIdResult.value;
};

export const useStoriesIdsFromUrl = (): {
  storiesSidebarSectionId: StoriesSidebarSectionId;
  sidebarItemId: string;
} | null => {
  const {storiesSidebarSectionId, sidebarItemId} = storiesRoute.useParams();

  if (!storiesSidebarSectionId || !sidebarItemId) return null;

  return {storiesSidebarSectionId, sidebarItemId};
};
