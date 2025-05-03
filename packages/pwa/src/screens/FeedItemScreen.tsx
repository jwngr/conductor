import {deleteField} from 'firebase/firestore';
import {useEffect, useRef} from 'react';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import type {FeedItem, FeedItemId} from '@shared/types/feedItems.types';
import {FeedItemType} from '@shared/types/feedItems.types';
import {SystemTagId} from '@shared/types/tags.types';

import {useFeedItem, useFeedItemsService} from '@sharedClient/services/feedItems.client';

import {AppHeader} from '@src/components/AppHeader';
import {Text} from '@src/components/atoms/Text';
import {RegisterIndividualFeedItemDevToolbarSection} from '@src/components/devToolbar/RegisterIndividualFeedItemSection';
import {FeedItemScreenKeyboardHandler} from '@src/components/feedItems/FeedItemScreenEscapeHandler';
import {ArticleFeedItemRenderer} from '@src/components/feedItems/renderers/ArticleFeedItemRenderer';
import {TweetFeedItemRenderer} from '@src/components/feedItems/renderers/TweetFeedItemRenderer';
import {VideoFeedItemRenderer} from '@src/components/feedItems/renderers/VideoFeedItemRenderer';
import {WebsiteFeedItemRenderer} from '@src/components/feedItems/renderers/WebsiteFeedItemRenderer';
import {XkcdFeedItemRenderer} from '@src/components/feedItems/renderers/XkcdFeedItemRenderer';
import {YouTubeFeedItemRenderer} from '@src/components/feedItems/renderers/YouTubeFeedItemRenderer';
import {LeftSidebar} from '@src/components/nav/LeftSidebar';

import {useFeedItemIdFromUrl} from '@src/lib/router.pwa';

import {NotFoundScreen} from '@src/screens/404';

const useMarkFeedItemRead = (args: {
  readonly feedItemId: FeedItemId;
  readonly feedItem: FeedItem | null;
}): void => {
  const {feedItemId, feedItem} = args;

  const feedItemsService = useFeedItemsService();

  const wasAlreadyMarkedReadAtMount = useRef(
    feedItem ? !SharedFeedItemHelpers.isUnread(feedItem) : false
  );
  const wasMarkedReadOnThisMount = useRef(false);

  // Variables exist so we don't need to include the entire feed item in the deps array.
  const isFeedItemNull = feedItem === null;
  const hasFeedItemBeenImported = isFeedItemNull
    ? false
    : SharedFeedItemHelpers.hasEverBeenImported(feedItem);

  useEffect(() => {
    async function go(): Promise<void> {
      // Don't mark the feed item as read unless it has been imported.
      if (isFeedItemNull || !hasFeedItemBeenImported) return;

      // Only mark the feed item as read:
      // 1. if it was not already read at mount, to avoid unnecessary requests.
      // 2. once per mount, to prevent marking read immediately after clicking "Mark unread".
      if (wasAlreadyMarkedReadAtMount.current || wasMarkedReadOnThisMount.current) return;

      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      const markFeedItemAsReadResult = await feedItemsService.updateFeedItem(feedItemId, {
        [`tagIds.${SystemTagId.Unread}`]: deleteField(),
      } as Partial<FeedItem>);

      if (markFeedItemAsReadResult.success) {
        wasMarkedReadOnThisMount.current = true;
      } else {
        wasMarkedReadOnThisMount.current = false;
        logger.error(
          prefixError(markFeedItemAsReadResult.error, 'Unread manager failed to mark item as read'),
          {feedItemId}
        );
        // TODO: Show an error toast.
      }
    }

    void go();
  }, [feedItemId, isFeedItemNull, feedItemsService, hasFeedItemBeenImported]);
};

const FeedItemScreenMainContent: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const {feedItem, isLoading: isItemLoading, error: feedItemError} = useFeedItem(feedItemId);

  useMarkFeedItemRead({feedItem, feedItemId});

  if (isItemLoading) {
    // TODO: Introduce proper loading state.
    return <div>Loading...</div>;
  }

  if (feedItemError) {
    logger.error(prefixError(feedItemError, 'Error fetching feed item'));
    // TODO: Introduce proper error screen.
    return <Text as="p">Something went wrong while loading this item</Text>;
  }

  if (!feedItem) {
    return <NotFoundScreen message="Feed item not found" />;
  }

  let feedItemContent: React.ReactNode;
  switch (feedItem.type) {
    case FeedItemType.Article:
      feedItemContent = <ArticleFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemType.Video:
      feedItemContent = <VideoFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemType.Website:
      feedItemContent = <WebsiteFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemType.Tweet:
      feedItemContent = <TweetFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemType.Xkcd:
      feedItemContent = <XkcdFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemType.YouTube:
      feedItemContent = <YouTubeFeedItemRenderer feedItem={feedItem} />;
      break;
    default:
      assertNever(feedItem);
  }

  return (
    <>
      {feedItemContent}
      <RegisterIndividualFeedItemDevToolbarSection feedItem={feedItem} />
    </>
  );
};

export const FeedItemScreen: React.FC = () => {
  const feedItemId = useFeedItemIdFromUrl();

  const mainContent = feedItemId ? (
    <FeedItemScreenMainContent feedItemId={feedItemId} />
  ) : (
    <NotFoundScreen message="No feed item ID in URL" />
  );

  return (
    <div className="flex h-full w-full flex-col">
      <AppHeader />
      <div className="flex flex-1 items-stretch overflow-hidden">
        <LeftSidebar />
        {mainContent}
      </div>
      <FeedItemScreenKeyboardHandler />
    </div>
  );
};
