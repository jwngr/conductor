import {deleteField} from 'firebase/firestore';
import {useEffect, useRef} from 'react';
import styled from 'styled-components';

import {feedItemsService} from '@shared/lib/feedItemsServiceInstance';
import {useFeedItemIdFromUrl} from '@shared/lib/router';
import {FeedItemId} from '@shared/types/core';
import {SystemTagId} from '@shared/types/tags';

import {AppHeader} from '@src/components/AppHeader';
import {FlexColumn, FlexRow} from '@src/components/atoms/Flex';
import {Text} from '@src/components/atoms/Text';
import {
  MarkDoneFeedItemActionIcon,
  MarkUnreadFeedItemActionIcon,
  SaveFeedItemActionIcon,
  StarFeedItemActionIcon,
} from '@src/components/feedItems/FeedItemActionIcon';
import {ScreenMainContentWrapper, ScreenWrapper} from '@src/components/layout/Screen';
import {LeftSidebar} from '@src/components/LeftSidebar';
import {Markdown} from '@src/components/Markdown';
import {useFeedItem, useFeedItemMarkdown} from '@src/lib/feedItems';
import {logger} from '@src/lib/logger';

import {NotFoundScreen} from './404';

const FeedItemActionsWrapper = styled(FlexRow).attrs({gap: 12})``;

const FeedItemScreenMainContentWrapper = styled(FlexColumn).attrs({gap: 12})`
  flex: 1;
  overflow: auto;
  padding: 20px;
`;

const FeedItemScreenMainContent: React.FC<{
  readonly feedItemId: FeedItemId;
}> = ({feedItemId}) => {
  const alreadyMarkedRead = useRef(false);
  const {feedItem, isLoading: isItemLoading, error: feedItemError} = useFeedItem(feedItemId);
  const isFeedItemImported = Boolean(feedItem?.lastImportedTime);
  const {
    markdown,
    isLoading: isMarkdownLoading,
    error: markdownError,
  } = useFeedItemMarkdown(feedItemId, isFeedItemImported);

  useEffect(() => {
    // Don't mark the feed item as read if it hasn't been imported yet.
    if (feedItem === null || !isFeedItemImported) return;

    // Only mark the feed item as read once. This prevents the feed item from being marked as read
    // immediately after the user clicks the "Mark unread" button.
    if (alreadyMarkedRead.current) return;
    alreadyMarkedRead.current = true;

    feedItemsService.updateFeedItem(feedItemId, {
      [`tagIds.${SystemTagId.Unread}`]: deleteField(),
      // TODO: Consider using a Firestore converter to handle this.
      // See https://cloud.google.com/firestore/docs/manage-data/add-data#custom_objects.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }, [feedItem, feedItemId, isFeedItemImported]);

  if (isItemLoading) {
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

  if (markdownError) {
    logger.error('Error fetching markdown', {error: markdownError});
    // TODO: Introduce proper error screen.
    return <Text as="p">There was a problem loading the content: {markdownError.message}</Text>;
  }

  return (
    <FeedItemScreenMainContentWrapper>
      <Text as="h1" bold>
        {feedItem.title}
      </Text>
      <FeedItemActionsWrapper>
        <MarkDoneFeedItemActionIcon feedItemId={feedItemId} />
        <SaveFeedItemActionIcon feedItemId={feedItemId} />
        <MarkUnreadFeedItemActionIcon feedItemId={feedItemId} />
        <StarFeedItemActionIcon feedItemId={feedItemId} />
      </FeedItemActionsWrapper>

      <pre>{JSON.stringify(feedItem, null, 2)}</pre>
      <br />
      <hr />
      <br />
      {isMarkdownLoading ? (
        <div>Loading markdown...</div>
      ) : markdown ? (
        <Markdown content={markdown} />
      ) : (
        <div>No markdown</div>
      )}
    </FeedItemScreenMainContentWrapper>
  );
};

export const FeedItemScreen: React.FC = () => {
  const feedItemId = useFeedItemIdFromUrl();

  return (
    <ScreenWrapper>
      <AppHeader />
      <ScreenMainContentWrapper>
        <LeftSidebar />
        {feedItemId ? (
          <FeedItemScreenMainContent feedItemId={feedItemId} />
        ) : (
          <NotFoundScreen message="No feed item ID in URL" />
        )}
      </ScreenMainContentWrapper>
    </ScreenWrapper>
  );
};
