import {deleteField} from 'firebase/firestore';
import {useEffect, useRef} from 'react';
import {toast} from 'sonner';

import {logger} from '@shared/services/logger.shared';

import {prefixError} from '@shared/lib/errorUtils.shared';
import {SharedFeedItemHelpers} from '@shared/lib/feedItems.shared';
import {assertNever} from '@shared/lib/utils.shared';

import {AsyncStatus} from '@shared/types/asyncState.types';
import type {FeedItem, FeedItemId} from '@shared/types/feedItems.types';
import {FeedItemContentType} from '@shared/types/feedItems.types';
import {SystemTagId} from '@shared/types/tags.types';

import {
  DEFAULT_ROUTE_HERO_PAGE_ACTION,
  REFRESH_HERO_PAGE_ACTION,
} from '@sharedClient/lib/heroActions.client';

import {useFeedItem, useFeedItemsService} from '@sharedClient/hooks/feedItems.hooks';

import {RegisterIndividualFeedItemDevToolbarSection} from '@src/components/devToolbar/RegisterIndividualFeedItemSection';
import {ErrorArea} from '@src/components/errors/ErrorArea';
import {FeedItemScreenKeyboardHandler} from '@src/components/feedItems/FeedItemScreenEscapeHandler';
import {ArticleFeedItemRenderer} from '@src/components/feedItems/renderers/ArticleFeedItemRenderer';
import {IntervalFeedItemRenderer} from '@src/components/feedItems/renderers/IntervalFeedItemRenderer';
import {TweetFeedItemRenderer} from '@src/components/feedItems/renderers/TweetFeedItemRenderer';
import {VideoFeedItemRenderer} from '@src/components/feedItems/renderers/VideoFeedItemRenderer';
import {WebsiteFeedItemRenderer} from '@src/components/feedItems/renderers/WebsiteFeedItemRenderer';
import {XkcdFeedItemRenderer} from '@src/components/feedItems/renderers/XkcdFeedItemRenderer';
import {YouTubeFeedItemRenderer} from '@src/components/feedItems/renderers/YouTubeFeedItemRenderer';
import {LoadingArea} from '@src/components/loading/LoadingArea';

import {useFeedItemIdFromUrl} from '@src/lib/router.pwa';

import {NotFoundScreen} from '@src/screens/404';
import {Screen} from '@src/screens/Screen';

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
        toast.error('Failed to mark item as read');
      }
    }

    void go();
  }, [feedItemId, isFeedItemNull, feedItemsService, hasFeedItemBeenImported]);
};

const LoadedFeedItemScreenContent: React.FC<{
  readonly feedItem: FeedItem;
}> = ({feedItem}) => {
  useMarkFeedItemRead({feedItem, feedItemId: feedItem.feedItemId});

  let feedItemContent: React.ReactNode;
  switch (feedItem.feedItemContentType) {
    case FeedItemContentType.Article:
      feedItemContent = <ArticleFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemContentType.Video:
      feedItemContent = <VideoFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemContentType.Website:
      feedItemContent = <WebsiteFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemContentType.Tweet:
      feedItemContent = <TweetFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemContentType.Xkcd:
      feedItemContent = <XkcdFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemContentType.YouTube:
      feedItemContent = <YouTubeFeedItemRenderer feedItem={feedItem} />;
      break;
    case FeedItemContentType.Interval:
      feedItemContent = <IntervalFeedItemRenderer feedItem={feedItem} />;
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

const FeedItemScreenContent: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const feedItemState = useFeedItem(feedItemId);

  switch (feedItemState.status) {
    case AsyncStatus.Idle:
    case AsyncStatus.Pending:
      return <LoadingArea text="Loading feed item..." />;
    case AsyncStatus.Error: {
      const betterError = prefixError(feedItemState.error, 'Failed to load feed item');
      logger.error(betterError, {feedItemId});
      return (
        <ErrorArea
          error={feedItemState.error}
          title="Failed to load feed item"
          subtitle="Refreshing may resolve the issue. If the problem persists, please contact support."
          actions={[DEFAULT_ROUTE_HERO_PAGE_ACTION, REFRESH_HERO_PAGE_ACTION]}
        />
      );
    }
    case AsyncStatus.Success:
      if (!feedItemState.value) {
        return <NotFoundScreen title="Feed item not found" subtitle={undefined} />;
      }
      return <LoadedFeedItemScreenContent feedItem={feedItemState.value} />;
    default:
      assertNever(feedItemState);
  }
};

export const FeedItemScreen: React.FC = () => {
  const feedItemId = useFeedItemIdFromUrl();

  if (!feedItemId) {
    return (
      <NotFoundScreen
        title="Feed item ID missing"
        subtitle="Make sure the URL includes a valid feed item ID"
      />
    );
  }

  return (
    <Screen withHeader withLeftSidebar>
      <FeedItemScreenContent feedItemId={feedItemId} />
      <FeedItemScreenKeyboardHandler />
    </Screen>
  );
};
