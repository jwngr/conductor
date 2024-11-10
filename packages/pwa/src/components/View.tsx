import React from 'react';
import styled from 'styled-components';

import {logger} from '@shared/lib/logger';
import {Urls} from '@shared/lib/urls';

import {FeedItem} from '@shared/types/feedItems.types';
import {ViewType} from '@shared/types/query.types';
import {ThemeColor} from '@shared/types/theme.types';

import {FlexColumn} from '@src/components/atoms/Flex';
import {Link} from '@src/components/atoms/Link';
import {Text} from '@src/components/atoms/Text';
import {FeedItemAdder} from '@src/components/feedItems/FeedItemAdder';

import {useFeedItems} from '@src/lib/feedItems.pwa';

const ViewListItemWrapper = styled(FlexColumn).attrs({justify: 'center', gap: 4})`
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;

  &:hover {
    background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
  }
`;

const ViewListItem: React.FC<{readonly feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <Link to={Urls.forFeedItem(feedItem.feedItemId)}>
      <ViewListItemWrapper key={feedItem.feedItemId}>
        <Text as="p" bold>
          {feedItem.title || 'No title'}
        </Text>
        <Text as="p" light>
          {feedItem.url}
        </Text>
      </ViewListItemWrapper>
    </Link>
  );
};

const ViewList: React.FC<{viewType: ViewType}> = ({viewType}) => {
  const {feedItems, isLoading, error} = useFeedItems({viewType});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    // TODO: Introduce proper error screen.
    logger.error('Error loading feed items', {error, viewType});
    return <div>Error: {error.message}</div>;
  }

  if (feedItems.length === 0) {
    return <div>No items</div>;
  }

  return (
    <ul>
      {feedItems.map((feedItem) => (
        <ViewListItem key={feedItem.feedItemId} feedItem={feedItem} />
      ))}
    </ul>
  );
};

const ViewWrapper = styled(FlexColumn)`
  flex: 1;
  padding: 20px;
  overflow: auto;
`;

export const View: React.FC<{viewType: ViewType}> = ({viewType}) => {
  return (
    <ViewWrapper>
      <h2>{viewType}</h2>
      <ViewList viewType={viewType} />
      {/* TODO: Move into developer toolbar. */}
      <FeedItemAdder />
    </ViewWrapper>
  );
};
