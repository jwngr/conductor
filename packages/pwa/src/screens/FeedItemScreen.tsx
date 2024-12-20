import {deleteField} from 'firebase/firestore';
import {useEffect, useRef, useState} from 'react';

import {FeedItemsService} from '@shared/lib/feedItems';
import {logger} from '@shared/lib/logger';
import {useFeedItemIdFromUrl} from '@shared/lib/router';
import {assertNever} from '@shared/lib/utils';

import {FeedItem, FeedItemId, FeedItemType} from '@shared/types/feedItems.types';
import {SystemTagId} from '@shared/types/tags.types';

import {useDevToolbarStore} from '@shared/stores/DevToolbarStore';

import {AppHeader} from '@src/components/AppHeader';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@src/components/atoms/Dialog';
import {Text} from '@src/components/atoms/Text';
import {ArticleFeedItemComponent} from '@src/components/feedItems/ArticleFeedItem';
import {TweetFeedItemComponent} from '@src/components/feedItems/TweetFeedItem';
import {VideoFeedItemComponent} from '@src/components/feedItems/VideoFeedItem';
import {WebsiteFeedItemComponent} from '@src/components/feedItems/WebsiteFeedItem';
import {XkcdFeedItemComponent} from '@src/components/feedItems/XkcdFeedItem';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';

import {useFeedItem, useFeedItemsService} from '@src/lib/feedItems.pwa';

import {NotFoundScreen} from '@src/screens/404';

const useMarkFeedItemRead = (args: {
  readonly feedItemId: FeedItemId;
  readonly feedItem: FeedItem | null;
}) => {
  const {feedItemId, feedItem} = args;

  const feedItemsService = useFeedItemsService();

  const wasAlreadyMarkedReadAtMount = useRef(!FeedItemsService.isUnread(feedItem));
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

      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      const markFeedItemAsReadResult = await feedItemsService.updateFeedItem(feedItemId, {
        [`tagIds.${SystemTagId.Unread}`]: deleteField(),
      } as Partial<FeedItem>);

      if (markFeedItemAsReadResult.success) {
        wasMarkedReadOnThisMount.current = true;
      } else {
        wasMarkedReadOnThisMount.current = false;
        logger.error('Unread manager failed to mark item as read', {
          error: markFeedItemAsReadResult.error,
          feedItemId,
        });
        // TODO: Show an error toast.
      }
    }
    go();
  }, [feedItemId, isFeedItemNull, isFeedItemImported, feedItemsService]);
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

  let feedItemContent: React.ReactNode;
  switch (feedItem.type) {
    case FeedItemType.Article:
      feedItemContent = <ArticleFeedItemComponent feedItem={feedItem} />;
      break;
    case FeedItemType.Video:
      feedItemContent = <VideoFeedItemComponent feedItem={feedItem} />;
      break;
    case FeedItemType.Website:
      feedItemContent = <WebsiteFeedItemComponent feedItem={feedItem} />;
      break;
    case FeedItemType.Tweet:
      feedItemContent = <TweetFeedItemComponent feedItem={feedItem} />;
      break;
    case FeedItemType.Xkcd:
      feedItemContent = <XkcdFeedItemComponent feedItem={feedItem} />;
      break;
    default:
      assertNever(feedItem);
  }

  return (
    <>
      {feedItemContent}
      <RegisterFeedItemScreenDevToolbarActions feedItem={feedItem} />
    </>
  );
};

const RegisterFeedItemScreenDevToolbarActions: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const registerAction = useDevToolbarStore((state) => state.registerAction);

  useEffect(() => {
    return registerAction({
      actionId: 'VIEW_FEED_ITEM_JSON',
      text: 'View feed item as JSON',
      onClick: () => setIsDialogOpen(true),
    });
  }, [registerAction]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feed item JSON</DialogTitle>
        </DialogHeader>
        <pre style={{overflow: 'auto', maxHeight: '60vh'}}>{JSON.stringify(feedItem, null, 2)}</pre>
      </DialogContent>
    </Dialog>
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
    <ScreenWrapper>
      <AppHeader />
      <ScreenMainContentWrapper>
        <LeftSidebar />
        {mainContent}
      </ScreenMainContentWrapper>
    </ScreenWrapper>
  );
};
