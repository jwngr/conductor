import React from 'react';
import styled from 'styled-components';

import {FeedItem} from '@shared/types/core';
import {ViewType} from '@shared/types/query';
import {ThemeColor} from '@shared/types/theme';

import {useFeedItems} from '../lib/feedItems';
import {FlexColumn} from './atoms/Flex';
import {Link} from './atoms/Link';
import {Text} from './atoms/Text';

const ViewListItemWrapper = styled(FlexColumn).attrs({justify: 'center', gap: 4})`
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;

  &:hover {
    background-color: ${({theme}) => theme.colors[ThemeColor.Neutral100]};
  }
`;

const ViewListItem: React.FC<{feedItem: FeedItem}> = ({feedItem}) => {
  return (
    <Link to={`/items/${feedItem.itemId}`}>
      <ViewListItemWrapper key={feedItem.itemId}>
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
    return <div>Error: {error.message}</div>;
  }

  if (feedItems.length === 0) {
    return <div>No items</div>;
  }

  return (
    <ul>
      {feedItems.map((feedItem) => (
        <ViewListItem key={feedItem.itemId} feedItem={feedItem} />
      ))}
    </ul>
  );
};

export const View: React.FC<{viewType: ViewType}> = ({viewType}) => {
  return (
    <div>
      <h2>{viewType}</h2>
      <ViewList viewType={viewType} />
    </div>
  );
};
