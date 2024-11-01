import {deleteField} from 'firebase/firestore';
import {useEffect, useRef} from 'react';

import {logger} from '@shared/lib/logger';
import {useFeedItemIdFromUrl} from '@shared/lib/router';
import {assertNever} from '@shared/lib/utils';
import {feedItemsService} from '@shared/services/feedItemsService';
import {FeedItem, FeedItemId, FeedItemType} from '@shared/types/feedItems';
import {SystemTagId} from '@shared/types/tags';

import {AppHeader} from '@src/components/AppHeader';
import {Text} from '@src/components/atoms/Text';
import {ArticleFeedItemComponent} from '@src/components/feedItems/ArticleFeedItem';
import {TweetFeedItemComponent} from '@src/components/feedItems/TweetFeedItem';
import {VideoFeedItemComponent} from '@src/components/feedItems/VideoFeedItem';
import {WebsiteFeedItemComponent} from '@src/components/feedItems/WebsiteFeedItem';
import {XkcdFeedItemComponent} from '@src/components/feedItems/XkcdFeedItem';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';
import {useFeedItem} from '@src/lib/feedItems';

import {NotFoundScreen} from './404';

const useMarkFeedItemRead = ({
  feedItemId,
  feedItem,
}: {
  readonly feedItemId: FeedItemId;
  readonly feedItem: FeedItem | null;
}) => {
  const wasAlreadyMarkedReadAtMount = useRef(feedItem?.tagIds[SystemTagId.Unread] ?? false);
  const wasMarkedReadOnThisMount = useRef(false);

  // Variables exist so we don't need to include the entire feed item in the deps array.
  const isFeedItemNull = feedItem === null;
  const isFeedItemImported = feedItem ? Boolean(feedItem?.lastImportedTime) : false;

  useEffect(() => {
    async function go() {
      // Don't mark the feed item as read unless it has been imported.
      if (isFeedItemNull || !isFeedItemImported) return;

      // Only mark the feed item as read:
      // 1. if it was not already read at mount, to avoid unnecessary requests.
      // 2. once per mount, to prevent marking read immediately after clicking "Mark unread".
      if (wasAlreadyMarkedReadAtMount.current || wasMarkedReadOnThisMount.current) return;

      try {
        wasMarkedReadOnThisMount.current = true;
        await feedItemsService.updateFeedItem(feedItemId, {
          [`tagIds.${SystemTagId.Unread}`]: deleteField(),
          // TODO: Consider using a Firestore converter to handle this.
          // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      } catch (error) {
        wasMarkedReadOnThisMount.current = false;
        logger.error('Unread manager failed to mark item as read', {error, feedItemId});
        // TODO: Show an error toast.
      }
    }
    go();
  }, [feedItemId, isFeedItemNull, isFeedItemImported]);
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
    logger.error('Error fetching feed item', {error: feedItemError});
    // TODO: Introduce proper error screen.
    return <Text as="p">There was a problem loading the feed item</Text>;
  }

  if (!feedItem) {
    return <NotFoundScreen message="Feed item not found" />;
  }

  switch (feedItem.type) {
    case FeedItemType.Article:
      return <ArticleFeedItemComponent feedItem={feedItem} />;
    case FeedItemType.Video:
      return <VideoFeedItemComponent feedItem={feedItem} />;
    case FeedItemType.Website:
      return <WebsiteFeedItemComponent feedItem={feedItem} />;
    case FeedItemType.Tweet:
      return <TweetFeedItemComponent feedItem={feedItem} />;
    case FeedItemType.Xkcd:
      return <XkcdFeedItemComponent feedItem={feedItem} />;
    default:
      assertNever(feedItem);
  }
};

export const FeedItemScreen: React.FC = () => {
  const feedItemId = useFeedItemIdFromUrl();

  const mainContent = feedItemId ? (
    <FeedItemScreenMainContent feedItemId={feedItemId} />
  ) : (
    <NotFoundScreen message="No feed item ID in URL" />
  );

  return (
    <ScreenWrapper>
      <AppHeader />
      <ScreenMainContentWrapper>
        <LeftSidebar />
        {mainContent}
      </ScreenMainContentWrapper>
    </ScreenWrapper>
  );
};
