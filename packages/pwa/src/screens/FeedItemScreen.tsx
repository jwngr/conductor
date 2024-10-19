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
import {useFeedItem} from '@src/lib/feedItems';

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
  const {feedItem, isLoading, error} = useFeedItem(feedItemId);

  useEffect(() => {
    if (feedItem === null) return;

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
  }, [feedItem, feedItemId, alreadyMarkedRead]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // TODO: Introduce proper error screen.
    return <div>Error: {error.message}</div>;
  }

  if (!feedItem) {
    return <NotFoundScreen message="Feed item not found" />;
  }

  return (
    <FeedItemScreenMainContentWrapper>
      <Text as="h1" bold>
        Feed item {feedItemId}
      </Text>
      <FeedItemActionsWrapper>
        <MarkDoneFeedItemActionIcon feedItemId={feedItemId} />
        <SaveFeedItemActionIcon feedItemId={feedItemId} />
        <MarkUnreadFeedItemActionIcon feedItemId={feedItemId} />
        <StarFeedItemActionIcon feedItemId={feedItemId} />
      </FeedItemActionsWrapper>
      <pre>{JSON.stringify(feedItem, null, 2)}</pre>
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
