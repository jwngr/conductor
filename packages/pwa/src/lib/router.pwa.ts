import {toast} from 'sonner';

import {findStoriesSidebarItemById} from '@shared/lib/stories.shared';

import {parseFeedItemId} from '@shared/parsers/feedItems.parser';
import {parseStoriesSidebarItemId} from '@shared/parsers/stories.parser';

import type {FeedItemId} from '@shared/types/feedItems.types';
import type {StoriesSidebarItem} from '@shared/types/stories.types';

import {feedItemRoute, storiesRoute} from '@src/routes/index';

export const useFeedItemIdFromUrl = (): FeedItemId | null => {
  const {feedItemId: feedItemIdFromUrl} = feedItemRoute.useParams();

  if (!feedItemIdFromUrl) return null;

  const feedItemIdResult = parseFeedItemId(feedItemIdFromUrl);
  if (!feedItemIdResult.success) return null;
  return feedItemIdResult.value;
};

export const useSelectedStoryFromUrl = (): StoriesSidebarItem | null => {
  const {sidebarItemId: sidebarItemIdFromUrl} = storiesRoute.useParams();

  if (!sidebarItemIdFromUrl) return null;

  const sidebarItemIdResult = parseStoriesSidebarItemId(sidebarItemIdFromUrl);
  if (!sidebarItemIdResult.success) {
    toast.error('Unexpected story ID', {
      description: sidebarItemIdFromUrl,
    });
    return null;
  }

  return findStoriesSidebarItemById(sidebarItemIdResult.value);
};
